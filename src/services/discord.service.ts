import type { Client, TextChannel } from 'discord.js';
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { CATEGORY_COLORS, CATEGORY_EMOJI } from '../config/sources';
import { getCategoryChannel } from '../config/env';
import { log, error } from '../utils/logger';
import { truncate } from '../utils/text';

let client: Client<true>;

export function initDiscordService(discordClient: Client<true>): void {
  client = discordClient;
}

async function getChannel(category: string): Promise<TextChannel | null> {
  const channelId = getCategoryChannel(category);
  try {
    const ch = await client.channels.fetch(channelId);
    if (ch?.isTextBased()) return ch as TextChannel;
    error('discord', `Channel ${channelId} is not a text channel`);
    return null;
  } catch (e) {
    error('discord', `Failed to fetch channel ${channelId}`, e);
    return null;
  }
}

export async function sendNews(item: {
  title: string;
  summary: string;
  link: string;
  source: string;
  category: string;
  publishedAt: Date;
  imageUrl?: string;
}): Promise<boolean> {
  const channel = await getChannel(item.category);
  if (!channel) return false;

  const cat = item.category as keyof typeof CATEGORY_COLORS;
  const color = CATEGORY_COLORS[cat] ?? 0x64748b;
  const emoji = CATEGORY_EMOJI[cat] ?? '';

  const embed = new EmbedBuilder()
    .setTitle(`${emoji} ${item.title}`)
    .setURL(item.link)
    .setDescription(truncate(item.summary, 500))
    .setColor(color)
    .addFields(
      { name: '📰 Sumber', value: item.source, inline: true },
      { name: '🏷️ Kategori', value: item.category, inline: true },
      {
        name: '📅 Publikasi',
        value: `<t:${Math.floor(item.publishedAt.getTime() / 1000)}:R>`,
        inline: true
      }
    )
    .setFooter({ text: 'IT News Bot • Powered by RSS' })
    .setTimestamp(item.publishedAt);

  if (item.imageUrl) embed.setImage(item.imageUrl);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setLabel('📖 Baca Selengkapnya').setStyle(ButtonStyle.Link).setURL(item.link)
  );

  try {
    await channel.send({ embeds: [embed], components: [row] });
    log('discord', `Sent to #${channel.name}`, {
      title: item.title.slice(0, 50),
      category: item.category
    });
    return true;
  } catch (e) {
    error('discord', `Send failed: ${item.title}`, e);
    return false;
  }
}