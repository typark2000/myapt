import process from 'node:process';
import { fetchComplexDetail } from '../src/lib/server/public-data/collectors/complex-details';
import { writeComplexDetailSnapshot } from '../src/lib/server/public-data/storage-complexes';

async function main() {
  const sourceComplexCode = process.argv[2];
  if (!sourceComplexCode) {
    console.error('usage: npm run sync:complex-detail -- <complexCode>');
    process.exit(1);
  }
  const detail = await fetchComplexDetail(sourceComplexCode);
  const filePath = await writeComplexDetailSnapshot(sourceComplexCode, detail);
  console.log(JSON.stringify({ ok: true, sourceComplexCode, filePath, detail }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
