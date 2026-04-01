import process from 'node:process';
import { fetchComplexListPage } from '../src/lib/server/public-data/collectors/complexes';
import { writeComplexListSnapshot } from '../src/lib/server/public-data/storage-complexes';

async function main() {
  const regionCode = process.argv[2] ?? 'all';
  const page = Number(process.argv[3] ?? 1);
  const result = await fetchComplexListPage({ regionCode: regionCode === 'all' ? undefined : regionCode, page, pageSize: 100 });
  const filePath = await writeComplexListSnapshot(regionCode, result.normalized);

  console.log(JSON.stringify({
    ok: true,
    regionCode,
    page,
    count: result.normalized.length,
    filePath,
    sample: result.normalized.slice(0, 2)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
