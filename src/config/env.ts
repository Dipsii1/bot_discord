import 'dotenv/config';

function required(name: string, def?: string): string {
  const v = process.env[name] ?? def;
  if (!v || v.length === 0) throw new Error(`Missing required env: ${name}`);
  return v;
}

function num(name: string, def: number): number {
  const v = process.env[name];
  if (!v) return def;
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`Invalid number for ${name}`);
  return n;
}

export const env = {
  DISCORD_TOKEN: required('DISCORD_TOKEN', ''),
  CLIENT_ID: required('CLIENT_ID', ''),
  GUILD_ID: required('GUILD_ID', ''),
  NEWS_CHANNEL_ID: required('NEWS_CHANNEL_ID', ''),
  NEWS_CHANNELS: process.env.NEWS_CHANNELS ?? '{}',
  DATABASE_URL: process.env.DATABASE_URL ?? 'file:./dev.db',
  CHECK_INTERVAL_MINUTES: num('CHECK_INTERVAL_MINUTES', 10),
  AUTO_RUN_ONCE: process.env.AUTO_RUN_ONCE === 'true',
  TRANSLATE_API_URL: process.env.TRANSLATE_API_URL ?? ''
};

export function getCategoryChannel(category: string): string {
  try {
    const map = JSON.parse(env.NEWS_CHANNELS) as Record<string, string>;
    return map[category] ?? env.NEWS_CHANNEL_ID;
  } catch {
    return env.NEWS_CHANNEL_ID;
  }
}