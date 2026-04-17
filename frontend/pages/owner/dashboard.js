import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/common/Navbar';
import { fetchPOIs } from '../../utils/api/poiService';
import { PlusIcon, EditIcon, TrashIcon, CloseIcon } from '../../components/common/Icons';

const EMPTY_TRANSLATION = { vi: '', en: '', zh: '' };

function createEmptyItem() {
  return {
    id: `menu-${Date.now()}`,
    name: { ...EMPTY_TRANSLATION },
    description: { ...EMPTY_TRANSLATION },
    price: 0,
    currency: 'VND',
    image: '',
    category: '',
  };
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [ownerEmail, setOwnerEmail] = useState('');
  const [pois, setPois] = useState([]);
  const [selectedPoiId, setSelectedPoiId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    const email = localStorage.getItem('userEmail') || '';
    setOwnerEmail(email);
    // Load only POIs owned by this user (backend filters by role/ownership)
    fetchPOIs().then((data) => {
      const all = Array.isArray(data) ? data : [];
      const owned = email ? all.filter((poi) => poi.createdBy === email) : all;
      const shown = owned.length > 0 ? owned : all.slice(0, 3);
      setPois(shown.map((poi) => ({ ...poi, menu: poi.menu || [] })));
      if (shown.length > 0) setSelectedPoiId(shown[0].id);
    });
  }, [router]);

  const selectedPoi = useMemo(
    () => pois.find((poi) => poi.id === selectedPoiId) || null,
    [pois, selectedPoiId]
  );

  const updateSelectedPoiMenu = (nextMenu) => {
    setPois((prev) =>
      prev.map((poi) =>
        poi.id === selectedPoiId
          ? {
              ...poi,
              menu: nextMenu,
            }
          : poi
      )
    );
  };

  const handleDelete = (itemId) => {
    if (!selectedPoi) return;
    updateSelectedPoiMenu(selectedPoi.menu.filter((item) => item.id !== itemId));
  };

  const handleQuickPriceChange = (itemId, nextValue) => {
    if (!selectedPoi) return;
    const safeNumber = Number(nextValue);
    if (Number.isNaN(safeNumber)) return;

    updateSelectedPoiMenu(
      selectedPoi.menu.map((item) =>
        item.id === itemId
          ? {
              ...item,
              price: safeNumber,
            }
          : item
      )
    );
  };

  const handleSaveEdit = () => {
    if (!selectedPoi || !editingItem) return;

    const nextMenu = selectedPoi.menu.some((item) => item.id === editingItem.id)
      ? selectedPoi.menu.map((item) => (item.id === editingItem.id ? editingItem : item))
      : [...selectedPoi.menu, editingItem];

    updateSelectedPoiMenu(nextMenu);
    setEditingItem(null);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FFFFFF] p-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          <aside className="bg-[#F5F5F5] rounded-xl border border-[#DDDDDD] p-4 h-fit">
            <p className="text-sm text-[#757575] mb-1">Owner</p>
            <p className="font-semibold text-[#212121] break-all mb-4">{ownerEmail || 'demo@owner.com'}</p>
            <h2 className="text-lg font-bold text-[#212121] mb-3">Quan cua toi</h2>
            <div className="space-y-2">
              {pois.map((poi) => (
                <button
                  key={poi.id}
                  onClick={() => setSelectedPoiId(poi.id)}
                  className={`w-full text-left rounded-lg border p-3 transition ${
                    selectedPoiId === poi.id
                      ? 'bg-[#212121] text-white border-[#212121]'
                      : 'bg-[#FFFFFF] text-[#212121] border-[#DDDDDD] hover:bg-[#EAEAEA]'
                  }`}
                >
                  <p className="font-semibold text-sm">{poi.name}</p>
                  <p className="text-xs opacity-70">{(poi.menu || []).length} mon</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="bg-[#FFFFFF] rounded-xl border border-[#DDDDDD] p-4">
            {!selectedPoi ? (
              <p className="text-sm text-[#757575]">Chua co POI nao.</p>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#212121]">Menu - {selectedPoi.name}</h1>
                    <p className="text-sm text-[#757575]">CRUD menu, sua gia nhanh va preview truoc publish</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPreview(true)}
                      className="px-3 py-2 rounded-lg border border-[#DDDDDD] text-sm font-semibold"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => setEditingItem(createEmptyItem())}
                      className="px-3 py-2 rounded-lg bg-[#333333] text-white text-sm font-semibold inline-flex items-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Them mon
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {(selectedPoi.menu || []).length === 0 ? (
                    <div className="border border-dashed border-[#DDDDDD] rounded-lg p-5 text-sm text-[#757575]">
                      Chua co mon nao. Bam Them mon de bat dau.
                    </div>
                  ) : (
                    selectedPoi.menu.map((item) => (
                      <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_140px] gap-3 border border-[#DDDDDD] rounded-lg p-3">
                        <div>
                          <p className="font-semibold text-[#212121]">{item.name?.vi || 'Chua dat ten'}</p>
                          <p className="text-xs text-[#757575] line-clamp-2">{item.description?.vi || 'Chua co mo ta'}</p>
                          <p className="text-xs text-[#757575] mt-1">{item.category || 'Other'}</p>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-[#757575]">Gia nhanh</label>
                          <input
                            type="number"
                            value={item.price || 0}
                            onChange={(e) => handleQuickPriceChange(item.id, e.target.value)}
                            className="mt-1 w-full px-2 py-1.5 rounded border border-[#DDDDDD] text-sm"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="px-3 py-2 rounded-lg border border-[#DDDDDD] text-sm inline-flex items-center gap-1"
                          >
                            <EditIcon className="w-4 h-4" />
                            Sua
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-2 rounded-lg border border-[#DC3545] text-[#DC3545] text-sm inline-flex items-center gap-1"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Xoa
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-[9999] bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white rounded-xl border border-[#DDDDDD] shadow-2xl p-4 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#212121]">{editingItem.id.startsWith('menu-') ? 'Them mon moi' : 'Sua mon an'}</h2>
              <button onClick={() => setEditingItem(null)}>
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={editingItem.name.vi}
                onChange={(e) => setEditingItem((prev) => ({ ...prev, name: { ...prev.name, vi: e.target.value } }))}
                placeholder="Ten mon (VI)"
              />
              <input
                value={editingItem.name.en}
                onChange={(e) => setEditingItem((prev) => ({ ...prev, name: { ...prev.name, en: e.target.value } }))}
                placeholder="Dish name (EN)"
              />
              <input
                value={editingItem.name.zh}
                onChange={(e) => setEditingItem((prev) => ({ ...prev, name: { ...prev.name, zh: e.target.value } }))}
                placeholder="菜名 (ZH)"
              />
              <input
                value={editingItem.category || ''}
                onChange={(e) => setEditingItem((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Category"
              />
              <input
                type="number"
                value={editingItem.price || 0}
                onChange={(e) => setEditingItem((prev) => ({ ...prev, price: Number(e.target.value || 0) }))}
                placeholder="Price"
              />
              <input
                value={editingItem.image || ''}
                onChange={(e) => setEditingItem((prev) => ({ ...prev, image: e.target.value }))}
                placeholder="Image URL"
              />
            </div>

            <textarea
              value={editingItem.description.vi}
              onChange={(e) => setEditingItem((prev) => ({ ...prev, description: { ...prev.description, vi: e.target.value } }))}
              placeholder="Mo ta (VI)"
              rows={3}
            />
            <textarea
              value={editingItem.description.en}
              onChange={(e) => setEditingItem((prev) => ({ ...prev, description: { ...prev.description, en: e.target.value } }))}
              placeholder="Description (EN)"
              rows={3}
            />
            <textarea
              value={editingItem.description.zh}
              onChange={(e) => setEditingItem((prev) => ({ ...prev, description: { ...prev.description, zh: e.target.value } }))}
              placeholder="描述 (ZH)"
              rows={3}
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingItem(null)} className="px-3 py-2 rounded-lg border border-[#DDDDDD] text-sm">
                Huy
              </button>
              <button onClick={handleSaveEdit} className="px-3 py-2 rounded-lg bg-[#333333] text-white text-sm">
                Luu
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview && selectedPoi && (
        <div className="fixed inset-0 z-[9999] bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white rounded-xl border border-[#DDDDDD] shadow-2xl p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Preview publish - {selectedPoi.name}</h2>
              <button onClick={() => setShowPreview(false)}>
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {(selectedPoi.menu || []).map((item) => (
                <div key={item.id} className="border border-[#DDDDDD] rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{item.name?.vi || item.name?.en || item.name?.zh}</p>
                    <p className="font-bold text-[#DC3545]">{new Intl.NumberFormat('vi-VN').format(item.price || 0)} VND</p>
                  </div>
                  <p className="text-sm text-[#757575] mt-1">{item.description?.vi || item.description?.en || item.description?.zh}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
