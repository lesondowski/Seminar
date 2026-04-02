import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/common/Navbar';
import MapComponent from '../../components/map/MapComponent';
import ChatbotComponent from '../../components/chatbot/ChatbotComponent';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { mockPOIs } from '../../utils/api/mockData';

export default function ChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pois, setPOIs] = useState([]);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('explore');
  const [showPOIList, setShowPOIList] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/auth/login');
      return;
    }

    // Load POIs
    setPOIs(mockPOIs);
    setLoading(false);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, [router]);

  const filteredPOIs = pois.filter((poi) =>
    poi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    poi.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading fullScreen />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FFFFFF]">
        <div className="space-y-0">
          {/* Header Section */}
          <div className="bg-[#F5F5F5] shadow-md p-4 border-b border-[#DDDDDD]">
            <div className="max-w-7xl mx-auto space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-[#212121]">Vĩnh Khánh Food Tour</h1>
                <div className="w-full md:w-80">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-full p-3 rounded-lg border border-[#DDDDDD] focus:outline-none focus:ring-2 focus:ring-[#212121]"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActiveTab('explore');
                    setShowPOIList(false);
                  }}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    activeTab === 'explore'
                      ? 'bg-[#333333] text-white'
                      : 'bg-[#FFFFFF] text-[#212121] border border-[#DDDDDD] hover:bg-[#F5F5F5]'
                  }`}
                >
                  🗺️ Khám phá
                </button>
                <button
                  onClick={() => {
                    setActiveTab('tour');
                    router.push('/tour/tour-mode');
                  }}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    activeTab === 'tour'
                      ? 'bg-[#333333] text-white'
                      : 'bg-[#FFFFFF] text-[#212121] border border-[#DDDDDD] hover:bg-[#F5F5F5]'
                  }`}
                >
                  🎫 Tour
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Section */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-lg overflow-hidden relative">
                <MapComponent
                  pois={filteredPOIs}
                  userLocation={userLocation}
                  onPOISelect={setSelectedPOI}
                />

                {/* Button: Danh sách địa điểm */}
                <button
                  onClick={() => setShowPOIList(!showPOIList)}
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-900 transition flex items-center gap-2 font-semibold"
                >
                  ☰ {filteredPOIs.length} địa điểm
                </button>
              </div>

              {/* POI Detail Section */}
              <div className="lg:col-span-1">
                {selectedPOI ? (
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* POI Header */}
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="text-2xl font-bold">{selectedPOI.name}</h2>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg">⭐ {selectedPOI.rating}</span>
                            <span className="text-sm opacity-75">1234 lượt xem</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedPOI(null)}
                          className="text-white hover:opacity-75 text-xl"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* POI Content */}
                    <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                      {/* Category Badge */}
                      {selectedPOI.category && (
                        <div>
                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {selectedPOI.category}
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      <div>
                        <p className="text-gray-700 text-sm leading-relaxed">{selectedPOI.description}</p>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500 text-xs">Giờ mở cửa</p>
                          <p className="font-semibold text-gray-800">06:00 - 22:00</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500 text-xs">Giá</p>
                          <p className="font-semibold text-gray-800">{selectedPOI.price}</p>
                        </div>
                      </div>

                      {/* Khoảng cách */}
                      <div className="bg-blue-50 p-2 rounded text-sm">
                        <p className="text-gray-500 text-xs">Khoảng cách</p>
                        <p className="font-semibold text-blue-700">0.02 km</p>
                      </div>

                      {/* Audio Guide */}
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-sm">🔊 Audio Guide</h3>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                            ▶️ Phát audio
                          </button>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2">
                        <Button variant="secondary" className="flex-1 text-sm">
                          🧭 Chỉ đường
                        </Button>
                        <Button variant="primary" className="flex-1 text-sm">
                          + Thêm vào Tour
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-4xl mb-4">👆</div>
                    <p className="text-gray-600">Chọn một quán ăn trên bản đồ để xem chi tiết</p>
                  </div>
                )}
              </div>
            </div>

            {/* POI List Drawer */}
            {showPOIList && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:relative lg:bg-transparent lg:col-span-full mt-4">
                <div className="bg-white rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
                  <div className="flex justify-between items-center mb-4 lg:hidden">
                    <h2 className="text-xl font-bold">Danh sách địa điểm</h2>
                    <button
                      onClick={() => setShowPOIList(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-3">
                    {filteredPOIs.map((poi) => (
                      <div
                        key={poi.id}
                        onClick={() => {
                          setSelectedPOI(poi);
                          setShowPOIList(false);
                        }}
                        className="p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-2xl">{poi.category === 'Bánh Mì' ? '🍞' : poi.category === 'Phở' ? '🍜' : '☕'}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{poi.name}</h3>
                            <p className="text-xs text-gray-600">{poi.description.substring(0, 40)}...</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm">⭐ {poi.rating}</span>
                              <span className="text-sm text-gray-500">$ {poi.price}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chatbot Button - Floating */}
        <button
          onClick={() => setChatbotOpen(!chatbotOpen)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl hover:bg-gray-900 transition flex items-center justify-center text-2xl z-50"
          title="Trợ lý ẩm thực"
        >
          💬
        </button>

        {/* Chatbot Modal */}
        {chatbotOpen && (
          <div className="fixed bottom-24 right-6 w-96 max-h-96 bg-white rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold">🍜 Trợ lý ẩm thực</h3>
              <button
                onClick={() => setChatbotOpen(false)}
                className="text-white hover:opacity-75"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ChatbotComponent />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
