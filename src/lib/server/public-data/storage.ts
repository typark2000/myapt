import fs from 'node:fs/promises';
import path from 'node:path';
import type { NormalizedAptTrade } from './types';

export async function writeTradesSnapshot(regionCode: string, dealYearMonth: string, trades: NormalizedAptTrade[]) {
  const dir = path.join(process.cwd(), 'data-cache', 'transactions', regionCode);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${dealYearMonth}.json`);
  await fs.writeFile(filePath, JSON.stringify({ regionCode, dealYearMonth, count: trades.length, trades }, null, 2));
  return filePath;
}
