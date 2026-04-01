import fs from 'node:fs/promises';
import path from 'node:path';
type PrismaClient = any;
import type { ComplexMetaCandidate } from './complex-metadata';
import type { NormalizedAptTrade } from './types';
import { buildComplexKey } from './complex-metadata';
import { buildPeriodSummary } from './summary';

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content) as T;
}

export async function loadTradeSnapshots(dir = path.join(process.cwd(), 'data-cache', 'transactions')) {
  const regionDirs = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const trades: NormalizedAptTrade[] = [];
  for (const regionDir of regionDirs) {
    if (!regionDir.isDirectory()) continue;
    const files = await fs.readdir(path.join(dir, regionDir.name));
    for (const file of files.filter((name) => name.endsWith('.json'))) {
      const payload = await readJsonFile<{ trades: NormalizedAptTrade[] }>(path.join(dir, regionDir.name, file));
      trades.push(...payload.trades);
    }
  }
  return trades;
}

export async function loadComplexSnapshots(dir = path.join(process.cwd(), 'data-cache', 'complexes')) {
  const files = await fs.readdir(dir).catch(() => []);
  const complexes: ComplexMetaCandidate[] = [];
  for (const file of files.filter((name) => name.endsWith('.json'))) {
    const payload = await readJsonFile<{ complexes: ComplexMetaCandidate[] }>(path.join(dir, file));
    complexes.push(...payload.complexes);
  }
  return complexes;
}

export async function importComplexes(prisma: PrismaClient, complexes: ComplexMetaCandidate[]) {
  const results = [] as string[];
  for (const complex of complexes) {
    if (!complex.name) continue;
    const upserted = await prisma.complex.upsert({
      where: { sourceComplexCode: complex.sourceComplexCode ?? `generated:${buildComplexKey({ name: complex.name, legalDong: complex.dong })}` },
      update: {
        name: complex.name,
        sido: complex.sido,
        sigungu: complex.sigungu,
        dong: complex.dong,
        address: complex.address,
        householdCount: complex.householdCount,
        completionYear: complex.completionYear
      },
      create: {
        sourceComplexCode: complex.sourceComplexCode ?? `generated:${buildComplexKey({ name: complex.name, legalDong: complex.dong })}`,
        name: complex.name,
        sido: complex.sido,
        sigungu: complex.sigungu,
        dong: complex.dong,
        address: complex.address,
        householdCount: complex.householdCount,
        completionYear: complex.completionYear,
        metadata: {
          create: {
            regionKind: complex.regionKind,
            legalDongCode: complex.legalDongCode
          }
        }
      },
      include: { metadata: true }
    });

    if (upserted.metadata) {
      await prisma.complexMetadata.update({
        where: { complexId: upserted.id },
        data: { regionKind: complex.regionKind, legalDongCode: complex.legalDongCode }
      }).catch(async () => {
        await prisma.complexMetadata.create({ data: { complexId: upserted.id, regionKind: complex.regionKind, legalDongCode: complex.legalDongCode } });
      });
    }
    results.push(upserted.id);
  }
  return results;
}

function findComplexForTrade(complexes: Awaited<ReturnType<typeof loadComplexSnapshots>>, trade: NormalizedAptTrade) {
  return complexes.find((complex) => {
    const sameName = complex.name.replace(/\s+/g, '') === trade.apartmentName.replace(/\s+/g, '');
    const sameDong = (complex.dong ?? '').replace(/\s+/g, '') === trade.legalDong.replace(/\s+/g, '');
    return sameName && sameDong;
  });
}

export async function importTrades(prisma: PrismaClient, trades: NormalizedAptTrade[], complexes: Awaited<ReturnType<typeof loadComplexSnapshots>>) {
  for (const trade of trades) {
    const complex = findComplexForTrade(complexes, trade);
    if (!complex) continue;
    const complexRow = await prisma.complex.findFirst({ where: { name: complex.name, dong: complex.dong ?? undefined } });
    if (!complexRow) continue;

    let unitType = await prisma.unitType.findFirst({ where: { complexId: complexRow.id, exclusiveAreaM2: trade.exclusiveAreaM2 } });
    if (!unitType) {
      unitType = await prisma.unitType.create({ data: { complexId: complexRow.id, exclusiveAreaM2: trade.exclusiveAreaM2 } });
    }

    await prisma.transaction.create({
      data: {
        unitTypeId: unitType.id,
        contractDate: new Date(`${trade.dealDate}T00:00:00+09:00`),
        tradePriceKrw: BigInt(trade.tradePriceKrw),
        floor: trade.floor,
        yearMonth: Number(trade.dealYearMonth),
        sourceRegionCode: trade.sourceRegionCode,
        sourceRaw: trade.raw as any
      }
    }).catch(() => undefined);
  }
}

export async function refreshTransactionSummaries(prisma: PrismaClient, now = new Date('2026-04-01T00:00:00+09:00')) {
  const unitTypes = await prisma.unitType.findMany({ include: { transactions: true } });
  for (const unitType of unitTypes) {
    const normalizedTrades: NormalizedAptTrade[] = unitType.transactions.map((transaction: any) => ({
      sourceRegionCode: transaction.sourceRegionCode ?? '',
      dealYearMonth: String(transaction.yearMonth),
      apartmentName: '',
      legalDong: '',
      jibun: '',
      exclusiveAreaM2: unitType.exclusiveAreaM2,
      floor: transaction.floor ?? undefined,
      dealDate: transaction.contractDate.toISOString().slice(0, 10),
      tradePriceKrw: Number(transaction.tradePriceKrw),
      raw: {}
    }));

    for (const periodMonths of [3, 6, 12, 24]) {
      const summary = buildPeriodSummary(normalizedTrades, periodMonths, now);
      if (!summary) continue;
      await prisma.transactionSummary.upsert({
        where: { unitTypeId_periodMonths: { unitTypeId: unitType.id, periodMonths } },
        update: {
          representativePriceKrw: BigInt(summary.representativePriceKrw),
          medianPriceKrw: BigInt(summary.medianPriceKrw),
          latestTradeDate: new Date(`${summary.latestTradeDate}T00:00:00+09:00`),
          tradeCount: summary.tradeCount,
          isStale: summary.isStale,
          staleReason: summary.staleReason
        },
        create: {
          unitTypeId: unitType.id,
          periodMonths,
          representativePriceKrw: BigInt(summary.representativePriceKrw),
          medianPriceKrw: BigInt(summary.medianPriceKrw),
          latestTradeDate: new Date(`${summary.latestTradeDate}T00:00:00+09:00`),
          tradeCount: summary.tradeCount,
          isStale: summary.isStale,
          staleReason: summary.staleReason
        }
      });
    }
  }
}
