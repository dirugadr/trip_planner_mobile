import { env } from '../config/env';

// cover_photo_url / poi.photo_url puede ser una URL absoluta (foto de
// Wikipedia) o la ruta interna sin auth /api/pois/:id/photo (foto manual).
export function resolvePhotoUrl(url: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${env.apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}
