import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/common/Navbar';
import MapComponent from '../components/map/MapComponent';
import TourCartPanel from '../components/common/TourCartPanel';
import { fetchPOIs } from '../utils/api/poiService';
import { useLanguage } from '../utils/i18n/LanguageContext';
import { NoodleBowlIcon, StarIcon } from '../components/common/Icons';

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const [pois, setPOIs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('explore');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      // Nếu chưa đăng nhập, chuyển hướng sang trang login
      router.push('auth/login');
      return;
    }

    // Nếu đã đăng nhập, tải dữ liệu POI từ backend
    setIsAuthenticated(true);
    fetchPOIs().then((data) => {
      setPOIs(Array.isArray(data) ? data : []);
      setLoading(false);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  const filteredPOIs = pois.filter((poi) =>
    poi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    poi.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExplore = () => {
    router.push('/explorer/map');
  };

  const handleTour = () => {
    router.push('/tour/tour-mode');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p>{t('home_loading')}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <TourCartPanel />
      <div className="min-h-screen bg-[#FFFFFF] p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              {/* Search Bar */}
              <div className="relative w-full md:w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#757575]">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('home_search_placeholder')}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#DDDDDD] focus:outline-none focus:ring-2 focus:ring-[#212121]"
                  style={{
                    height: "36px", 
                    width: "100%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <MapComponent
              pois={filteredPOIs}
              userLocation={userLocation}
              onPOISelect={(poi) => router.push(`/poi/${poi.id}`)}
            />
          </div>

          {/* POI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPOIs.length > 0 ? (
              filteredPOIs.map((poi) => (
                <div
                  key={poi.id}
                  onClick={() => router.push(`/poi/${poi.id}`)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden"
                >
                  {/* POI Image or Icon */}
                  <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 h-32 flex items-center justify-center">
                    <NoodleBowlIcon className="w-12 h-12 text-[#374151]" />
                  </div>

                  {/* POI Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-[#212121] text-sm mb-1 line-clamp-2">{poi.name}</h3>
                    <p className="text-xs text-[#757575] mb-3 line-clamp-2">{poi.description}</p>

                    {/* Rating and Price */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-yellow-500 inline-flex items-center gap-1"><StarIcon className="w-4 h-4" /> {poi.rating}</span>
                      <span className="text-[#757575] font-semibold">{poi.price}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-[#757575]">{t('map_no_poi')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}