import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Modal from '../common/Modal';
import MapComponent from './MapComponent';
import { ClockIcon, LocationIcon, PriceIcon, ChatIcon } from '../common/Icons';

// Check Mark Icon
const CheckCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

export default function TourMode({ tour, onComplete, onPOIChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visitedPOIs, setVisitedPOIs] = useState(new Set());
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [expandedPOI, setExpandedPOI] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [showFloatDetail, setShowFloatDetail] = useState(false);

  useEffect(() => {
    // Initialize GPS tracking
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        () => {
          setGpsError(true);
          setLoading(false);
        }
      );

      // Watch position continuously
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setGpsError(true);
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  if (loading) return <Loading fullScreen text="Đang khởi tạo GPS..." />;

  const currentPOI = tour[currentIndex];

  const handleNext = () => {
    if (currentIndex < tour.length - 1) {
      setCurrentIndex(currentIndex + 1);
      onPOIChange && onPOIChange(tour[currentIndex + 1]);
    } else {
      setTourCompleted(true);
      onComplete && onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      onPOIChange && onPOIChange(tour[currentIndex - 1]);
    }
  };

  const handleMarkVisited = () => {
    const newVisited = new Set(visitedPOIs);
    newVisited.add(currentPOI.id);
    setVisitedPOIs(newVisited);
    // Auto next after marking visited
    setTimeout(() => handleNext(), 500);
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distanceToPOI = userLocation
    ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        currentPOI.location.lat,
        currentPOI.location.lng
      )
    : null;

  const isNearPOI = distanceToPOI && distanceToPOI < 0.05; // 50 meters
  const tourDuration = `${tour.length * 30} phút`;
  const tourDistance = '1.2 km';
  const progress = ((currentIndex + 1) / tour.length) * 100;

  const getPoiIcon = (category) => {
    const iconMap = {
      'Phở': '🍜',
      'Bánh Mì': '🥖',
      'Cơm Tấm': '🍚',
      'Café': '☕',
      'Cafe': '☕',
      'Chè': '🍧',
    };
    return iconMap[category] || '🍽️';
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
      {/* Header */}
      <div className="bg-[#F5F5F5] border-b border-[#DDDDDD] text-[#212121] p-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍽️</span>
              <h1 className="text-xl md:text-2xl font-bold text-[#000000]">{tour.length > 0 ? tour[0]?.tourName || 'Tour Ẩm Thực Truyền Thống' : 'Tour'}</h1>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#000000]">Tiến trình: {currentIndex + 1}/{tour.length}</p>
              <p className="text-xs text-[#757575]">{tourDuration} • {tourDistance}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#EAEAEA] rounded-full overflow-hidden h-2">
            <div 
              className="bg-[#333333] h-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {isOffRoute && (
        <div className="bg-[#FFC107] text-[#000000] px-4 py-3 flex items-center gap-3 border-l-4 border-[#FFB300] z-20">
          <span className="text-xl">⚠️</span>
          <span className="font-semibold text-sm md:text-base">Bạn đang đi sai hướng. Quay lại POI hiện tại!</span>
        </div>
      )}

      {/* Success Banner */}
      {isNearPOI && (
        <div className="bg-[#28A745] text-white px-4 py-3 flex items-center gap-3 border-l-4 border-[#20c997] z-20 animate-pulse">
          <span className="text-xl">✓</span>
          <span className="font-semibold text-sm md:text-base">Bạn đã gần tới POI này! Nhấn "Đánh dấu đã đến"</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 h-full">
          {/* Map - Full width / Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
            {/* Map Section - 3 columns on desktop */}
            <div className="lg:col-span-3 bg-[#EDEDED] rounded-lg shadow-lg overflow-hidden" style={{ minHeight: '500px' }}>
              <MapComponent
                pois={tour}
                userLocation={userLocation}
                route={tour}
                currentPOIIndex={currentIndex}
                onPOISelect={(poi) => {
                  const index = tour.findIndex(p => p.id === poi.id);
                  if (index !== -1) {
                    setCurrentIndex(index);
                    setSelectedPOI(poi);
                    setShowFloatDetail(true);
                  }
                }}
              />
            </div>

            {/* POI List Sidebar - 1 column on desktop */}
            <div className="hidden lg:block bg-[#F5F5F5] rounded-lg shadow-lg p-4 h-fit sticky top-24 border border-[#DDDDDD]">
              <h3 className="font-bold text-[#000000] mb-3 text-sm">📍 Danh sách POI</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tour.map((poi, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setSelectedPOI(poi);
                      setShowFloatDetail(true);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition text-xs md:text-sm ${
                      idx === currentIndex
                        ? 'bg-[#333333] text-white shadow-md'
                        : visitedPOIs.has(poi.id)
                        ? 'bg-[#28A745]/20 border-l-4 border-[#28A745] text-[#212121]'
                        : 'bg-[#EAEAEA] hover:bg-[#DDDDDD] text-[#212121]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg w-6 h-6 flex items-center justify-center rounded-full bg-[#333333] text-white">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{poi.name}</div>
                        <div className="opacity-75 text-xs text-[#757575]">{poi.category}</div>
                      </div>
                      {visitedPOIs.has(poi.id) && <CheckCircleIcon className="w-4 h-4 text-[#28A745] flex-shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Float Detail Card */}
      {currentPOI && (
        <div className="bg-[#F5F5F5] shadow-2xl rounded-t-2xl md:rounded-lg p-4 md:p-6 border-t border-[#DDDDDD] md:border">
          {/* Header with POI Icon and Basic Info */}
          <div className="flex gap-4 mb-4 pb-4 border-b border-[#DDDDDD]">
            <span className="text-5xl flex-shrink-0">{getPoiIcon(currentPOI.category)}</span>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold text-[#000000] mb-1">{currentPOI.name}</h2>
              <p className="text-[#757575] text-sm mb-2 line-clamp-2">{currentPOI.description}</p>
              
              {/* Quick Info */}
              <div className="flex flex-wrap gap-3 text-xs md:text-sm">
                <span className="font-semibold text-[#333333]">{distanceToPOI !== null ? `${(distanceToPOI * 1000).toFixed(0)}m` : 'Đang tính'}</span>
                <span className="text-[#FFC107]">⭐ {currentPOI.rating}</span>
                <span className="text-[#757575]">💰 {currentPOI.price}</span>
              </div>
            </div>
          </div>

          {/* Status Box */}
          <div className={`rounded-lg p-3 mb-4 ${isNearPOI ? 'bg-[#28A745]/20 border-l-4 border-[#28A745]' : 'bg-[#EAEAEA]/50 border-l-4 border-[#333333]'}`}>
            {isNearPOI ? (
              <div className="flex items-center gap-2 text-[#28A745] font-semibold text-sm">
                <CheckCircleIcon className="w-5 h-5" />
                Bạn đã gần tới POI này ({'\u003c'} 50m)!
              </div>
            ) : (
              <p className="text-sm text-[#212121]">
                <span className="font-semibold text-[#000000]">Tiếp tục di chuyển</span> để đến {currentPOI.name} (còn {distanceToPOI ? `${(distanceToPOI * 1000).toFixed(0)}m` : 'đang tính'})
              </p>
            )}
          </div>

          {/* Expandable Details */}
          {expandedPOI && (
            <div className="mb-4 p-4 bg-[#EAEAEA] rounded-lg space-y-3 text-sm border border-[#DDDDDD]">
              {currentPOI.address && (
                <div className="flex gap-2">
                  <span>📍</span>
                  <div>
                    <p className="text-xs text-[#757575] font-semibold">Địa chỉ</p>
                    <p className="text-[#212121]">{currentPOI.address}</p>
                  </div>
                </div>
              )}
              {currentPOI.hours && (
                <div className="flex gap-2">
                  <span>🕐</span>
                  <div>
                    <p className="text-xs text-[#757575] font-semibold">Giờ mở cửa</p>
                    <p className="text-[#212121]">{currentPOI.hours}</p>
                  </div>
                </div>
              )}
              {currentPOI.phone && (
                <div className="flex gap-2">
                  <span>📞</span>
                  <div>
                    <p className="text-xs text-[#757575] font-semibold">Điện thoại</p>
                    <p className="text-[#212121]">{currentPOI.phone}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="py-2 px-3 bg-[#EAEAEA] text-[#212121] rounded-lg font-semibold text-sm hover:bg-[#DDDDDD] transition disabled:opacity-50 disabled:cursor-not-allowed border border-[#DDDDDD]"
            >
              ← Quay lại
            </button>
            
            <button
              onClick={() => setExpandedPOI(!expandedPOI)}
              className="py-2 px-3 bg-[#212121] text-white rounded-lg font-semibold text-sm hover:bg-[#333333] transition border-none"
            >
              {expandedPOI ? 'Ẩn' : 'Xem'} chi tiết
            </button>
            
            <button
              onClick={handleMarkVisited}
              disabled={visitedPOIs.has(currentPOI.id)}
              className="py-2 px-3 bg-[#28A745] text-white rounded-lg font-semibold text-sm hover:bg-[#20c997] transition disabled:opacity-50 disabled:bg-[#1a5f2f] disabled:cursor-not-allowed"
            >
              Đã đến
            </button>
            
            <button
              onClick={handleNext}
              className="py-2 px-3 bg-[#333333] text-white rounded-lg font-semibold text-sm hover:bg-[#444444] transition"
            >
              {currentIndex === tour.length - 1 ? 'Hoàn thành' : 'Tiếp'}
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={gpsError}
        onClose={() => setGpsError(false)}
        title="Lỗi GPS"
        message="Không thể kết nối GPS. Vui lòng kích hoạt vị trí trên thiết bị của bạn."
        type="error"
      />

      <Modal
        isOpen={tourCompleted}
        onClose={() => setTourCompleted(false)}
        title="Tour hoàn thành!"
        message={`Chúc mừng! Bạn đã hoàn thành tất cả ${tour.length} địa điểm trong tour này.`}
        type="success"
      />
    </div>
  );
}
