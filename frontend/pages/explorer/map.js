import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/common/Navbar';
import MapComponent from '../../components/map/MapComponent';
import Loading from '../../components/common/Loading';
import { useLanguage } from '../../utils/i18n/LanguageContext';
import useUserLocation from '../../hooks/useUserLocation';
import useRoute from '../../hooks/useRoute';
import NarrationBlock from '../../components/poi/NarrationBlock';
import { 
  ClockIcon, 
  LocationIcon, 
  PriceIcon, 
  DirectionIcon, 
  PlusIcon, 
  ChatIcon, 
  StarIcon,
  MapPinIcon,
  CloseIcon
} from '../../components/common/Icons';
import { fetchPOIs } from '../../utils/api/poiService';


export default function MapPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [pois, setPOIs] = useState([]);
  const [filteredPOIs, setFilteredPOIs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('explore');
  const [showPoiSheet, setShowPoiSheet] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('info');
  const [routeTargetPoi, setRouteTargetPoi] = useState(null);
  const [isRouteAnimating, setIsRouteAnimating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([{ from: 'bot', text: t('map_chat_greeting') }]);

  const { location: userLocation, locationError, refreshLocation } = useUserLocation({
    watch: true,
    minDistanceMeters: 25,
  });

  const {
    routeCoords,
    routeInfo,
    routeError,
    isLoadingRoute,
    refreshRoute,
    clearRoute,
  } = useRoute({
    from: userLocation,
    to: routeTargetPoi?.location,
    enabled: Boolean(routeTargetPoi && userLocation),
    profile: 'foot',
  });

  useEffect(() => {
    setChatMessages((prev) => {
      if (prev.length === 1 && prev[0].from === 'bot') {
        return [{ from: 'bot', text: t('map_chat_greeting') }];
      }
      return prev;
    });
  }, [language, t]);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    const loadPois = async () => {
      try {
        const data = await fetchPOIs();
        setPOIs(Array.isArray(data) ? data : []);
        setFilteredPOIs(Array.isArray(data) ? data : []);
      } catch (error) {
        setPOIs([]);
        setFilteredPOIs([]);
      } finally {
        setLoading(false);
      }
    };

    loadPois();
  }, [router]);

  useEffect(() => {
    const next = pois.filter((poi) =>
      poi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poi.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPOIs(next);
  }, [searchTerm, pois]);

  useEffect(() => {
    if (!router.isReady) return;
    if (filteredPOIs.length === 0) return;

    const focusPoiId = Number(router.query.focusPoi);
    if (!focusPoiId) return;

    const focusPoi = filteredPOIs.find((poi) => poi.id === focusPoiId);
    if (!focusPoi) return;

    setSelectedPoi(focusPoi);
  }, [router.isReady, router.query.focusPoi, filteredPOIs]);

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
        { from: 'bot', text: t('map_sample_reply') },
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

  const formatDistance = (distanceMeters) => {
    if (!distanceMeters && distanceMeters !== 0) return '--';
    if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
    return `${(distanceMeters / 1000).toFixed(2)} km`;
  };

  const formatDuration = (durationMinutes) => {
    if (!durationMinutes && durationMinutes !== 0) return '--';
    if (durationMinutes < 1) return `~1 ${t('map_minutes')}`;
    return `~${Math.round(durationMinutes)} ${t('map_minutes')}`;
  };

  const getLocalizedMenuField = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[language] || field.vi || field.en || field.zh || '';
  };

  const formatMenuPrice = (item) => {
    if (typeof item.price === 'number') {
      const locale = language === 'vi' ? 'vi-VN' : language === 'zh' ? 'zh-CN' : 'en-US';
      const currency = item.currency || 'VND';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(item.price);
    }
    return item.price || '--';
  };

  const getGroupedMenu = (menu = []) => {
    return menu.reduce((group, item) => {
      const category = item.category || 'Other';
      if (!group[category]) group[category] = [];
      group[category].push(item);
      return group;
    }, {});
  };

  const handleGetDirections = () => {
    if (!selectedPoi || !userLocation) return;
    setRouteTargetPoi(selectedPoi);
  };

  const handleAddToTour = () => {
    alert(t('map_added_to_tour', { name: selectedPoi.name }));
    // Implement tour functionality
  };

  const handleClearRoute = () => {
    setRouteTargetPoi(null);
    clearRoute();
  };

  useEffect(() => {
    if (routeCoords.length > 1) {
      setIsRouteAnimating(true);
      const timer = setTimeout(() => setIsRouteAnimating(false), 1600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [routeCoords]);

  useEffect(() => {
    if (selectedPoi) {
      setActiveDetailTab('info');
    }
  }, [selectedPoi]);

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
                  placeholder={t('map_search_placeholder')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={t('map_search_placeholder')}
                />
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  className={`px-5 py-2 rounded-lg font-semibold text-sm shadow-sm ${activeTab === 'explore' ? 'bg-black text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                  onClick={handleExplore}
                >
                  {t('nav_explore')}
                </button>
                <button
                  className={`px-5 py-2 rounded-lg font-semibold text-sm shadow-sm ${activeTab === 'tour' ? 'bg-black text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                  onClick={handleTour}
                >
                  {t('nav_tour')}
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
                {t('map_locations_count', { count: filteredPOIs.length })}
              </button>
              <button
                onClick={handleTour}
                className="px-4 py-2 bg-[#28A745] text-white rounded-lg text-sm font-semibold shadow-md hover:bg-[#218838] transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
                {t('map_switch_to_tour')}
              </button>
            </div>
          </div>

          <div className="relative bg-[#FFFFFF] rounded-2xl shadow-lg border border-[#DDDDDD] overflow-hidden z-1" style={{ height: '72vh' }}>
            <MapComponent
              pois={filteredPOIs}
              userLocation={userLocation}
              onPOISelect={handlePoiSelect}
              loading={false}
              externalRouteCoords={routeCoords}
              destinationPOI={routeTargetPoi}
              isRouteAnimating={isRouteAnimating}
              highlightedPOI={selectedPoi}
            />
            
            {/* Route Info Panel - Show when route is active */}
            {routeInfo && (
              <div className="absolute bottom-4 left-4 right-4 max-w-sm bg-[#FFFFFF] rounded-lg shadow-lg border border-[#DDDDDD] p-4 z-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-[#212121] text-sm mb-1 inline-flex items-center gap-1"><MapPinIcon className="w-4 h-4" /> {t('map_route_to')}</h3>
                    <p className="text-lg font-bold text-[#333333]">{routeTargetPoi?.name}</p>
                  </div>
                  <button
                    onClick={handleClearRoute}
                    className="text-[#757575] hover:text-[#212121] text-xl font-bold"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-[#EAEAEA] rounded p-2">
                    <p className="text-[#757575] text-xs font-semibold">{t('map_distance')}</p>
                    <p className="text-[#333333] font-bold">{formatDistance(routeInfo.distanceMeters)}</p>
                  </div>
                  <div className="bg-[#EAEAEA] rounded p-2">
                    <p className="text-[#757575] text-xs font-semibold">{t('map_duration')}</p>
                    <p className="text-[#333333] font-bold">{formatDuration(routeInfo.durationMinutes)}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={handleClearRoute}
                    className="flex-1 px-3 py-2 rounded-lg border border-[#DDDDDD] text-[#333333] text-xs font-semibold hover:bg-[#F5F5F5] transition"
                  >
                    {t('map_clear_route')}
                  </button>
                  <button
                    onClick={() => refreshRoute()}
                    disabled={isLoadingRoute}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#333333] text-white text-xs font-semibold hover:bg-[#444444] transition disabled:opacity-50"
                  >
                    {isLoadingRoute ? t('map_refreshing_route') : t('map_refresh_route')}
                  </button>
                </div>

                {routeError ? (
                  <p className="text-xs text-[#DC3545] text-center">{routeError}</p>
                ) : (
                  <p className="text-xs text-[#757575] text-center">{t('map_route_computed')}</p>
                )}
              </div>
            )}

            {locationError && (
              <div className="absolute top-4 left-4 right-4 max-w-md bg-[#FFFFFF] rounded-lg shadow-lg border border-[#DC3545]/40 p-3 z-50">
                <p className="text-sm font-semibold text-[#DC3545] mb-2">{locationError}</p>
                <button
                  onClick={refreshLocation}
                  className="px-3 py-1.5 rounded-md bg-[#333333] text-white text-xs font-semibold"
                >
                  {t('map_retry_gps')}
                </button>
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
                  <h2 className="font-bold text-lg text-[#212121]">{t('map_poi_list')}</h2>
                  <button onClick={() => setShowPoiSheet(false)} className="text-xl font-bold"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <div className="max-h-[42vh] overflow-y-auto p-4 space-y-3">
                  {filteredPOIs.length === 0 ? (
                    <p className="text-[#757575]">{t('map_no_poi')}</p>
                  ) : (
                    filteredPOIs.map((poi) => (
                      <button
                        key={poi.id}
                        onClick={() => handlePoiSelect(poi)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          selectedPoi && selectedPoi.id === poi.id
                            ? 'bg-[#FFF8DC] border-[#FFD700] shadow-md'
                            : 'border-[#DDDDDD] hover:bg-[#EAEAEA]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <MapPinIcon className="w-6 h-6 text-[#333333]" />
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
            <div className="fixed inset-0 z-[9999] md:pointer-events-none">
              <div
                className="absolute inset-0 bg-black/40 md:hidden"
                onClick={() => setSelectedPoi(null)}
              />

              <div className="absolute bottom-0 left-0 right-0 bg-[#FFFFFF] rounded-t-2xl shadow-2xl border border-[#DDDDDD] flex flex-col max-h-[85vh] animate-slide-in-up md:pointer-events-auto md:top-0 md:bottom-0 md:left-auto md:right-0 md:w-[420px] md:max-h-none md:rounded-none md:rounded-l-2xl">
                {/* Header with close button - Fixed */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDDDDD] bg-gradient-to-r from-[#F5F5F5] to-[#EAEAEA] flex-shrink-0">
                  <h2 className="text-lg font-bold text-[#212121]">{t('map_poi_detail')}</h2>
                  <button onClick={() => setSelectedPoi(null)} className="text-2xl font-bold text-[#757575] hover:text-[#212121]"><CloseIcon className="w-6 h-6" /></button>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 border-b border-[#DDDDDD] bg-[#FFFFFF]">
                  <button
                    onClick={() => setActiveDetailTab('info')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                      activeDetailTab === 'info'
                        ? 'bg-[#333333] text-white'
                        : 'bg-[#F5F5F5] text-[#333333]'
                    }`}
                  >
                    {t('map_tab_info')}
                  </button>
                  <button
                    onClick={() => setActiveDetailTab('menu')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                      activeDetailTab === 'menu'
                        ? 'bg-[#333333] text-white'
                        : 'bg-[#F5F5F5] text-[#333333]'
                    }`}
                  >
                    {t('map_tab_menu')}
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {activeDetailTab === 'info' && (
                    <>
                      {selectedPoi.image && (
                        <div className="rounded-lg overflow-hidden shadow-sm">
                          <img src={selectedPoi.image} alt={selectedPoi.name} className="w-full h-40 object-cover" />
                        </div>
                      )}

                      <div>
                        <h3 className="text-2xl font-bold text-[#212121] mb-2">{selectedPoi.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-3 py-1 bg-[#DC3545]/20 text-[#DC3545] text-xs font-semibold rounded-full">
                            {selectedPoi.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-[#EAEAEA] rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-5 h-5 text-[#FFC107]" />
                            <span className="font-bold text-[#212121]">{selectedPoi.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-sm text-[#757575]">({Math.floor(Math.random() * 5000) + 1000} {t('map_reviews')})</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-[#212121] leading-relaxed">{selectedPoi.description}</p>
                      </div>

                      <div className="flex items-start gap-3 bg-[#EAEAEA] rounded-lg p-3">
                        <ClockIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">{t('poi_hours')}</p>
                          <p className="text-sm text-gray-800 font-medium">{selectedPoi.hours || '6:00 - 22:00'}</p>
                        </div>
                      </div>

                      {userLocation && (
                        <div className="flex items-start gap-3 bg-green-50 rounded-lg p-3">
                          <LocationIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-600 font-semibold">{t('map_distance')}</p>
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

                      <div className="flex items-start gap-3 bg-[#EAEAEA] rounded-lg p-3">
                        <PriceIcon className="w-5 h-5 text-[#333333] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">{t('poi_price')}</p>
                          <p className="text-sm text-gray-800 font-medium">{selectedPoi.price || '$$'}</p>
                        </div>
                      </div>

                      {(selectedPoi.address || selectedPoi.phone) && (
                        <div className="space-y-2">
                          {selectedPoi.address && (
                            <div className="flex items-start gap-3">
                              <span className="text-sm text-gray-600 font-semibold min-w-16">{t('map_address')}:</span>
                              <span className="text-sm text-gray-800">{selectedPoi.address}</span>
                            </div>
                          )}
                          {selectedPoi.phone && (
                            <div className="flex items-start gap-3">
                              <span className="text-sm text-gray-600 font-semibold min-w-16">{t('map_phone')}:</span>
                              <span className="text-sm text-gray-800">{selectedPoi.phone}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <NarrationBlock
                        narration={selectedPoi.narration}
                        deviceLanguage={language}
                      />
                    </>
                  )}

                  {activeDetailTab === 'menu' && (
                    <>
                      {(selectedPoi.menu || []).length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#DDDDDD] p-5 text-center text-sm text-[#757575]">
                          {t('map_menu_empty')}
                        </div>
                      ) : (
                        Object.entries(getGroupedMenu(selectedPoi.menu)).map(([category, items]) => (
                          <div key={category} className="space-y-3">
                            <h4 className="text-sm font-bold text-[#333333] uppercase tracking-wide">{category}</h4>
                            {items.map((item) => (
                              <div key={item.id} className="rounded-xl border border-[#DDDDDD] overflow-hidden bg-[#FFFFFF] shadow-sm">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={getLocalizedMenuField(item.name)}
                                    loading="lazy"
                                    className="w-full h-32 object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-32 bg-[#EAEAEA] flex items-center justify-center text-sm text-[#757575]">
                                    {t('map_menu_placeholder')}
                                  </div>
                                )}
                                <div className="p-3">
                                  <div className="flex items-start justify-between gap-3 mb-1">
                                    <p className="text-sm font-semibold text-[#212121]">{getLocalizedMenuField(item.name)}</p>
                                    <p className="text-sm font-bold text-[#DC3545] whitespace-nowrap">{formatMenuPrice(item)}</p>
                                  </div>
                                  <p className="text-xs text-[#757575] leading-relaxed">
                                    {getLocalizedMenuField(item.description)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <button
                      onClick={handleGetDirections}
                      className="px-4 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <DirectionIcon className="w-5 h-5" />
                      {t('map_directions')}
                    </button>
                    <button
                      onClick={handleAddToTour}
                      className="px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <PlusIcon className="w-5 h-5" />
                      {t('map_add_tour')}
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
                  <p className="font-bold">{t('map_chat_title')}</p>
                  <p className="text-xs opacity-80">{t('map_chat_subtitle')}</p>
                </div>
                <button onClick={() => setShowChat(false)} className="text-white font-bold"><CloseIcon className="w-5 h-5" /></button>
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
                  placeholder={t('map_chat_input')}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                />
                <button onClick={handleSendChat} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">
                  {t('map_chat_send')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
