import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Loading from '../components/common/Loading';

export default function QRHandlerPage() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const { entry, poi, destination } = router.query;
    const token = localStorage.getItem('accessToken');

    const resolveTarget = () => {
      if (poi) {
        const poiId = Number(poi);
        // Trust the backend to enforce visibility; navigate directly to the POI page
        if (destination === 'map') {
          return `/explorer/map?focusPoi=${poiId}&fromQr=1`;
        }
        return `/poi/${poiId}?fromQr=1`;
      }

      if (entry) {
        return '/explorer/map';
      }

      return '/explorer/map';
    };

    const target = resolveTarget();

    if (!token) {
      sessionStorage.setItem('redirectAfterLogin', target);
      router.replace({
        pathname: '/auth/login',
        query: { returnTo: target },
      });
      return;
    }

    router.replace(target);
  }, [router, router.isReady, router.query]);

  return <Loading fullScreen text="Dang chuyen huong tu QR..." />;
}
