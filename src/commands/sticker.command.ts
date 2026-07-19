import {
  AttachmentBuilder,
  REST,
  Routes,
  SlashCommandBuilder,
  MessageFlags
} from 'discord.js';
import type { ChatInputCommandInteraction, Client } from 'discord.js';
import { generateAnimatedSticker, generateImageSticker, generateTextSticker } from '../services/stickers.service';
import { error } from '../utils/logger';
import { env } from '../config/env';

const command = new SlashCommandBuilder()
  .setName('sticker')
  .setDescription('Buat stiker WhatsApp (512x512)')
  .addSubcommand((s) =>
    s
      .setName('text')
      .setDescription('Stiker dari teks + emoji bawah')
      .addStringOption((o) => o.setName('teks').setDescription('Isi stiker (tiap kata jadi baris)').setRequired(true).setMaxLength(200))
      .addStringOption((o) => o.setName('emoji').setDescription('Emoji di bawah tengah (default: ☝️)').setRequired(false).setMaxLength(4))
      .addStringOption((o) => o.setName('warna_bg').setDescription('Warna latar hex, contoh #1f2937').setRequired(false))
      .addStringOption((o) => o.setName('warna_teks').setDescription('Warna teks/emoji hex, default #000000').setRequired(false))
  )
  .addSubcommand((s) =>
    s.setName('image').setDescription('Stiker dari gambar').addAttachmentOption((o) =>
      o.setName('gambar').setDescription('File gambar (png/jpg/webp)').setRequired(true)
    )
  )
  .addSubcommand((s) =>
    s.setName('gif').setDescription('Stiker animasi dari GIF').addAttachmentOption((o) =>
      o.setName('file').setDescription('File GIF').setRequired(true)
    )
  );

const HEX = /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;

async function run(interaction: ChatInputCommandInteraction): Promise<void> {
  const sub = interaction.options.getSubcommand();
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    if (sub === 'text') {
      const text = interaction.options.getString('teks', true);
      const emoji = interaction.options.getString('emoji')?.trim() ?? '';
      const bgRaw = interaction.options.getString('warna_bg') ?? '#ffffff';
      const txtRaw = interaction.options.getString('warna_teks') ?? '#000000';

      if (!HEX.test(bgRaw) || !HEX.test(txtRaw)) {
        await interaction.editReply('Format warna tidak valid. Contoh: `#1f2937`');
        return;
      }
      const bg = bgRaw.startsWith('#') ? bgRaw : `#${bgRaw}`;
      const txt = txtRaw.startsWith('#') ? txtRaw : `#${txtRaw}`;

      const buf = await generateTextSticker(text, bg, txt, emoji);
      await interaction.editReply({
        content: 'Stiker teks siap (512x512 PNG). Simpan manual dari attachment.',
        files: [new AttachmentBuilder(buf, { name: 'sticker.png' })]
      });
      return;
    }

    if (sub === 'image') {
      const att = interaction.options.getAttachment('gambar', true);
      const res = await fetch(att.url);
      if (!res.ok) {
        await interaction.editReply('Gagal mengunduh gambar.');
        return;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const out = await generateImageSticker(buf);
      await interaction.editReply({
        content: 'Stiker gambar siap (512x512 PNG). Simpan manual dari attachment.',
        files: [new AttachmentBuilder(out, { name: 'sticker.png' })]
      });
      return;
    }

    if (sub === 'gif') {
      const att = interaction.options.getAttachment('file', true);
      if (!att.contentType?.includes('gif')) {
        await interaction.editReply('Lampiran harus GIF.');
        return;
      }
      const res = await fetch(att.url);
      if (!res.ok) {
        await interaction.editReply('Gagal mengunduh GIF.');
        return;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const out = await generateAnimatedSticker(buf);
      await interaction.editReply({
        content: 'Stiker animasi siap (WebP animasi). Simpan manual dari attachment.',
        files: [new AttachmentBuilder(out, { name: 'sticker.webp' })]
      });
      return;
    }
  } catch (e) {
    error('sticker', `Subcommand ${sub} failed`, e);
    await interaction.editReply('Gagal membuat stiker. Pastikan ffmpeg terpasang (untuk GIF) dan input valid.');
  }
}

export async function registerStickerCommand(client: Client<true>): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: [command.toJSON()] });
  } catch (e) {
    error('sticker', 'Failed to register slash command', e);
  }
  client.on('interactionCreate', (i) => {
    if (i.isChatInputCommand() && i.commandName === 'sticker') void run(i);
  });
}