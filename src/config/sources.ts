import type { Category } from '../types';

export const RSS_SOURCES = [
  { name: 'DetikInet', url: 'https://inet.detik.com/rss', category: 'Tech' as Category },
  { name: 'CNN Indonesia Teknologi', url: 'https://www.cnnindonesia.com/teknologi/rss', category: 'Tech' as Category },
  { name: 'Kompas Tekno', url: 'https://tekno.kompas.com/rss', category: 'Tech' as Category }
] as const;

export const CATEGORY_COLORS: Record<Category, number> = {
  Frontend: 0x3b82f6,
  Backend: 0x22c55e,
  AI: 0xa855f7,
  Security: 0xef4444,
  Cloud: 0x06b6d4,
  Tech: 0x64748b
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  Frontend: '🎨',
  Backend: '⚙️',
  AI: '🤖',
  Security: '🔒',
  Cloud: '☁️',
  Tech: '💻'
};

export function mapCategory(_name: string): Category {
  return 'Tech';
}
