import { createCanvas, type SKRSContext2D } from '@napi-rs/canvas';
import sharp from 'sharp';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFile, readFile, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { ensureFonts, WORDS_FONT, EMOJI_FONT } from '../utils/fonts';

const execFileAsync = promisify(execFile);

const SIZE = 512;

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const v = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function computeWordSizes(
  ctx: SKRSContext2D,
  words: string[],
  baseSize: number,
  maxWidth: number
): { word: string; size: number; width: number }[] {
  const result: { word: string; size: number; width: number }[] = [];
  for (const w of words) {
    let size = baseSize;
    ctx.font = WORDS_FONT.replace('{size}', String(size));
    let width = ctx.measureText(w).width;
    while (width > maxWidth && size > 28) {
      size -= 2;
      ctx.font = WORDS_FONT.replace('{size}', String(size));
      width = ctx.measureText(w).width;
    }
    result.push({ word: w, size, width });
  }
  return result;
}

function measureWordLines(
  wordsData: { word: string; size: number; width: number }[],
  maxWidth: number
): { lines: { words: { word: string; size: number; width: number }[]; width: number; height: number }[]; totalHeight: number } {
  const lines: { words: { word: string; size: number; width: number }[]; width: number; height: number }[] = [];
  let currentLine: { word: string; size: number; width: number }[] = [];
  let currentWidth = 0;

  for (const wd of wordsData) {
    const wordWidth = wd.width;
    const spaceWidth = currentLine.length > 0 ? 20 : 0;
    if (currentWidth + spaceWidth + wordWidth > maxWidth && currentLine.length > 0) {
      const lineHeight = Math.max(...currentLine.map((w) => w.size * 1.25));
      lines.push({ words: currentLine, width: currentWidth, height: lineHeight });
      currentLine = [{ word: wd.word, size: wd.size, width: wd.width }];
      currentWidth = wordWidth;
    } else {
      currentLine.push({ word: wd.word, size: wd.size, width: wd.width });
      currentWidth += spaceWidth + wordWidth;
    }
  }
  if (currentLine.length > 0) {
    const lineHeight = Math.max(...currentLine.map((w) => w.size * 1.25));
    lines.push({ words: currentLine, width: currentWidth, height: lineHeight });
  }
  const totalHeight = lines.reduce((sum, l) => sum + l.height, 0);
  return { lines, totalHeight };
}

export async function generateTextSticker(
  text: string,
  bgHex = '#ffffff',
  textHex = '#000000',
  emojiChar = ''
): Promise<Buffer> {
  await ensureFonts();

  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  const [r, g, b] = hexToRgb(bgHex);
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) throw new Error('Teks kosong');

  const maxTextWidth = SIZE - 64;
  let baseSize = 140;

  let wordsData = computeWordSizes(ctx, words, baseSize, maxTextWidth);
  let { lines, totalHeight } = measureWordLines(wordsData, maxTextWidth);

  while (totalHeight > SIZE * 0.75 && baseSize > 36) {
    baseSize -= 4;
    wordsData = computeWordSizes(ctx, words, baseSize, maxTextWidth);
    ({ lines, totalHeight } = measureWordLines(wordsData, maxTextWidth));
  }

  const emojiSize = emojiChar ? Math.max(80, Math.min(160, baseSize * 1.5)) : 0;
  const gap = emojiChar ? 20 : 0;
  const totalBlockHeight = totalHeight + gap + emojiSize;
  let y = (SIZE - totalBlockHeight) / 2;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';

  const [tr, tg, tb] = hexToRgb(textHex);
  ctx.fillStyle = `rgb(${tr}, ${tg}, ${tb})`;

  for (const line of lines) {
    const lineHeight = line.height;
    const lineY = y + lineHeight * 0.8;
    let x = SIZE / 2 - line.width / 2;
    for (const w of line.words) {
      const wSize = w.size;
      ctx.font = WORDS_FONT.replace('{size}', String(wSize));
      ctx.fillText(w.word, x, lineY);
      x += w.width + 20;
    }
    y += lineHeight;
  }

  if (emojiChar) {
    y += gap;
    ctx.font = EMOJI_FONT.replace('{size}', String(emojiSize));
    ctx.fillText(emojiChar, SIZE / 2, y + emojiSize * 0.35);
  }

  return canvas.toBuffer('image/png');
}

export async function generateImageSticker(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .resize(SIZE, SIZE, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();
}

export async function generateAnimatedSticker(gifInput: Buffer): Promise<Buffer> {
  const id = randomUUID();
  const inPath = join(tmpdir(), `stk-${id}.gif`);
  const outPath = join(tmpdir(), `stk-${id}.webp`);
  await writeFile(inPath, gifInput);
  try {
    await execFileAsync('ffmpeg', [
      '-y',
      '-i',
      inPath,
      '-vf',
      'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000',
      '-loop',
      '0',
      '-c:v',
      'libwebp',
      '-lossless',
      '1',
      '-preset',
      'default',
      '-an',
      outPath
    ]);
    return await readFile(outPath);
  } finally {
    await Promise.allSettled([rm(inPath, { force: true }), rm(outPath, { force: true })]);
  }
}