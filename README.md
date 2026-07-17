# IT News Discord Bot

Bot Discord profesional yang mengirim berita IT/pemrograman terbaru secara otomatis dari berbagai sumber RSS.

## Stack

- TypeScript (strict mode)
- Node.js 20+
- discord.js v14
- rss-parser
- node-cron
- Prisma ORM (SQLite/PostgreSQL)
- winston

## Struktur

```
src/
├── commands/        # Slash commands (statis)
├── events/          # Discord event handlers
├── services/        # rss, news, discord
├── jobs/            # cron scheduler
├── database/        # Prisma client
├── utils/           # logger, text utils, translate
├── config/          # env, RSS sources, categories
├── types/           # shared types
└── index.ts         # entry point
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

3. Setup database
   ```bash
   npx prisma migrate dev
   ```

4. Jalankan
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
| `TRANSLATE_API_URL` | Tidak | - | URL untuk auto-translate ke ID |

## Sumber RSS (11)

Tambah/edit di `src/config/sources.ts`.

## Kategori & Warna

| Kategori | Emoji | Warna |
|----------|-------|-------|
| Frontend | 🎨 | Biru |
| Backend | ⚙️ | Hijau |
| AI | 🤖 | Ungu |
| Security | 🔒 | Merah |
| Cloud | ☁️ | Cyan |
| Tech | 💻 | Abu-abu |

## Auto Translate (Bonus)

Set `TRANSLATE_API_URL` untuk translate judul + ringkasan ke Indonesia via Google Translate free endpoint:
```
TRANSLATE_API_URL="https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=id&dt=t&q="
```

## Per-Category Channels (Bonus)

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
