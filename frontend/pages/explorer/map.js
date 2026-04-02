import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/common/Navbar';
import MapComponent from '../../components/map/MapComponent';
import Loading from '../../components/common/Loading';
import { 
  ClockIcon, 
  LocationIcon, 
  PriceIcon, 
  HeadphoneIcon, 
  DirectionIcon, 
  PlusIcon, 
  PlayIcon, 
  PauseIcon, 
  ChatIcon, 
  StarIcon,
  MapPinIcon 
} from '../../components/common/Icons';
import { mockPOIs } from '../../utils/api/mockData';


export default function MapPage() {
  const router = useRouter();
  const [pois, setPOIs] = useState([]);
  const [filteredPOIs, setFilteredPOIs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('explore');
  const [showPoiSheet, setShowPoiSheet] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [route, setRoute] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { from: 'bot', text: 'Xin chào! Tôi là trợ lý ẩm thực Vĩnh Khánh. Hãy hỏi tôi về quán ăn hoặc món ngon.' },
  ]);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/auth/login');
      return;
    }

    setPOIs(mockPOIs);
    setFilteredPOIs(mockPOIs);
    setLoading(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, [router]);

  useEffect(() => {
    const next = pois.filter((poi) =>
      poi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poi.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPOIs(next);
  }, [searchTerm, pois]);

  const handleExplore = () => {
    setActiveTab('explore');
    router.push('/explorer/map');
  };

  const handleTour = () => {
    setActiveTab('tour');
    router.push('/tour/tour-mode');
  };

  const handlePoiSelect = (poi) => {
    setSelectedPoi(poi);
    setShowPoiSheet(false);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { from: 'user', text: chatInput.trim() }];
    setChatMessages(newMessages);
    setChatInput('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { from: 'bot', text: 'Cảm ơn bạn đã hỏi! Đây là phản hồi mẫu.' },
      ]);
    }, 600);
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
    return (R * c).toFixed(2);
  };

  const handlePlayAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    // Placeholder for audio functionality
    if (!isPlayingAudio) {
      console.log('Playing audio guide for:', selectedPoi?.name);
    }
  };

  const handleGetDirections = () => {
    if (selectedPoi && userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        selectedPoi.location.lat,
        selectedPoi.location.lng
      );
      
      // Set route to show on map (from user location through POI)
      setRoute([{
        id: 'user-location',
        location: userLocation,
        name: 'Vị trí của bạn'
      }, selectedPoi]);
      
      // Store route info for display
      setRouteInfo({
        destination: selectedPoi.name,
        distance: distance,
        estimatedTime: (distance / 20).toFixed(1) // Rough estimate: ~20km/hour average
      });
      
      // Close modal and show route info
      setSelectedPoi(null);
    }
  };

  const handleAddToTour = () => {
    alert(`Đã thêm "${selectedPoi.name}" vào tour!`);
    // Implement tour functionality
  };

  const handleClearRoute = () => {
    setRoute([]);
    setRouteInfo(null);
  };

  if (loading) return <Loading fullScreen />;

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
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
                  placeholder="Tìm kiếm POI..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Tìm kiếm POI"
                />
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  className={`px-5 py-2 rounded-lg font-semibold text-sm shadow-sm ${activeTab === 'explore' ? 'bg-black text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                  onClick={handleExplore}
                >
                  Khám phá
                </button>
                <button
                  className={`px-5 py-2 rounded-lg font-semibold text-sm shadow-sm ${activeTab === 'tour' ? 'bg-black text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                  onClick={handleTour}
                >
                  Tour
                </button>
              </div>
            </div>
            
            {/* Map Controls Toolbar */}
            <div className="flex gap-3 mt-4 flex-wrap">
              <button
                className="px-4 py-2 rounded-full bg-[#333333] text-white text-sm font-semibold shadow-md hover:bg-[#444444] transition flex items-center gap-2"
                onClick={() => setShowPoiSheet((prev) => !prev)}
              >
                <MapPinIcon className="w-4 h-4" />
                {filteredPOIs.length} địa điểm
              </button>
              <button
                onClick={handleTour}
                className="px-4 py-2 bg-[#28A745] text-white rounded-lg text-sm font-semibold shadow-md hover:bg-[#218838] transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
                Chuyển sang Tour
              </button>
            </div>
          </div>

          <div className="relative bg-[#FFFFFF] rounded-2xl shadow-lg border border-[#DDDDDD] overflow-hidden z-1" style={{ height: '72vh' }}>
            <MapComponent
              pois={filteredPOIs}
              userLocation={userLocation}
              onPOISelect={handlePoiSelect}
              loading={false}
              route={route}
            />
            
            {/* Route Info Panel - Show when route is active */}
            {routeInfo && (
              <div className="absolute bottom-4 left-4 right-4 max-w-sm bg-[#FFFFFF] rounded-lg shadow-lg border border-[#DDDDDD] p-4 z-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-[#212121] text-sm mb-1">🗺️ Chỉ đường tới</h3>
                    <p className="text-lg font-bold text-[#333333]">{routeInfo.destination}</p>
                  </div>
                  <button
                    onClick={handleClearRoute}
                    className="text-[#757575] hover:text-[#212121] text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-[#EAEAEA] rounded p-2">
                    <p className="text-[#757575] text-xs font-semibold">Khoảng cách</p>
                    <p className="text-[#333333] font-bold">{routeInfo.distance} km</p>
                  </div>
                  <div className="bg-[#EAEAEA] rounded p-2">
                    <p className="text-[#757575] text-xs font-semibold">Thời gian</p>
                    <p className="text-[#333333] font-bold">~{routeInfo.estimatedTime} phút</p>
                  </div>
                </div>
                
                <p className="text-xs text-[#757575] text-center">Đường được tính toán bằng OSRM</p>
              </div>
            )}
          </div>

          {/* POI List Sheet - Moved outside map container */}
          <div
            className={`fixed inset-x-0 bottom-0 z-[9999] transform transition-transform duration-300 ease-out ${showPoiSheet ? 'translate-y-0' : 'translate-y-full'}`}
            style={{ maxHeight: '55vh' }}
          >
            <div className="mx-4 mb-4 bg-[#FFFFFF] rounded-t-2xl shadow-xl border border-[#DDDDDD] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#DDDDDD]">
                  <h2 className="font-bold text-lg text-[#212121]">Danh sách địa điểm</h2>
                  <button onClick={() => setShowPoiSheet(false)} className="text-xl font-bold">×</button>
                </div>
                <div className="max-h-[42vh] overflow-y-auto p-4 space-y-3">
                  {filteredPOIs.length === 0 ? (
                    <p className="text-[#757575]">Không tìm thấy POI phù hợp.</p>
                  ) : (
                    filteredPOIs.map((poi) => (
                      <button
                        key={poi.id}
                        onClick={() => handlePoiSelect(poi)}
                        className="w-full text-left p-3 rounded-lg border border-[#DDDDDD] hover:bg-[#EAEAEA] transition"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{poi.category === 'Phở' ? '🍜' : poi.category === 'Bánh Mì' ? '🥖' : poi.category === 'Cơm Tấm' ? '🍚' : poi.category.includes('Cafe') ? '☕' : '🍧'}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-base text-[#212121]">{poi.name}</h3>
                            <p className="text-sm text-[#757575] mt-1">{poi.description}</p>
                            <div className="mt-1 text-sm flex items-center gap-1">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: Math.round(poi.rating) }).map((_, i) => (
                                  <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                                ))}
                              </div>
                              <span className="text-[#757575] text-xs ml-1">{poi.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

          {/* Improved POI Detail Modal - Moved outside map container */}
          {selectedPoi && (
            <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#DDDDDD] flex flex-col max-h-[90vh]">
                {/* Header with close button - Fixed */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDDDDD] bg-gradient-to-r from-[#F5F5F5] to-[#EAEAEA] flex-shrink-0">
                  <h2 className="text-lg font-bold text-[#212121]">Chi tiết địa điểm</h2>
                  <button onClick={() => setSelectedPoi(null)} className="text-2xl font-bold text-[#757575] hover:text-[#212121]">×</button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {/* POI Image */}
                  {selectedPoi.image && (
                    <div className="rounded-lg overflow-hidden shadow-sm">
                      <img src={selectedPoi.image} alt={selectedPoi.name} className="w-full h-40 object-cover" />
                    </div>
                  )}

                  {/* POI Name & Category */}
                  <div>
                    <h3 className="text-2xl font-bold text-[#212121] mb-2">{selectedPoi.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 bg-[#DC3545]/20 text-[#DC3545] text-xs font-semibold rounded-full">
                        {selectedPoi.category}
                      </span>
                    </div>
                  </div>

                  {/* Rating & Views */}
                  <div className="flex items-center justify-between bg-[#EAEAEA] rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-5 h-5 text-[#FFC107]" />
                        <span className="font-bold text-[#212121]">{selectedPoi.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-[#757575]">({Math.floor(Math.random() * 5000) + 1000} đánh giá)</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm text-[#212121] leading-relaxed">{selectedPoi.description}</p>
                  </div>

                  {/* Opening Hours */}
                  <div className="flex items-start gap-3 bg-[#EAEAEA] rounded-lg p-3">
                    <ClockIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Giờ mở cửa</p>
                      <p className="text-sm text-gray-800 font-medium">{selectedPoi.hours || '6:00 - 22:00'}</p>
                    </div>
                  </div>

                  {/* Distance */}
                  {userLocation && (
                    <div className="flex items-start gap-3 bg-green-50 rounded-lg p-3">
                      <LocationIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Khoảng cách</p>
                        <p className="text-sm text-gray-800 font-medium">
                          {calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            selectedPoi.location.lat,
                            selectedPoi.location.lng
                          )} km
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-start gap-3 bg-purple-50 rounded-lg p-3">
                    <PriceIcon className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Giá</p>
                      <p className="text-sm text-gray-800 font-medium">{selectedPoi.price || '$$'}</p>
                    </div>
                  </div>

                  {/* Address & Phone */}
                  {(selectedPoi.address || selectedPoi.phone) && (
                    <div className="space-y-2">
                      {selectedPoi.address && (
                        <div className="flex items-start gap-3">
                          <span className="text-sm text-gray-600 font-semibold min-w-16">Địa chỉ:</span>
                          <span className="text-sm text-gray-800">{selectedPoi.address}</span>
                        </div>
                      )}
                      {selectedPoi.phone && (
                        <div className="flex items-start gap-3">
                          <span className="text-sm text-gray-600 font-semibold min-w-16">Điện thoại:</span>
                          <span className="text-sm text-gray-800">{selectedPoi.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Audio Guide */}
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                        <HeadphoneIcon className="w-5 h-5 text-yellow-600" />
                        Hướng dẫn bằng giọng nói
                      </h4>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-1 mb-3">
                      <div className="bg-yellow-500 h-1 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Hướng dẫn âm thanh chi tiết về nhà hàng này</p>
                    <button
                      onClick={handlePlayAudio}
                      className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition text-sm flex items-center justify-center gap-2"
                    >
                      {isPlayingAudio ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                      {isPlayingAudio ? 'Tạm dừng' : 'Phát âm thanh'}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <button
                      onClick={handleGetDirections}
                      className="px-4 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <DirectionIcon className="w-5 h-5" />
                      Chỉ đường
                    </button>
                    <button
                      onClick={handleAddToTour}
                      className="px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Thêm Tour
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Button - Moved outside map container */}
          <button
            onClick={() => setShowChat((prev) => !prev)}
            className="fixed bottom-20 right-6 z-[9999] w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl hover:bg-blue-700 transition"
          >
            <ChatIcon className="w-6 h-6" />
          </button>

          {/* Chat Window - Moved outside map container */}
          {showChat && (
            <div className="fixed bottom-24 right-4 z-[9999] w-[340px] bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden">
              <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold">Trợ lý ẩm thực</p>
                  <p className="text-xs opacity-80">Hỗ trợ hỏi đáp nhanh</p>
                </div>
                <button onClick={() => setShowChat(false)} className="text-white font-bold">×</button>
              </div>
              <div className="h-64 overflow-y-auto p-3 space-y-2 bg-gray-50">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={msg.from === 'bot' ? 'text-left' : 'text-right'}>
                    <span className={`inline-block rounded-xl px-3 py-2 text-sm ${msg.from === 'bot' ? 'bg-white text-gray-700' : 'bg-blue-600 text-white'}`}>
                      {msg.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                />
                <button onClick={handleSendChat} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">
                  Gửi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
