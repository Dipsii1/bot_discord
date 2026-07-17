const cache = new Map<string, { value: string; ts: number }>();
const TTL = 24 * 60 * 60 * 1000;

export async function translate(text: string, target = 'id'): Promise<string> {
  if (!text || text.length < 4) return text;
  if (!process.env.TRANSLATE_API_URL) return text;
  const key = `${target}::${text}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) return hit.value;
  try {
    const url = `${process.env.TRANSLATE_API_URL}${encodeURIComponent(text)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return text;
    const data = (await res.json()) as unknown;
    let translated = text;
    if (Array.isArray(data) && Array.isArray((data as unknown[])[0])) {
      translated =
        ((data as unknown[][])[0] as unknown[][])
          .map((seg) => (Array.isArray(seg) ? String(seg[0] ?? '') : ''))
          .join('')
          .trim() || text;
    }
    cache.set(key, { value: translated, ts: Date.now() });
    return translated;
  } catch {
    return text;
  }
}