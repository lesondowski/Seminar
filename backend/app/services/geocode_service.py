import json
import time
from urllib.error import HTTPError, URLError
from urllib import parse, request

NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
USER_AGENT = 'smart-food-tour/1.0 (contact: admin@localhost)'

SEARCH_CACHE_TTL_SECONDS = 180
REVERSE_CACHE_TTL_SECONDS = 600
_search_cache: dict[str, tuple[float, list[dict]]] = {}
_reverse_cache: dict[str, tuple[float, dict]] = {}
_last_nominatim_call_ts = 0.0


def _cache_get(cache: dict, key: str, ttl_seconds: int):
    item = cache.get(key)
    if not item:
        return None
    cached_at, payload = item
    if time.time() - cached_at > ttl_seconds:
        cache.pop(key, None)
        return None
    return payload


def _cache_set(cache: dict, key: str, payload):
    cache[key] = (time.time(), payload)


def _polite_throttle():
    # Nominatim usage policy requires low request rate; keep ~1 req/sec per process.
    global _last_nominatim_call_ts
    now = time.time()
    wait_for = 1.0 - (now - _last_nominatim_call_ts)
    if wait_for > 0:
        time.sleep(wait_for)
    _last_nominatim_call_ts = time.time()


def _fetch_json(url: str) -> list | dict | None:
    req = request.Request(url, headers={'User-Agent': USER_AGENT})
    for attempt in range(2):
        try:
            _polite_throttle()
            with request.urlopen(req, timeout=6) as resp:
                return json.loads(resp.read().decode('utf-8'))
        except HTTPError as exc:
            if exc.code == 429 and attempt == 0:
                retry_after = exc.headers.get('Retry-After') if exc.headers else None
                try:
                    delay = float(retry_after) if retry_after else 1.5
                except ValueError:
                    delay = 1.5
                time.sleep(max(0.5, min(delay, 4.0)))
                continue
            return None
        except (URLError, TimeoutError, json.JSONDecodeError):
            return None
    return None


def search_addresses(query: str, limit: int = 5) -> list[dict]:
    q = (query or '').strip()
    if len(q) < 3:
        return []

    safe_limit = max(1, min(limit, 10))
    cache_key = f'{q.lower()}::{safe_limit}'
    cached = _cache_get(_search_cache, cache_key, SEARCH_CACHE_TTL_SECONDS)
    if cached is not None:
        return cached

    params = parse.urlencode(
        {
            'q': q,
            'format': 'jsonv2',
            'addressdetails': 1,
            'limit': safe_limit,
        }
    )
    url = f'{NOMINATIM_BASE}/search?{params}'
    data = _fetch_json(url)

    if not isinstance(data, list):
        return []

    results = [
        {
            'display_name': item.get('display_name', ''),
            'lat': float(item.get('lat', 0.0)),
            'lng': float(item.get('lon', 0.0)),
        }
        for item in data
    ]
    _cache_set(_search_cache, cache_key, results)
    return results


def reverse_geocode(lat: float, lng: float) -> dict:
    cache_key = f'{round(lat, 6)}::{round(lng, 6)}'
    cached = _cache_get(_reverse_cache, cache_key, REVERSE_CACHE_TTL_SECONDS)
    if cached is not None:
        return cached

    params = parse.urlencode(
        {
            'lat': lat,
            'lon': lng,
            'format': 'jsonv2',
            'addressdetails': 1,
        }
    )
    url = f'{NOMINATIM_BASE}/reverse?{params}'
    data = _fetch_json(url)

    if not isinstance(data, dict):
        return {'display_name': ''}

    result = {
        'display_name': data.get('display_name', ''),
        'lat': float(data.get('lat', lat)),
        'lng': float(data.get('lon', lng)),
    }
    _cache_set(_reverse_cache, cache_key, result)
    return result
