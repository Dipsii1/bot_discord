import type { NormalizedItem } from '../types';
import { prisma } from '../database/prisma';
import { error } from '../utils/logger';
import { truncate } from '../utils/text';
import { translate } from '../utils/translate';
import { sendNews } from './discord.service';

export interface ProcessOptions {
  dryRun?: boolean;
  translateOn?: boolean;
}

export async function processNewItems(items: NormalizedItem[], opts: ProcessOptions = {}): Promise<number> {
  let processed = 0;

  for (const item of items) {
    try {
      const exists = await prisma.news.findUnique({ where: { guid: item.guid } });
      if (exists) continue;

      const summary = opts.translateOn !== false ? await translate(truncate(item.content, 500)) : truncate(item.content, 500);
      const titleId = opts.translateOn !== false ? await translate(item.title) : item.title;

      await prisma.news.create({
        data: {
          guid: item.guid,
          title: item.title,
          link: item.link,
          summary,
          source: item.source,
          category: item.category,
          publishedAt: item.publishedAt,
          imageUrl: item.imageUrl,
          posted: !opts.dryRun
        }
      });

      if (!opts.dryRun) {
        const ok = await sendNews({
          title: titleId,
          summary,
          link: item.link,
          source: item.source,
          category: item.category,
          publishedAt: item.publishedAt,
          imageUrl: item.imageUrl
        });
        if (!ok) await prisma.news.update({ where: { guid: item.guid }, data: { posted: false } });
        if (ok) processed++;
      } else {
        processed++;
      }
    } catch (e) {
      error('news', `Failed to process ${item.title}`, e);
    }
  }

  return processed;
}

export async function getRecentStats() {
  const total = await prisma.news.count();
  const last24h = await prisma.news.count({
    where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
  });
  const posted = await prisma.news.count({ where: { posted: true } });
  return { total, last24h, posted };
}

export async function cleanupOld(maxAgeDays = 30): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
  const res = await prisma.news.deleteMany({ where: { createdAt: { lt: cutoff } } });
  return res.count;
}