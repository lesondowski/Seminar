import json
import urllib.error
import urllib.request

BASE_URL = 'http://127.0.0.1:8000/api/v1'


def call(method: str, path: str, data: dict | list | None = None, token: str | None = None):
    body = None
    headers = {}
    if data is not None:
        body = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    if token:
        headers['Authorization'] = f'Bearer {token}'

    req = urllib.request.Request(
        url=f'{BASE_URL}{path}',
        data=body,
        headers=headers,
        method=method,
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            text = resp.read().decode('utf-8')
            payload = json.loads(text) if text else None
            return resp.status, payload
    except urllib.error.HTTPError as exc:
        text = exc.read().decode('utf-8')
        try:
            payload = json.loads(text)
        except Exception:
            payload = {'raw': text}
        return exc.code, payload


def assert_ok(name: str, status: int, expected: tuple[int, ...]):
    ok = status in expected
    print(f'[{"PASS" if ok else "FAIL"}] {name}: status={status}, expected={expected}')
    return ok


def main():
    all_ok = True

    status, payload = call('GET', '/health')
    all_ok &= assert_ok('health', status, (200,))

    status, payload = call(
        'POST',
        '/auth/login',
        {'email': 'admin@gmail.com', 'language': 'vi', 'otp_verified': True},
    )
    all_ok &= assert_ok('auth.login(admin)', status, (200,))
    token = payload.get('access_token') if isinstance(payload, dict) else None

    if not token:
        all_ok = False
        print('[FAIL] auth.login(admin): missing access_token')
        print('Smoke test aborted due to missing token.')
        raise SystemExit(1)

    status, payload = call('GET', '/auth/profile', token=token)
    all_ok &= assert_ok('auth.profile', status, (200,))

    status, payload = call('GET', '/pois?limit=5&offset=0', token=token)
    all_ok &= assert_ok('pois.list', status, (200,))

    status, payload = call('GET', '/pois/1', token=token)
    all_ok &= assert_ok('pois.get(1)', status, (200,))

    status, payload = call('GET', '/pois/nearby?lat=21.01&lng=105.85&radiusKm=3', token=token)
    all_ok &= assert_ok('pois.nearby', status, (200,))

    status, payload = call('GET', '/tours?limit=5&offset=0', token=token)
    all_ok &= assert_ok('tours.list', status, (200,))

    status, payload = call('GET', '/tours/1', token=token)
    all_ok &= assert_ok('tours.get(1)', status, (200,))

    status, payload = call(
        'POST',
        '/tours',
        {
            'name': 'Quick Admin Test Tour',
            'description': 'Smoke test create tour',
            'language': 'VI',
            'status': 'draft',
            'duration': '45 min',
            'poi_ids': [1, 2],
        },
        token=token,
    )
    all_ok &= assert_ok('tours.create(admin)', status, (200,))

    created_id = payload.get('id') if isinstance(payload, dict) else None
    if created_id:
        status, _ = call('DELETE', f'/tours/{created_id}', token=token)
        all_ok &= assert_ok('tours.delete(created)', status, (200,))

    print('\nOverall:', 'PASS' if all_ok else 'FAIL')
    raise SystemExit(0 if all_ok else 1)


if __name__ == '__main__':
    main()
