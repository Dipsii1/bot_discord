import Parser from 'rss-parser';
import type { NormalizedItem } from '../types';
import { stripHtml, extractImage } from '../utils/text';
import { error, log } from '../utils/logger';

export interface FeedSource {
  name: string;
  url: string;
  category: string;
}

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'IT-News-Discord-Bot/1.0' }
});

async function withRetry<T>(fn: () => Promise<T>, tries = 3, delay = 2000): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < tries - 1) await new Promise((r) => setTimeout(r, delay * (i + 1)));
    }
  }
  throw lastErr;
}

const cache = new Map<string, { data: NormalizedItem[]; ts: number }>();
const CACHE_TTL = 60 * 1000;

export async function fetchFeed(source: FeedSource): Promise<NormalizedItem[]> {
  const cached = cache.get(source.url);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const feed = await withRetry(() => parser.parseURL(source.url));
  const items: NormalizedItem[] = feed.items
    .filter((it) => it.title && it.link)
    .slice(0, 15)
    .map((it) => {
      const content = it.contentSnippet ?? it.content ?? it.summary ?? '';
      const html = it.content ?? it['content:encoded'] ?? it.summary ?? '';
      const image = extractImage(html, it.link ?? '');
      return {
        guid: it.guid ?? it.link ?? it.title ?? '',
        title: it.title?.trim() ?? '',
        link: it.link ?? '',
        content: stripHtml(content),
        publishedAt: it.pubDate ? new Date(it.pubDate) : new Date(),
        imageUrl: image,
        source: source.name,
        category: source.category as NormalizedItem['category']
      } satisfies NormalizedItem;
    });

  cache.set(source.url, { data: items, ts: Date.now() });
  return items;
}

export async function fetchAllFeeds(sources: readonly FeedSource[]): Promise<{
  ok: Array<{ source: FeedSource; items: NormalizedItem[] }>;
  failed: Array<{ source: FeedSource; reason: string }>;
}> {
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const items = await fetchFeed(source);
      log('rss', `Fetched ${items.length} items`, { source: source.name });
      return { source, items };
    })
  );

  const ok: Array<{ source: FeedSource; items: NormalizedItem[] }> = [];
  const failed: Array<{ source: FeedSource; reason: string }> = [];

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') ok.push(r.value);
    else {
      const reason = r.reason instanceof Error ? r.reason.message : String(r.reason);
      failed.push({ source: sources[i]!, reason });
      error('rss', `Failed: ${sources[i]!.name}`, r.reason);
    }
  });

  return { ok, failed };
}