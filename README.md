# IT News Discord Bot

Bot Discord yang mengirim berita IT/pemrograman Indonesia secara otomatis dari RSS, plus slash command untuk membuat stiker WhatsApp dari teks/gambar/GIF.

## Stack

- TypeScript (strict mode)
- Node.js 20+
- discord.js v14
- rss-parser
- node-cron
- Prisma ORM (SQLite/PostgreSQL)
- winston
- @napi-rs/canvas + sharp + ffmpeg (stiker)

## Struktur

```
src/
├── assets/fonts/         # Nunito Variable (OFL)
├── commands/             # Slash commands (/sticker)
├── services/             # rss, news, discord, stickers
├── jobs/                 # cron scheduler
├── database/             # Prisma client
├── utils/                # logger, text, translate, fonts
├── config/               # env, RSS sources, categories
├── types/                # shared types
└── index.ts              # entry point
```

## Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Copy env dan isi token Discord + channel ID
   ```bash
   cp .env.example .env
   ```

3. Install ffmpeg (untuk stiker GIF)
   ```bash
   # Windows
   choco install ffmpeg
   # atau
   scoop install ffmpeg
   ```

4. Setup database
   ```bash
   npx prisma migrate dev
   ```

5. Jalankan
   ```bash
   npm run dev
   ```

## Konfigurasi (.env)

| Variable | Wajib | Default | Keterangan |
|----------|-------|---------|------------|
| `DISCORD_TOKEN` | Ya | - | Bot token dari Discord Developer Portal |
| `CLIENT_ID` | Ya | - | Application ID |
| `GUILD_ID` | Ya | - | Server ID |
| `NEWS_CHANNEL_ID` | Ya | - | Channel default untuk posting |
| `NEWS_CHANNELS` | Tidak | `{}` | JSON map `{Category: ChannelID}` |
| `DATABASE_URL` | Tidak | `file:./dev.db` | Connection string Prisma |
| `CHECK_INTERVAL_MINUTES` | Tidak | `10` | Interval cron |

## Sumber RSS

IT Indonesia (3 sumber, default). Edit di `src/config/sources.ts`.

| Sumber | URL |
|--------|-----|
| DetikInet | `https://inet.detik.com/rss` |
| CNN Indonesia Teknologi | `https://www.cnnindonesia.com/teknologi/rss` |
| Kompas Tekno | `https://tekno.kompas.com/rss` |

## Kategori & Warna

| Kategori | Emoji | Warna |
|----------|-------|-------|
| Frontend | 🎨 | Biru |
| Backend | ⚙️ | Hijau |
| AI | 🤖 | Ungu |
| Security | 🔒 | Merah |
| Cloud | ☁️ | Cyan |
| Tech | 💻 | Abu-abu |

Semua sumber ID saat ini masuk kategori `Tech`.

## Slash Command: `/sticker`

Buat stiker WhatsApp 512×512.

### `/sticker text`
```
/sticker text:"no no baby" emoji:☝️ warna_bg:#ffffff warna_teks:#000000
```
- `teks` (wajib) — tiap kata jadi baris, font auto-fit per kata
- `emoji` (opsional) — emoji di bawah tengah (default kosong, tidak dirender)
- `warna_bg` (opsional, default `#ffffff`) — warna latar hex
- `warna_teks` (opsional, default `#000000`) — warna teks/emoji

Render pakai Nunito Black 900 (rounded heavy sans-serif, OFL).

### `/sticker image`
```
/sticker image + attach gambar
```
Resize crop center jadi 512×512 PNG.

### `/sticker gif`
```
/sticker gif + attach file.gif
```
Konversi GIF ke animated WebP 512×512 via ffmpeg.

Catatan: Discord tidak mengirim sticker sebagai WA `.webp` resmi — attachment diterima sebagai file biasa. Simpan manual dari attachment untuk dipakai di WhatsApp.

## Per-Category Channels

Set `NEWS_CHANNELS` ke JSON map agar berita terkirim ke channel berbeda per kategori:
```
NEWS_CHANNELS={"AI":"123","Frontend":"456","Backend":"789"}
```

## Scripts

- `npm run dev` - Development dengan hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Jalankan production
- `npm run prisma:migrate` - Migrate database
- `npm run lint` - ESLint
- `npm run format` - Prettier
