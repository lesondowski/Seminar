import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTourCart } from '../../utils/tourCart/TourCartContext';

export default function TourCartPanel() {
  const router = useRouter();
  const { userPOIs, removePOI, clearAll, reorderPOIs } = useTourCart();
  const [open, setOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const dragItem = useRef(null);
  const dragOver = useRef(null);

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

  const getCurrentPosition = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 7000 }
      );
    });
  };

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOver.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    if (dragItem.current === dragOver.current) return;
    const newList = [...userPOIs];
    const [dragged] = newList.splice(dragItem.current, 1);
    newList.splice(dragOver.current, 0, dragged);
    reorderPOIs(newList);
    dragItem.current = null;
    dragOver.current = null;
  };

  const handleStartTour = () => {
    setOpen(false);
    router.push('/tour/tour-mode');
  };

  const handleClearAll = () => {
    if (confirmClear) {
      clearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const handleOptimizeRoute = async () => {
    if (userPOIs.length <= 1 || isOptimizing) return;
    setIsOptimizing(true);

    const userPosition = await getCurrentPosition();
    if (!userPosition) {
      setIsOptimizing(false);
      return;
    }

    const optimizeExactPath = () => {
      const n = userPOIs.length;
      const startToPoi = userPOIs.map((poi) =>
        calculateDistance(userPosition.lat, userPosition.lng, poi.location.lat, poi.location.lng)
      );

      const between = Array.from({ length: n }, () => Array(n).fill(0));
      for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < n; j += 1) {
          if (i === j) continue;
          between[i][j] = calculateDistance(
            userPOIs[i].location.lat,
            userPOIs[i].location.lng,
            userPOIs[j].location.lat,
            userPOIs[j].location.lng
          );
        }
      }

      const maxMask = 1 << n;
      const dp = Array.from({ length: maxMask }, () => Array(n).fill(Infinity));
      const parent = Array.from({ length: maxMask }, () => Array(n).fill(-1));

      for (let i = 0; i < n; i += 1) {
        dp[1 << i][i] = startToPoi[i];
      }

      for (let mask = 1; mask < maxMask; mask += 1) {
        for (let last = 0; last < n; last += 1) {
          if (!(mask & (1 << last))) continue;
          const prevMask = mask ^ (1 << last);
          if (prevMask === 0) continue;

          for (let prev = 0; prev < n; prev += 1) {
            if (!(prevMask & (1 << prev))) continue;
            const candidate = dp[prevMask][prev] + between[prev][last];
            if (candidate < dp[mask][last]) {
              dp[mask][last] = candidate;
              parent[mask][last] = prev;
            }
          }
        }
      }

      const fullMask = maxMask - 1;
      let bestLast = 0;
      for (let i = 1; i < n; i += 1) {
        if (dp[fullMask][i] < dp[fullMask][bestLast]) bestLast = i;
      }

      const order = [];
      let mask = fullMask;
      let current = bestLast;

      while (current !== -1) {
        order.push(current);
        const prev = parent[mask][current];
        mask ^= 1 << current;
        current = prev;
      }

      order.reverse();
      return order.map((idx) => userPOIs[idx]);
    };

    const optimizeHeuristicPath = () => {
      const unvisited = [...userPOIs];
      const sorted = [];
      let currentPoint = userPosition;

      while (unvisited.length > 0) {
        let nearestIndex = 0;
        let nearestDistance = Infinity;

        unvisited.forEach((poi, idx) => {
          const distance = calculateDistance(
            currentPoint.lat,
            currentPoint.lng,
            poi.location.lat,
            poi.location.lng
          );

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = idx;
          }
        });

        const [nearestPOI] = unvisited.splice(nearestIndex, 1);
        sorted.push(nearestPOI);
        currentPoint = nearestPOI.location;
      }

      return sorted;
    };

    // Exact optimal path for small lists, heuristic fallback for large lists.
    const sorted = userPOIs.length <= 11 ? optimizeExactPath() : optimizeHeuristicPath();

    reorderPOIs(sorted);
    setTimeout(() => setIsOptimizing(false), 300);
  };

  return (
    <>
      {/* Floating button — bottom-left */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 left-6 z-[9999] w-14 h-14 rounded-full bg-[#333333] text-white shadow-lg flex items-center justify-center hover:bg-[#555555] transition focus:outline-none"
        aria-label="Tour cart"
      >
        {/* Cart icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h19l-3 10H6L3 6z" />
          <circle cx="9" cy="21" r="1" fill="currentColor" />
          <circle cx="17" cy="21" r="1" fill="currentColor" />
          <path d="M1 1h4l1 3" />
        </svg>
        {/* Badge */}
        {userPOIs.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {userPOIs.length > 99 ? '99+' : userPOIs.length}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[9998] bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={`fixed bottom-0 left-0 z-[9999] w-full sm:w-96 bg-white rounded-t-2xl sm:rounded-tr-2xl shadow-2xl transform transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-[#212121]">Tour của bạn</span>
            <span className="bg-[#333333] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {userPOIs.length}
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-700 p-1 rounded"
            aria-label="Đóng"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* POI list */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {userPOIs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3">
                <path d="M3 6h19l-3 10H6L3 6z" />
                <circle cx="9" cy="21" r="1" />
                <circle cx="17" cy="21" r="1" />
              </svg>
              <p className="text-sm">Chưa có địa điểm nào</p>
              <p className="text-xs mt-1">Thêm địa điểm từ trang chi tiết POI</p>
            </div>
          ) : (
            <ul className="space-y-2 py-2">
              {userPOIs.map((poi, index) => (
                <li
                  key={poi.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 cursor-grab active:cursor-grabbing select-none transition-all duration-300 ${
                    isOptimizing ? 'opacity-70 scale-[0.98]' : 'opacity-100 scale-100'
                  }`}
                >
                  {/* Drag handle */}
                  <span className="text-gray-300 flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="9" cy="5" r="1.5" />
                      <circle cx="15" cy="5" r="1.5" />
                      <circle cx="9" cy="12" r="1.5" />
                      <circle cx="15" cy="12" r="1.5" />
                      <circle cx="9" cy="19" r="1.5" />
                      <circle cx="15" cy="19" r="1.5" />
                    </svg>
                  </span>

                  {/* Index badge */}
                  <span className="w-6 h-6 rounded-full bg-[#333333] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>

                  {/* POI info */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => { setOpen(false); router.push(`/poi/${poi.id}`); }}
                  >
                    <p className="font-semibold text-sm text-[#212121] truncate">{poi.name}</p>
                    <p className="text-xs text-gray-500 truncate">{poi.category}</p>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removePOI(poi.id)}
                    className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1 rounded"
                    aria-label="Xóa"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Panel footer actions */}
        {userPOIs.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-200 flex flex-col gap-2">
            <button
              onClick={handleOptimizeRoute}
              disabled={isOptimizing || userPOIs.length <= 1}
              className="w-full py-3 rounded-xl bg-[#212121] text-white font-bold text-sm hover:bg-[#2f2f2f] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isOptimizing ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  Đang tối ưu...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 17l6-6 4 4 7-7" />
                    <path d="M14 8h6v6" />
                  </svg>
                  Tối ưu lộ trình
                </>
              )}
            </button>
            <button
              onClick={handleStartTour}
              className="w-full py-3 rounded-xl bg-[#333333] text-white font-bold text-sm hover:bg-[#555555] transition"
            >
            Bắt đầu Tour ({userPOIs.length} địa điểm)
            </button>
            <button
              onClick={handleClearAll}
              className={`w-full py-2 rounded-xl border text-sm font-semibold transition ${
                confirmClear
                  ? 'border-red-500 text-red-600 bg-red-50'
                  : 'border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500'
              }`}
            >
              {confirmClear ? 'Nhấn lần nữa để xóa tất cả' : 'Xóa tất cả'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
