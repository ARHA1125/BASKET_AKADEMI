export interface Sponsor {
  id: string;
  name: string;
  logoUrl?: string;
  agreementDocUrl?: string;
  createdAt: string;
}

// ── News Types ──

export interface NewsContentBlock {
  type: 'paragraph' | 'heading' | 'image' | 'quote';
  text?: string;
  src?: string;
  alt?: string;
  caption?: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
  author: string;
  readTime: string;
  content: string; // JSON-serialized NewsContentBlock[]
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

// ── Gallery Types ──

export interface GalleryPhoto {
  src: string;
  alt: string;
  caption?: string;
}

export interface GalleryAlbum {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  cover: string;
  description: string;
  photos: string; // JSON-serialized GalleryPhoto[]
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}
