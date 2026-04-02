import React, { useState, useRef } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';

export default function POIDetail({ poi, onClose, onAudioPlay }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const audioRef = useRef(null);

  if (!poi) return null;

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      onAudioPlay && onAudioPlay(poi);
    }
  };

  const handlePauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleAudioError = () => {
    setAudioError(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{poi.name}</h2>
          <p className="text-blue-100">⭐ {poi.rating || 'N/A'}</p>
        </div>
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white font-bold"
        >
          ✕
        </button>
      </div>

      {/* Image */}
      <div className="relative bg-gray-200 h-48 overflow-hidden">
        {!imageError ? (
          <img
            src={poi.image || '/placeholder.jpg'}
            alt={poi.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🖼️</div>
              <p>Không tải được hình ảnh</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Description */}
        <div>
          <h3 className="font-bold text-gray-800 mb-2">📝 Mô tả</h3>
          <p className="text-gray-700 text-sm">{poi.description}</p>
        </div>

        {/* Price */}
        <div>
          <h3 className="font-bold text-gray-800 mb-2">💰 Giá cả</h3>
          <p className="text-lg text-green-600 font-bold">{poi.price}</p>
        </div>

        {/* Category */}
        {poi.category && (
          <div>
            <h3 className="font-bold text-gray-800 mb-2">🏷️ Loại</h3>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {poi.category}
            </span>
          </div>
        )}

        {/* Location */}
        {poi.location && (
          <div>
            <h3 className="font-bold text-gray-800 mb-2">📍 Vị trí</h3>
            <p className="text-gray-700 text-sm">
              Lat: {poi.location.lat}, Lng: {poi.location.lng}
            </p>
          </div>
        )}

        {/* Audio */}
        <div>
          <h3 className="font-bold text-gray-800 mb-2">🔊 Audio Guide</h3>
          {poi.audio ? (
            <div>
              <audio
                ref={audioRef}
                src={poi.audio}
                onEnded={() => setIsPlaying(false)}
                onError={handleAudioError}
                className="hidden"
              />
              <div className="flex gap-2">
                {!isPlaying ? (
                  <Button onClick={handlePlayAudio} variant="success" className="flex-1">
                    ▶️ Phát
                  </Button>
                ) : (
                  <Button onClick={handlePauseAudio} variant="success" className="flex-1">
                    ⏸️ Tạm dừng
                  </Button>
                )}
              </div>
              {audioError && (
                <p className="text-red-500 text-sm mt-2">Audio không khả dụng</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Audio không khả dụng cho POI này</p>
          )}
        </div>

        {/* Contact */}
        {poi.phone || poi.website ? (
          <div>
            <h3 className="font-bold text-gray-800 mb-2">📞 Liên hệ</h3>
            <div className="space-y-1 text-sm">
              {poi.phone && <p>Điện thoại: {poi.phone}</p>}
              {poi.website && <p>Website: {poi.website}</p>}
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 border-t flex gap-2">
        <Button onClick={onClose} variant="secondary" className="flex-1">
          Đóng
        </Button>
      </div>
    </div>
  );
}
