import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/common/Navbar';
import TourMode from '../../components/map/TourMode';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { mockPOIs, mockTours } from '../../utils/api/mockData';
import { MapPinIcon, ArrowRightIcon, ClockIcon } from '../../components/common/Icons';
import { useTourCart } from '../../utils/tourCart/TourCartContext';

export default function TourModePage() {
  const router = useRouter();
  const { userPOIs, clearAll } = useTourCart();
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTour, setSelectedTour] = useState(null);
  const [tourPOIs, setTourPOIs] = useState([]);
  const [loading, setLoading] = useState(true);
  // 'preset' | 'user-cart' — tracks which mode is active
  const [tourMode, setTourMode] = useState(null);

  useEffect(() => {
    // Check authentication
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/auth/login');
      return;
    }

    // Load tours and POIs
    setTours(mockTours);
    setFilteredTours(mockTours);
    setLoading(false);
  }, [router]);

  // Filter tours based on search term
  useEffect(() => {
    const next = tours.filter((tour) =>
      tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTours(next);
  }, [searchTerm, tours]);

  const handleSelectTour = (tour) => {
    // Get POIs for this tour
    const pois = tour.pois.map((poiId) =>
      mockPOIs.find((poi) => poi.id === poiId)
    ).filter(Boolean);

    setTourPOIs(pois);
    setSelectedTour(tour);
    setTourMode('preset');
  };

  const handleStartUserCart = () => {
    setTourPOIs(userPOIs);
    setTourMode('user-cart');
  };

  if (loading) return <Loading fullScreen />;

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar Section - Synchronized with explorer/map */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:w-3/4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm tour..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Tìm kiếm tour"
                />
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  className="px-5 py-2 rounded-lg font-semibold text-sm shadow-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  onClick={() => router.push('/explorer/map')}
                >
                  Tự khám phá
                </button>
                <button
                  className="px-5 py-2 rounded-lg font-semibold text-sm shadow-sm bg-black text-white"
                  onClick={() => router.push('/tour/tour-mode')}
                >
                  Lộ trình có sẵn
                </button>
              </div>
            </div>

            {/* Tour Controls Toolbar */}
            <div className="flex gap-3 mt-4 flex-wrap">
              <button
                className="px-4 py-2 rounded-full bg-[#333333] text-white text-sm font-semibold shadow-md hover:bg-[#444444] transition flex items-center gap-2"
                disabled
              >
                <MapPinIcon className="w-4 h-4" />
                {filteredTours.length} tour
              </button>
            </div>
          </div>

          {tourMode !== null ? (
            <TourMode
              tour={tourPOIs}
              onComplete={() => {
                setSelectedTour(null);
                setTourMode(null);
                if (tourMode === 'user-cart') clearAll();
                router.push('/');
              }}
              onPOIChange={(poi) => console.log('Changed to POI:', poi.name)}
            />
          ) : (
            <div>
              <h1 className="text-4xl font-bold text-[#000000] mb-2">Chọn Tour Ẩm Thực</h1>
              <p className="text-[#757575] mb-8">Khám phá các tour Ẩm thực tuyệt vời ở Hà Nội</p>

              {/* User cart tour card — shown only when cart is not empty */}
              {userPOIs.length > 0 && (
                <div
                  onClick={handleStartUserCart}
                  className="mb-6 cursor-pointer rounded-2xl overflow-hidden border-2 border-[#333333] hover:shadow-xl transition"
                  style={{ transform: 'translateY(0px)', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
                >
                  <div style={{ background: 'linear-gradient(to right, #1a1a2e, #16213e)', padding: '1rem 1.5rem' }}>
                    <div className="flex items-center gap-3 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                      >
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.26a1 1 0 00.95.69h6.583c.969 0 1.371 1.24.588 1.81l-5.325 3.87a1 1 0 00-.364 1.118l2.036 6.26c.3.921-.755 1.688-1.54 1.118l-5.325-3.87a1 1 0 00-1.176 0l-5.325 3.87c-.784.57-1.838-.197-1.539-1.118l2.036-6.26a1 1 0 00-.364-1.118L.89 11.687c-.783-.57-.38-1.81.588-1.81h6.583a1 1 0 00.95-.69l2.036-6.26z" />
                      </svg>

                      <h2 className="text-xl font-bold">
                        Tour tùy chỉnh của bạn
                      </h2>
                    </div>
                  </div>
                  <div className="bg-[#F5F5F5] px-6 py-4 flex items-center justify-between">
                    <p className="text-[#757575] text-sm">Lộ trình bạn đã tự chọn</p>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-[#757575] font-semibold">Địa điểm</p>
                        <p className="font-bold text-[#28A745]">{userPOIs.length}</p>
                      </div>
                      <span className="bg-[#333333] text-white text-sm font-semibold px-4 py-2 rounded-lg">
                        <span className="inline-flex items-center gap-1">Bắt đầu <ArrowRightIcon className="w-4 h-4" /></span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTours.map((tour) => (
                  <div
                    key={tour.id}
                    onClick={() => handleSelectTour(tour)}
                    style={{
                      backgroundColor: '#F5F5F5',
                      borderRadius: '1rem',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                      cursor: 'pointer',
                      border: '1px solid #333333',
                      overflow: 'hidden',
                      transform: 'translateY(0px)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
                  >
                    <div style={{
                      background: 'linear-gradient(to right, #333333, #444444)',
                      padding: '1rem 1.5rem',
                    }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '0.25rem' }}>
                        {tour.name}
                      </h2>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      <p style={{
                        color: '#757575',
                        marginBottom: '1rem',
                        WebkitLineClamp: 2,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {tour.description}
                      </p>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1rem',
                        marginBottom: '1rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid #DDDDDD',
                      }}>
                        <div style={{ backgroundColor: '#EAEAEA', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
                          <p style={{ color: '#757575', fontSize: '0.75rem', fontWeight: '600' }}>Thời lượng</p>
                          <p style={{ color: '#333333', fontWeight: '700' }} className="inline-flex items-center gap-1 justify-center w-full">
                            <ClockIcon className="w-4 h-4" />
                            {tour.duration}
                          </p>
                        </div>
                        <div style={{ backgroundColor: '#EAEAEA', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
                          <p style={{ color: '#757575', fontSize: '0.75rem', fontWeight: '600' }}>Địa điểm</p>
                          <p style={{ color: '#28A745', fontWeight: '700' }} className="inline-flex items-center gap-1 justify-center w-full">
                            <MapPinIcon className="w-4 h-4" />
                            {tour.pois.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
