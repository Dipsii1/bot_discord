import cron from 'node-cron';
import { RSS_SOURCES } from '../config/sources';
import { fetchAllFeeds } from '../services/rss.service';
import { processNewItems, cleanupOld } from '../services/news.service';
import { log, error } from '../utils/logger';
import { env } from '../config/env';

let running = false;

export function startNewsJob(): void {
  const schedule = `*/${env.CHECK_INTERVAL_MINUTES} * * * *`;
  cron.schedule(schedule, runJob);
  log('job', `Scheduler started: every ${env.CHECK_INTERVAL_MINUTES} minutes`);

  setTimeout(runJob, 2000);
  cron.schedule('0 3 * * *', () => cleanupOld(30).then((n) => log('job', `Cleaned ${n} old records`)));
}

async function runJob(): Promise<void> {
  if (running) {
    log('job', 'Skipping: previous run still in progress');
    return;
  }
  running = true;
  const start = Date.now();

  try {
    log('job', 'Starting news fetch cycle');
    const { ok, failed } = await fetchAllFeeds(RSS_SOURCES);

    if (failed.length) {
      error('job', `${failed.length} sources failed`, failed.map((f) => f.reason).join('; '));
    }

    const allItems = ok.flatMap((o) => o.items);
    const sent = await processNewItems(allItems);
    log('job', `Cycle done in ${Date.now() - start}ms`, { fetched: allItems.length, sent, failed: failed.length });
  } catch (e) {
    error('job', 'Unexpected error in job', e);
  } finally {
    running = false;
  }
}