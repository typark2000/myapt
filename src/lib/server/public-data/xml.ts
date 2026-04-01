import { parseStringPromise } from 'xml2js';

export async function parsePublicXml(xml: string) {
  return parseStringPromise(xml);
}

export function flattenXmlItems(parsed: any) {
  const items = parsed?.response?.body?.[0]?.items?.[0]?.item ?? [];
  return items.map((item: Record<string, unknown>) => {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(item)) {
      out[key] = Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '');
    }
    return out;
  });
}
