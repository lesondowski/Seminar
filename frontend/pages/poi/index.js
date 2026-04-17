import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/common/Navbar';
import { fetchPOIs } from '../../utils/api/poiService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { ArrowLeftIcon, StarIcon } from '../../components/common/Icons';

export default function POIListPage() {
  const router = useRouter();
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    fetchPOIs().then((data) => {
      setPois(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, [router]);

  if (loading) return <Loading fullScreen />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F5F5F5] p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[#212121]">Danh sách địa điểm</h1>
            <Button variant="secondary" onClick={() => router.push('/explorer/map')}>
              <span className="inline-flex items-center gap-1"><ArrowLeftIcon className="w-4 h-4" />Quay lại bản đồ</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pois.map((poi) => (
              <div key={poi.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#DDDDDD] transition hover:shadow-xl">
                <div className="h-44 overflow-hidden">
                  <img
                    src={poi.image || '/placeholder.jpg'}
                    alt={poi.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h2 className="text-xl font-bold text-[#212121]">{poi.name}</h2>
                    <span className="text-sm text-yellow-500 font-semibold inline-flex items-center gap-1"><StarIcon className="w-4 h-4" /> {poi.rating}</span>
                  </div>
                  <p className="text-[#757575] text-sm">{poi.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-[#757575]">
                    <span className="bg-[#EAEAEA] text-[#212121] px-2 py-1 rounded-full">{poi.category}</span>
                    <span>Giá: {poi.price}</span>
                    {poi.hours && <span>Giờ mở cửa: {poi.hours}</span>}
                  </div>
                  <button
                    onClick={() => router.push(`/poi/${poi.id}`)}
                    className="w-full bg-[#333333] text-white py-2 rounded-lg hover:bg-[#444444] transition"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
            {pois.length === 0 && (
              <p className="text-[#757575] col-span-3 text-center py-12">Không có địa điểm nào.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
