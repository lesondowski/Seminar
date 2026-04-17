const ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1']);

function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isAllowedHost(hostname) {
  if (!hostname) return false;
  if (ALLOWED_HOSTS.has(hostname)) return true;

  if (typeof window !== 'undefined' && hostname === window.location.hostname) {
    return true;
  }

  return false;
}

export function parseQrPayload(rawValue) {
  const value = (rawValue || '').trim();
  if (!value) {
    return { ok: false, error: 'QR payload is empty.' };
  }

  try {
    const url = value.startsWith('http://') || value.startsWith('https://')
      ? new URL(value)
      : new URL(value, 'http://localhost');

    const isRelative = !value.startsWith('http://') && !value.startsWith('https://');
    if (!isRelative && !isAllowedHost(url.hostname)) {
      return { ok: false, error: 'QR domain is not allowed.' };
    }

    const pathname = url.pathname || '';
    if (!pathname.startsWith('/qr')) {
      return { ok: false, error: 'QR URL must point to /qr path.' };
    }

    const poi = url.searchParams.get('poi');
    const entry = url.searchParams.get('entry');

    if (poi) {
      const poiId = safeNumber(poi);
      if (!poiId) {
        return { ok: false, error: 'POI id is invalid.' };
      }

      return {
        ok: true,
        type: 'poi',
        poiId,
        normalized: `/qr?poi=${poiId}`,
      };
    }

    if (entry === 'true' || entry === '1' || entry === '' || url.search.includes('entry')) {
      return {
        ok: true,
        type: 'entry',
        normalized: '/qr?entry=true',
      };
    }

    return { ok: false, error: 'QR content is unsupported.' };
  } catch (error) {
    return { ok: false, error: 'QR payload is not a valid URL.' };
  }
}

export function buildQrRedirect(route, option = 'detail') {
  if (!route) return '/qr?entry=true';

  if (route.type === 'entry') {
    return '/qr?entry=true';
  }

  const destination = option === 'map' ? 'map' : 'detail';
  return `/qr?poi=${route.poiId}&destination=${destination}`;
}
