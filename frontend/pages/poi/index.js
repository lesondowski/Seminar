import React from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/common/Navbar';
import { mockPOIs } from '../../utils/api/mockData';
import Button from '../../components/common/Button';
import { ArrowLeftIcon, StarIcon } from '../../components/common/Icons';

export default function POIListPage() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Danh sách địa điểm</h1>
            <Button variant="secondary" onClick={() => router.push('/explorer/map')}>
              <span className="inline-flex items-center gap-1"><ArrowLeftIcon className="w-4 h-4" />Quay lại bản đồ</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {mockPOIs.map((poi) => (
              <div key={poi.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition hover:shadow-xl">
                <div className="h-44 overflow-hidden">
                  <img
                    src={poi.image || '/placeholder.jpg'}
                    alt={poi.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h2 className="text-xl font-bold text-gray-800">{poi.name}</h2>
                    <span className="text-sm text-yellow-500 font-semibold inline-flex items-center gap-1"><StarIcon className="w-4 h-4" /> {poi.rating}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{poi.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{poi.category}</span>
                    <span>Giá: {poi.price}</span>
                    <span>Giờ mở cửa: 06:00 - 22:00</span>
                    <span>Khoảng cách: 0.02 km</span>
                  </div>
                  <button
                    onClick={() => router.push(`/poi/${poi.id}`)}
                    className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
