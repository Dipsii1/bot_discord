import { GlobalFonts } from '@napi-rs/canvas';
import { join } from 'node:path';
import { stat } from 'node:fs/promises';

let fontsRegistered = false;

export async function ensureFonts(): Promise<void> {
  if (fontsRegistered) return;
  const fontPath = join(__dirname, '..', 'assets', 'fonts', 'Nunito-Variable.ttf');
  try {
    await stat(fontPath);
    const key = GlobalFonts.registerFromPath(fontPath);
    if (key) {
      fontsRegistered = true;
      return;
    }
  } catch {
    // fallback to system fonts
  }
  // fallback to system font stack
  fontsRegistered = true;
}

export const WORDS_FONT = '900 {size}px "Nunito", "Baloo 2", "Fredoka", "Quicksand", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
export const EMOJI_FONT = '{size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';