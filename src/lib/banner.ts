export interface Banner {
  _id: string;
  title: string;
  type: 'video' | 'image' | 'gif';
  url: string;
  path: string;
  mimeType: string;
  size: number;
  isActive: boolean;
  order: number;
  description?: string;
  altText?: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export async function getBanners(): Promise<Banner[]> {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.kasi.market').replace(/\/$/, '');
  const url = `${base}/api/banner/active`;
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const banners = Array.isArray(data) ? data : (data.banners || []);
    return banners
      .sort((a: Banner, b: Banner) => a.order - b.order)
      .map((banner: Banner) => ({
        ...banner,
        // Ensure the URL is absolute
        url: banner.url.startsWith('http') ? banner.url : `${base}${banner.url}`
      }));
  } catch (e) {
    console.error('Error fetching banners:', e);
    return [];
  }
}
