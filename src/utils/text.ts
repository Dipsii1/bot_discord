export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractImage(content: string, link: string): string | undefined {
  const m = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  let url = m?.[1];
  if (!url) return undefined;
  if (url.startsWith('//')) url = 'https:' + url;
  if (url.startsWith('/')) {
    try {
      const u = new URL(link);
      url = u.origin + url;
    } catch {
      return undefined;
    }
  }
  if (!/^https?:\/\//.test(url)) return undefined;
  return url;
}

export function truncate(text: string, max = 300): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…';
}