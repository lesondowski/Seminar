import { useState, useEffect } from 'react';
import Modal from './Modal';

export default function MapComponent() {
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(10);
  const [warning, setWarning] = useState('');
  const [pois, setPois] = useState([]); // Mock POI data

  useEffect(() => {
    // Simulate loading POI data
    setTimeout(() => {
      setPois([{ id: 1, name: 'Quán A', lat: 10.7769, lng: 106.6953 }]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleZoom = (newZoom) => {
    if (newZoom < 5 || newZoom > 20) {
      setWarning('Zoom không hợp lệ, vui lòng zoom lại.');
    } else {
      setZoom(newZoom);
      setWarning('');
    }
  };

  if (loading) return <div className="text-center">Đang tải bản đồ...</div>;

  return (
    <div className="h-full">
      <div className="flex justify-between mb-4">
        <button onClick={() => handleZoom(zoom + 1)} className="bg-green-500 text-white p-2 rounded">Zoom In</button>
        <button onClick={() => handleZoom(zoom - 1)} className="bg-red-500 text-white p-2 rounded">Zoom Out</button>
      </div>
      {warning && <Modal message={warning} onClose={() => setWarning('')} />}
      <div className="bg-gray-200 h-96 flex items-center justify-center">
        <p>Bản đồ placeholder - Zoom: {zoom}</p>
        <ul>
          {pois.map(poi => <li key={poi.id}>{poi.name}</li>)}
        </ul>
      </div>
    </div>
  );
}