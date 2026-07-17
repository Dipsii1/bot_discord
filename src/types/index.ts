export type Category = 'Frontend' | 'Backend' | 'AI' | 'Security' | 'Cloud' | 'Tech';

export interface RawFeedItem {
  guid: string;
  title: string;
  link: string;
  content: string;
  publishedAt: Date;
  imageUrl?: string;
}

export interface NormalizedItem extends RawFeedItem {
  source: string;
  category: Category;
}