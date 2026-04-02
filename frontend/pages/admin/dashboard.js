import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/common/Navbar';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import { mockPOIs } from '../../utils/api/mockData';
import { validatePOI } from '../../utils/validation';

export default function AdminDashboard() {
  const router = useRouter();
  const [pois, setPOIs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPOI, setEditingPOI] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: 'info' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    phone: '',
  });

  useEffect(() => {
    // Check authentication and role
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');

    if (!userEmail || (userRole !== 'admin' && userRole !== 'restaurant')) {
      router.push('/explorer/map');
      return;
    }

    // Load POIs
    setPOIs(mockPOIs);
    setLoading(false);
  }, [router]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPOI = () => {
    setEditingPOI(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      phone: '',
    });
    setShowForm(true);
  };

  const handleEditPOI = (poi) => {
    setEditingPOI(poi);
    setFormData({
      name: poi.name,
      description: poi.description,
      price: poi.price,
      category: poi.category || '',
      phone: poi.phone || '',
    });
    setShowForm(true);
  };

  const handleDeletePOI = (poi) => {
    setPOIs((prev) => prev.filter((p) => p.id !== poi.id));
    setModal({
      isOpen: true,
      type: 'success',
      title: 'Thành công',
      message: 'Đã xóa POI thành công!',
    });
  };

  const handleSubmitForm = () => {
    // Validate (BR-002)
    const { isValid, errors } = validatePOI(formData);

    if (!isValid) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Lỗi xác thực',
        message: Object.values(errors).join(', '),
      });
      return;
    }

    if (editingPOI) {
      // Update POI
      setPOIs((prev) =>
        prev.map((p) =>
          p.id === editingPOI.id
            ? { ...p, ...formData, status: 'pending' }
            : p
        )
      );
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Thành công',
        message: 'POI sẽ được gửi cho admin duyệt',
      });
    } else {
      // Create new POI
      const newPOI = {
        id: Math.max(...pois.map((p) => p.id), 0) + 1,
        ...formData,
        image: '/placeholder.jpg',
        location: { lat: 10.796, lng: 106.749 },
        rating: 0,
        status: 'pending', // BR-002
      };

      setPOIs((prev) => [...prev, newPOI]);
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Thành công',
        message: 'POI sẽ được gửi cho admin duyệt',
      });
    }

    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      phone: '',
    });
  };

  const categories = [
    { label: 'Bánh Mì', value: 'banh-mi' },
    { label: 'Cơm Tấm', value: 'com-tam' },
    { label: 'Phở', value: 'pho' },
    { label: 'Bún', value: 'bun' },
    { label: 'Cơm', value: 'com' },
  ];

  const columns = [
    { key: 'name', label: 'Tên quán' },
    { key: 'category', label: 'Loại' },
    { key: 'price', label: 'Giá' },
    { key: 'status', label: 'Trạng thái', render: (status) => (
      <span className={`px-3 py-1 rounded text-white text-sm ${
        status === 'approved' ? 'bg-green-600' : 'bg-yellow-600'
      }`}>
        {status === 'approved' ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}
      </span>
    )},
  ];

  if (loading) return <Loading fullScreen />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FFFFFF] p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[#212121]">⚙️ Admin Dashboard</h1>
            <Button onClick={handleAddPOI} variant="success">
              ➕ Thêm POI mới
            </Button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-[#212121] mb-6">>
                {editingPOI ? 'Chỉnh sửa POI' : 'Thêm POI mới'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input
                  label="Tên quán"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Nhập tên quán"
                  required
                />

                <Select
                  label="Loại"
                  value={formData.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  options={categories}
                  required
                />

                <Input
                  label="Mô tả"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Nhập mô tả"
                  required
                />

                <Input
                  label="Giá"
                  type="text"
                  value={formData.price}
                  onChange={(e) => handleFormChange('price', e.target.value)}
                  placeholder="VD: 15,000 - 25,000"
                  required
                />

                <Input
                  label="Điện thoại"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  placeholder="0123456789"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmitForm} variant="success">
                  💾 Lưu
                </Button>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="secondary"
                >
                  ✕ Hủy
                </Button>
              </div>
            </div>
          )}

          {/* POI Table */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-[#212121] mb-6">📋 Danh sách POI</h2>

            <Table
              columns={columns}
              data={pois}
              actions={[
                {
                  label: '✏️ Sửa',
                  onClick: (poi) => handleEditPOI(poi),
                },
                {
                  label: '🗑️ Xóa',
                  variant: 'danger',
                  onClick: (poi) => handleDeletePOI(poi),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </>
  );
}
