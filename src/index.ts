import { Client, GatewayIntentBits, Events } from 'discord.js';
import { env } from './config/env';
import { log, error } from './utils/logger';
import { prisma } from './database/prisma';
import { initDiscordService } from './services/discord.service';
import { startNewsJob } from './jobs/news.job';

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, (c) => {
  log('bot', `Logged in as ${c.user.tag}`);
  initDiscordService(c);
  startNewsJob();
});

client.on(Events.Error, (e) => error('bot', 'Discord client error', e));

process.on('unhandledRejection', (reason) => error('process', 'Unhandled rejection', reason));
process.on('uncaughtException', (err) => error('process', 'Uncaught exception', err));

client.login(env.DISCORD_TOKEN).catch((e) => {
  error('bot', 'Login failed', e);
  process.exit(1);
});

async function shutdown(): Promise<void> {
  log('bot', 'Shutting down');
  await prisma.$disconnect();
  client.destroy();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);