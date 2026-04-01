import fs from 'node:fs/promises';
import path from 'node:path';
import type { ComplexMetaCandidate } from './complex-metadata';
import type { ComplexDetail } from './collectors/complex-details';

export async function writeComplexListSnapshot(regionKey: string, complexes: ComplexMetaCandidate[]) {
  const dir = path.join(process.cwd(), 'data-cache', 'complexes');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${regionKey}.json`);
  await fs.writeFile(filePath, JSON.stringify({ regionKey, count: complexes.length, complexes }, null, 2));
  return filePath;
}

export async function writeComplexDetailSnapshot(sourceComplexCode: string, detail: ComplexDetail) {
  const dir = path.join(process.cwd(), 'data-cache', 'complex-details');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${sourceComplexCode}.json`);
  await fs.writeFile(filePath, JSON.stringify(detail, null, 2));
  return filePath;
}
