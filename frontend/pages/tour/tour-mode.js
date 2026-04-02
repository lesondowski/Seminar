import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/common/Navbar';
import TourMode from '../../components/map/TourMode';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { mockPOIs, mockTours } from '../../utils/api/mockData';

export default function TourModePage() {
  const router = useRouter();
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [tourPOIs, setTourPOIs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/auth/login');
      return;
    }

    // Load tours and POIs
    setTours(mockTours);
    setLoading(false);
  }, [router]);

  const handleSelectTour = (tour) => {
    // Get POIs for this tour
    const pois = tour.pois.map((poiId) =>
      mockPOIs.find((poi) => poi.id === poiId)
    ).filter(Boolean);

    setTourPOIs(pois);
    setSelectedTour(tour);
  };

  if (loading) return <Loading fullScreen />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FFFFFF] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.push('/explorer/map')}
              className="text-[#212121] hover:text-[#333333] font-semibold underline flex items-center gap-2 transition"
            >
              ← Quay lại bản đồ
            </button>
          </div>

          {!selectedTour ? (
            <div>
              <h1 className="text-4xl font-bold text-[#000000] mb-2">Chọn Tour Ẩm Thực</h1>
              <p className="text-[#757575] mb-8">Khám phá các tour Ẩm thực tuyệt vời ở Hà Nội</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tours.map((tour) => (
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
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
                  >
                    <div style={{
                      background: 'linear-gradient(to right, #333333, #444444)',
                      padding: '1rem 1.5rem',
                    }}>
                      <h2 style={{
                        fontSize: '1.25rem', // Giảm kích thước tiêu đề
                        fontWeight: '600', // Sử dụng font-semibold cho tiêu đề
                        color: 'white',
                        marginBottom: '0.25rem',
                      }}>
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
                        <div style={{
                          backgroundColor: '#EAEAEA',
                          borderRadius: '0.5rem',
                          padding: '0.75rem',
                          textAlign: 'center',
                        }}>
                          <p style={{
                            color: '#757575',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}>
                            Thời lượng
                          </p>
                          <p style={{
                            color: '#333333',
                            fontWeight: '700',
                          }}>
                            <i className="fas fa-clock" style={{ fontSize: '1rem', marginRight: '0.5rem' }}></i>
                            {tour.duration}
                          </p>
                        </div>
                        <div style={{
                          backgroundColor: '#EAEAEA',
                          borderRadius: '0.5rem',
                          padding: '0.75rem',
                          textAlign: 'center',
                        }}>
                          <p style={{
                            color: '#757575',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}>
                            Địa điểm
                          </p>
                          <p style={{
                            color: '#28A745',
                            fontWeight: '700',
                          }}>
                            <i className="fas fa-map-marker-alt" style={{ fontSize: '1rem', marginRight: '0.5rem' }}></i>
                            {tour.pois.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <TourMode
              tour={tourPOIs}
              onComplete={() => {
                setSelectedTour(null);
                router.push('/explorer/map');
              }}
              onPOIChange={(poi) => console.log('Changed to POI:', poi.name)}
            />
          )}
        </div>
      </div>
    </>
  );
}
