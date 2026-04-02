import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import { mockPOIs } from '../../utils/api/mockData';
import Button from '../../components/common/Button';

export default function POIDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [added, setAdded] = useState(false);

  const poi = useMemo(() => {
    if (!id) return null;
    return mockPOIs.find((item) => String(item.id) === String(id));
  }, [id]);

  if (!poi) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Không tìm thấy POI</p>
      </div>
    );
  }

  const audioId = `audio-${poi.id}`;

  const handlePlay = () => {
    const audioElement = document.getElementById(audioId);
    if (audioElement) {
      audioElement.volume = volume;
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    const audioElement = document.getElementById(audioId);
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <img src={poi.image || '/placeholder.jpg'} alt={poi.name} className="w-full h-56 object-cover" />

          <div className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{poi.name}</h1>
                <div className="flex items-center gap-3 mt-2 text-gray-500">
                  <span className="text-2xl">⭐</span>
                  <span className="font-semibold text-xl text-orange-500">{poi.rating}</span>
                  <span>1234 lượt xem</span>
                </div>
              </div>
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">{poi.category}</div>
            </div>

            <p className="text-gray-700 leading-relaxed">{poi.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-gray-700">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-sm">Giờ mở cửa</p>
                <p className="font-semibold">15:00 - 23:00</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-sm">Khoảng cách</p>
                <p className="font-semibold">0.02 km</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-sm">Giá</p>
                <p className="font-semibold">{poi.price}</p>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-lg">Audio Guide</h2>
                <button
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                  onClick={isPlaying ? handlePause : handlePlay}
                >
                  {isPlaying ? '⏸️ Tạm dừng' : '▶️ Phát audio'}
                </button>
              </div>
              <audio id={audioId} src={poi.audio} onEnded={() => setIsPlaying(false)} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-500">Âm lượng: {(volume * 100).toFixed(0)}%</div>
            </div>

            <div className="flex flex-wrap gap-3 mt-2">
              <Button onClick={() => router.push('/explorer/map')} variant="secondary" className="flex-1">
                🧭 Chỉ đường
              </Button>
              <Button
                onClick={() => {
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1200);
                }}
                variant={added ? 'success' : 'primary'}
                className="flex-1"
              >
                {added ? 'Đã thêm vào Tour' : '+ Thêm vào Tour'}
              </Button>
            </div>

            <div className="text-sm text-gray-500">Audio guide chỉ khả dụng khi có file audio thực tế</div>
          </div>
        </div>
      </div>
    </>
  );
}
