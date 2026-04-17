import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import { fetchPOIById } from '../../utils/api/poiService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { useTourCart } from '../../utils/tourCart/TourCartContext';
import MapComponent from '../../components/map/MapComponent';
import { CheckIcon, StarIcon, DirectionIcon, PlusIcon } from '../../components/common/Icons';
import NarrationBlock from '../../components/poi/NarrationBlock';
import { useLanguage } from '../../utils/i18n/LanguageContext';

export default function POIDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [toast, setToast] = useState(false);
  const [poi, setPoi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { userPOIs, addPOI } = useTourCart();
  const { language } = useLanguage();

  const alreadyInCart = useMemo(() => userPOIs.some((p) => String(p.id) === String(id)), [userPOIs, id]);
  const poiTourPosition = useMemo(
    () => userPOIs.findIndex((p) => String(p.id) === String(id)),
    [userPOIs, id]
  );

  useEffect(() => {
    if (!router.isReady) return;
    const token = localStorage.getItem('accessToken');
    if (!token) {
      const returnTo = `/poi/${id}`;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', returnTo);
      }
      router.replace({ pathname: '/auth/login', query: { returnTo } });
      return;
    }
    fetchPOIById(id).then((data) => {
      if (!data) setNotFound(true);
      else setPoi(data);
      setLoading(false);
    }).catch(() => {
      setNotFound(true);
      setLoading(false);
    });
  }, [router, router.isReady, id]);

  if (loading) return <Loading fullScreen />;

  if (notFound || !poi) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p className="text-[#757575]">Không tìm thấy POI</p>
      </div>
    );
  }

  const mapLink = `https://www.google.com/maps?q=${poi.location.lat},${poi.location.lng}`;

  return (
    <>
      <Navbar />
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-[#333333] text-white px-6 py-3 rounded-xl shadow-lg text-sm font-semibold animate-bounce">
          <span className="inline-flex items-center gap-2"><CheckIcon className="w-4 h-4" />Đã thêm vào Tour</span>
        </div>
      )}
      <div className="min-h-screen bg-[#F5F5F5] p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <img src={poi.image || '/placeholder.jpg'} alt={poi.name} className="w-full h-56 object-cover" />

          <div className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-4xl font-bold text-[#212121]">{poi.name}</h1>
                <div className="flex items-center gap-3 mt-2 text-[#757575]">
                  <StarIcon className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-xl text-orange-500">{poi.rating}</span>
                  <span>1234 lượt xem</span>
                </div>
                {poiTourPosition >= 0 && (
                  <div className="mt-3 inline-flex items-center rounded-full px-3 py-1 bg-gray-800 text-white text-xs font-semibold">
                    Vị trí trong tour: #{poiTourPosition + 1}
                  </div>
                )}
              </div>
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">{poi.category}</div>
            </div>

            <p className="text-gray-700 leading-relaxed">{poi.description}</p>

            <NarrationBlock
              narration={poi.narration}
              deviceLanguage={language}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-gray-700">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-sm">Giờ mở cửa</p>
                <p className="font-semibold">15:00 - 23:00</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-sm">Khoảng cách</p>
                <p className="font-semibold">0.02 km</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-sm">Giá</p>
                <p className="font-semibold">{poi.price}</p>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <h2 className="font-bold text-lg">Vị trí bản đồ</h2>
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-[#212121] text-white text-sm font-semibold hover:bg-[#333333] transition"
                >
                  Mở Google Maps
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                  <span className="font-semibold text-gray-800">Vĩ độ:</span> {poi.location.lat.toFixed(6)}
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                  <span className="font-semibold text-gray-800">Kinh độ:</span> {poi.location.lng.toFixed(6)}
                </div>
              </div>
              <div className="h-72 rounded-lg overflow-hidden border border-gray-300">
                <MapComponent
                  pois={[poi]}
                  selectedPOIId={poi.id}
                  initialCenter={poi.location}
                  disableAutoLocate
                  showUserMarker={false}
                  onPOISelect={() => {}}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-2">
              <Button onClick={() => router.push('/explorer/map')} variant="secondary" className="flex-1">
                <span className="inline-flex items-center gap-2"><DirectionIcon className="w-4 h-4" />Chỉ đường</span>
              </Button>
              <Button
                onClick={() => {
                  if (!alreadyInCart) {
                    addPOI(poi);
                    setToast(true);
                    setTimeout(() => setToast(false), 2000);
                  }
                }}
                variant={alreadyInCart ? 'success' : 'primary'}
                className="flex-1"
                disabled={alreadyInCart}
              >
                {alreadyInCart ? (
                  <span className="inline-flex items-center gap-2"><CheckIcon className="w-4 h-4" />Đã có trong Tour</span>
                ) : (
                  <span className="inline-flex items-center gap-2"><PlusIcon className="w-4 h-4" />Thêm vào Tour</span>
                )}
              </Button>
            </div>

            <div className="text-sm text-gray-500">Audio hỗ trợ cả ngôn ngữ gốc và nội dung đã dịch theo lựa chọn của bạn.</div>
          </div>
        </div>
      </div>
    </>
  );
}
