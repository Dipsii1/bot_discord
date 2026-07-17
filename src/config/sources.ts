import type { Category } from '../types';

export const RSS_SOURCES = [
  { name: 'Hacker News', url: 'https://news.ycombinator.com/rss', category: 'Tech' as Category },
  { name: 'GitHub Blog', url: 'https://github.blog/feed/', category: 'Backend' as Category },
  { name: 'React Blog', url: 'https://react.dev/rss.xml', category: 'Frontend' as Category },
  { name: 'Node.js Blog', url: 'https://nodejs.org/en/feed/blog.xml', category: 'Backend' as Category },
  { name: 'Microsoft Dev Blog', url: 'https://devblogs.microsoft.com/feed/', category: 'Backend' as Category },
  { name: 'Google Developers', url: 'https://developers.googleblog.com/feeds/posts/default', category: 'Tech' as Category },
  { name: 'OpenAI News', url: 'https://openai.com/news/rss.xml', category: 'AI' as Category },
  { name: 'Vercel Blog', url: 'https://vercel.com/blog/rss.xml', category: 'Frontend' as Category },
  { name: 'Cloudflare Blog', url: 'https://blog.cloudflare.com/rss/', category: 'Cloud' as Category },
  { name: 'InfoQ', url: 'https://feeds.feedburner.com/infoq', category: 'Tech' as Category },
  { name: 'Dev.to', url: 'https://dev.to/feed', category: 'Tech' as Category }
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

export function mapCategory(name: string): Category {
  const c = name.toLowerCase();
  if (c.includes('front') || c.includes('react') || c.includes('css') || c.includes('ui')) return 'Frontend';
  if (c.includes('back') || c.includes('server') || c.includes('api') || c.includes('node') || c.includes('go') || c.includes('python')) return 'Backend';
  if (c.includes('ai') || c.includes('ml') || c.includes('llm') || c.includes('openai') || c.includes('anthropic')) return 'AI';
  if (c.includes('secur') || c.includes('hack') || c.includes('vuln') || c.includes('auth')) return 'Security';
  if (c.includes('cloud') || c.includes('aws') || c.includes('azure') || c.includes('gcp') || c.includes('k8s') || c.includes('docker')) return 'Cloud';
  return 'Tech';
}