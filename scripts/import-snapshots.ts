import { getPrisma } from '../src/lib/server/db';
import { importComplexes, importTrades, loadComplexSnapshots, loadTradeSnapshots, refreshTransactionSummaries } from '../src/lib/server/public-data/importer';

async function main() {
  const prisma = await getPrisma();
  const complexes = await loadComplexSnapshots();
  const trades = await loadTradeSnapshots();

  await prisma.syncJob.create({ data: { jobType: 'snapshot-import', status: 'running', target: 'all', message: `complexes=${complexes.length}, trades=${trades.length}` } });

  await importComplexes(prisma, complexes);
  await importTrades(prisma, trades, complexes);
  await refreshTransactionSummaries(prisma);

  await prisma.syncJob.create({ data: { jobType: 'snapshot-import', status: 'success', target: 'all', message: `complexes=${complexes.length}, trades=${trades.length}` } });

  console.log(JSON.stringify({ ok: true, complexes: complexes.length, trades: trades.length }, null, 2));
  await prisma.$disconnect?.();
}

main().catch(async (error) => {
  console.error(error);
  try {
    const prisma = await getPrisma();
    await prisma.syncJob.create({ data: { jobType: 'snapshot-import', status: 'failed', target: 'all', message: String(error) } });
    await prisma.$disconnect?.();
  } catch {}
  process.exit(1);
});
