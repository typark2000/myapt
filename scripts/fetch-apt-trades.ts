import process from 'node:process';
import { fetchAllAptTrades } from '../src/lib/server/public-data/apt-trades';
import { writeTradesSnapshot } from '../src/lib/server/public-data/storage';

async function main() {
  const regionCode = process.argv[2];
  const dealYearMonth = process.argv[3];

  if (!regionCode || !dealYearMonth) {
    console.error('usage: npm run sync:apt-trades -- <LAWD_CD> <YYYYMM>');
    process.exit(1);
  }

  const trades = await fetchAllAptTrades({ regionCode, dealYearMonth });
  const filePath = await writeTradesSnapshot(regionCode, dealYearMonth, trades);

  console.log(JSON.stringify({
    ok: true,
    regionCode,
    dealYearMonth,
    count: trades.length,
    filePath,
    sample: trades.slice(0, 2)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
