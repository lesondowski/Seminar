import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import MapComponent from '../../components/map/MapComponent';
import LanguageSelector from '../../components/poi/LanguageSelector';
import AudioPlayer from '../../components/poi/AudioPlayer';
import TranslateToggle from '../../components/poi/TranslateToggle';
import TranslationBadge from '../../components/poi/TranslationBadge';
import { translateNarration } from '../../utils/narration/translateClient';
import {
  fetchPOIs, fetchTours, approvePOI, rejectPOI, deletePOI, updatePOI, createPOI,
  searchAddressSuggestions, reverseGeocodeLocation, uploadPOIImage,
  createTour, updateTour, deleteTour,
} from '../../utils/api/poiService';
import { adminCreateOrUpdateUser, adminListUsers } from '../../utils/auth/authService';
import {
  PlusIcon, EditIcon, TrashIcon, CopyIcon, GlobeIcon, UploadIcon,
  GripVerticalIcon, RouteIcon, CloseIcon, CheckIcon, WarningIcon,
  ArrowLeftIcon, ArrowRightIcon, SearchIcon, MapPinIcon,
} from '../../components/common/Icons';

const SIDEBAR_ITEMS = [
  { key: 'overview', label: 'Dashboard' },
  { key: 'poi', label: 'POI Management' },
  { key: 'tour', label: 'Tour Management' },
  { key: 'restaurants', label: 'Restaurants' },
  { key: 'language', label: 'Language / Content' },
  { key: 'chatbot', label: 'Chatbot Data' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'users', label: 'User Management' },
  { key: 'settings', label: 'System Settings' },
];

const STATUS_STYLES = {
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  rejected: 'bg-rose-100 text-rose-700 border-rose-200',
};


export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [pois, setPOIs] = useState([]);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [previewTranslated, setPreviewTranslated] = useState(false);
  const [previewLanguage, setPreviewLanguage] = useState('en');
  const [previewTranslatedText, setPreviewTranslatedText] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [audioRate, setAudioRate] = useState(1);
  const [audioVoice, setAudioVoice] = useState('standard-female');
  const [audioDuration, setAudioDuration] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [langTab, setLangTab] = useState('VN');
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [managedUsers, setManagedUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [ownerForm, setOwnerForm] = useState({
    email: '',
    language: 'vi',
    role: 'owner',
  });
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressHint, setAddressHint] = useState('');
  const addressSearchSeqRef = useRef(0);
  const addressSearchTimerRef = useRef(null);
  const poiImageInputRef = useRef(null);
  const menuImageInputRefs = useRef({});
  const [uploadingPOIImage, setUploadingPOIImage] = useState(false);
  const [uploadingMenuIndex, setUploadingMenuIndex] = useState(-1);

  // ─── Tour Management State ────────────────────────────────────────────
  const [tours, setTours] = useState([]);
  const [tourView, setTourView] = useState('list'); // 'list' | 'edit'
  const [editingTour, setEditingTour] = useState(null);
  const [tourSearch, setTourSearch] = useState('');
  const [tourFilterLang, setTourFilterLang] = useState('all');
  const [tourFilterStatus, setTourFilterStatus] = useState('all');
  const [publishConfirm, setPublishConfirm] = useState(null); // tour object awaiting confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null);   // tour object awaiting confirm
  const [poiSearch, setPoiSearch] = useState('');             // search in POI picker
  const [dragOver, setDragOver] = useState(null);             // index being dragged over
  const [dragging, setDragging] = useState(null);             // index being dragged
  const [selectedVersion, setSelectedVersion] = useState(null); // { v, pois } read-only preview

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail') || '';
    setCurrentUserRole(userRole || '');
    setCurrentUserEmail(userEmail);

    if (!token || (userRole !== 'admin' && userRole !== 'moderator')) {
      router.push('/');
      return;
    }

    // Load real data from backend
    Promise.all([fetchPOIs(), fetchTours()]).then(([poisData, toursData]) => {
      const enriched = (Array.isArray(poisData) ? poisData : []).map((poi) => ({
        ...poi,
        language: (poi.narration?.sourceLanguage || 'vi').toUpperCase(),
        restaurant: poi.createdBy || 'Unknown',
      }));
      setPOIs(enriched);
      setTours(Array.isArray(toursData) ? toursData.map((t) => ({ ...t })) : []);

      if (userRole === 'admin') {
        adminListUsers()
          .then((data) => setManagedUsers(Array.isArray(data?.users) ? data.users : []))
          .catch(() => setManagedUsers([]));
      }

      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  useEffect(() => () => {
    if (addressSearchTimerRef.current) {
      clearTimeout(addressSearchTimerRef.current);
    }
  }, []);

  const reloadManagedUsers = async () => {
    setUserLoading(true);
    try {
      const data = await adminListUsers();
      setManagedUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (err) {
      setManagedUsers([]);
      setModal({ isOpen: true, type: 'error', title: 'Lỗi tải user', message: err.message || 'Không thể tải danh sách user.' });
    } finally {
      setUserLoading(false);
    }
  };

  const handleCreateOwnerAccount = async () => {
    if (!ownerForm.email.trim()) {
      setModal({ isOpen: true, type: 'error', title: 'Thiếu email', message: 'Vui lòng nhập email merchant/owner.' });
      return;
    }

    try {
      const result = await adminCreateOrUpdateUser(ownerForm);
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Cập nhật user thành công',
        message: `${result.email} (${result.role})`,
      });
      setOwnerForm((prev) => ({ ...prev, email: '' }));
      await reloadManagedUsers();
      setActiveView('users');
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: 'Không thể tạo owner', message: err.message || 'Yêu cầu bị từ chối.' });
    }
  };

  const pendingPOIs = useMemo(() => pois.filter((poi) => poi.status === 'pending'), [pois]);
  const approvedPOIs = useMemo(() => pois.filter((poi) => poi.status === 'approved'), [pois]);
  const filteredPOIs = useMemo(
    () =>
      pois.filter(
        (poi) =>
          poi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (poi.restaurant || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (poi.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [pois, searchTerm]
  );

  const restaurantRows = useMemo(() => {
    const map = new Map();
    pois.forEach((poi) => {
      if (!map.has(poi.restaurant)) {
        map.set(poi.restaurant, {
          id: poi.restaurant,
          name: poi.restaurant,
          poiCount: 0,
          views: 0,
          status: 'active',
        });
      }

      const row = map.get(poi.restaurant);
      row.poiCount += 1;
      row.views += Math.floor(200 + Math.random() * 800);
    });
    return Array.from(map.values());
  }, [pois]);

  const kpi = useMemo(
    () => [
      { label: 'Tổng POI', value: pois.length, tone: 'from-slate-700 to-slate-900' },
      { label: 'POI Pending', value: pendingPOIs.length, tone: 'from-amber-500 to-amber-700' },
      { label: 'Restaurants', value: restaurantRows.length, tone: 'from-indigo-500 to-indigo-700' },
      { label: 'User Active', value: 123 + pendingPOIs.length * 2, tone: 'from-emerald-500 to-emerald-700' },
      { label: 'Tour Active', value: tours.length, tone: 'from-rose-500 to-rose-700' },
    ],
    [pois.length, pendingPOIs.length, restaurantRows.length, tours.length]
  );

  const activityFeed = useMemo(
    () => [
      { id: 1, type: 'new', text: 'POI mới được tạo bởi Merchant 2', time: '5 phút trước' },
      { id: 2, type: 'reject', text: 'POI Bánh canh cua bị reject', time: '17 phút trước' },
      { id: 3, type: 'merchant', text: 'Restaurant mới đăng ký: Food House 88', time: '32 phút trước' },
      { id: 4, type: 'approve', text: 'POI Phở đặc biệt được duyệt', time: '1 giờ trước' },
    ],
    []
  );

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

  // ─── Tour Management Handlers ─────────────────────────────────────────
  const openCreateTour = () => {
    setEditingTour({
      id: null,
      name: '',
      description: '',
      language: 'VI',
      status: 'draft',
      pois: [],
      versions: [],
      version: 1,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setSelectedVersion(null);
    setTourView('edit');
  };

  const openEditTour = (tour) => {
    setEditingTour({ ...tour, pois: [...tour.pois] });
    setSelectedVersion(null);
    setTourView('edit');
  };

  const saveTour = async () => {
    if (!editingTour.name.trim()) {
      setModal({ isOpen: true, type: 'error', title: 'Thiếu tên tour', message: 'Vui lòng nhập tên tour trước khi lưu.' });
      return;
    }
    const payload = {
      name: editingTour.name,
      description: editingTour.description || '',
      language: editingTour.language || 'VI',
      status: editingTour.status || 'draft',
      duration: editingTour.duration || '',
      pois: editingTour.pois || [],
    };
    try {
      if (editingTour.id) {
        const updated = await updateTour(editingTour.id, payload);
        setTours((prev) => prev.map((t) => t.id === editingTour.id ? { ...t, ...updated } : t));
      } else {
        const created = await createTour(payload);
        setTours((prev) => [...prev, created]);
      }
      setModal({ isOpen: true, type: 'success', title: 'Đã lưu tour', message: 'Tour đã được lưu thành công.' });
      setTourView('list');
      setEditingTour(null);
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: 'Lỗi', message: err.message || 'Không thể lưu tour.' });
    }
  };

  const handleDeleteTour = async (tourId) => {
    try {
      await deleteTour(tourId);
      setTours((prev) => prev.filter((t) => t.id !== tourId));
      setDeleteConfirm(null);
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: 'Lỗi', message: err.message || 'Không thể xóa tour.' });
    }
  };

  const duplicateTour = async (tour) => {
    try {
      const payload = {
        name: `${tour.name} (Copy)`,
        description: tour.description || '',
        language: tour.language || 'VI',
        status: 'draft',
        duration: tour.duration || '',
        pois: tour.pois || [],
      };
      const created = await createTour(payload);
      setTours((prev) => [...prev, created]);
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: 'Lỗi', message: err.message || 'Không thể sao chép tour.' });
    }
  };

  const togglePublish = async (tour) => {
    const newStatus = tour.status === 'published' ? 'draft' : 'published';
    try {
      const updated = await updateTour(tour.id, { status: newStatus });
      setTours((prev) => prev.map((t) => t.id === tour.id ? { ...t, ...updated } : t));
      setPublishConfirm(null);
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: 'Lỗi', message: err.message || 'Không thể cập nhật trạng thái tour.' });
    }
  };

  const optimizeEditingRoute = () => {
    if (!editingTour || editingTour.pois.length < 2) return;
    const poiObjects = editingTour.pois.map((id) => pois.find((p) => p.id === id)).filter(Boolean);
    const unvisited = [...poiObjects];
    const sorted = [unvisited.shift()];
    while (unvisited.length > 0) {
      const current = sorted[sorted.length - 1];
      let nearestIndex = 0;
      let nearestDist = Infinity;
      unvisited.forEach((poi, idx) => {
        const d = calculateDistance(current.location.lat, current.location.lng, poi.location.lat, poi.location.lng);
        if (d < nearestDist) { nearestDist = d; nearestIndex = idx; }
      });
      sorted.push(unvisited.splice(nearestIndex, 1)[0]);
    }
    setEditingTour((prev) => ({ ...prev, pois: sorted.map((p) => p.id) }));
  };

  const addPOIToTour = (poiId) => {
    if (editingTour.pois.includes(poiId)) return;
    setEditingTour((prev) => ({ ...prev, pois: [...prev.pois, poiId] }));
  };

  const removePOIFromTour = (poiId) => {
    setEditingTour((prev) => ({ ...prev, pois: prev.pois.filter((id) => id !== poiId) }));
  };

  const moveTourPOI = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= editingTour.pois.length) return;
    const next = [...editingTour.pois];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    setEditingTour((prev) => ({ ...prev, pois: next }));
  };

  const handleDragStart = (index) => setDragging(index);
  const handleDragEnter = (index) => setDragOver(index);
  const handleDragEnd = () => {
    if (dragging !== null && dragOver !== null && dragging !== dragOver) {
      const next = [...editingTour.pois];
      const [item] = next.splice(dragging, 1);
      next.splice(dragOver, 0, item);
      setEditingTour((prev) => ({ ...prev, pois: next }));
    }
    setDragging(null);
    setDragOver(null);
  };

  // ─── Filtered tours ───────────────────────────────────────────────────
  const filteredTours = useMemo(() => {
    return tours.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(tourSearch.toLowerCase());
      const matchLang = tourFilterLang === 'all' || t.language === tourFilterLang;
      const matchStatus = tourFilterStatus === 'all' || t.status === tourFilterStatus;
      return matchSearch && matchLang && matchStatus;
    });
  }, [tours, tourSearch, tourFilterLang, tourFilterStatus]);

  const editingPOIObjects = useMemo(() => {
    if (!editingTour) return [];
    return editingTour.pois.map((id) => pois.find((p) => p.id === id)).filter(Boolean);
  }, [editingTour, pois]);

  const availablePOIs = useMemo(() => {
    if (!editingTour) return [];
    return pois.filter((p) => {
      const notInTour = !editingTour.pois.includes(p.id);
      const matchSearch = p.name.toLowerCase().includes(poiSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(poiSearch.toLowerCase());
      return notInTour && matchSearch;
    });
  }, [pois, editingTour, poiSearch]);

  const handleApprovePOI = async (poiId) => {
    try {
      await approvePOI(poiId);
      setPOIs((prev) =>
        prev.map((poi) => (poi.id === poiId ? { ...poi, status: 'approved', rejectReason: '' } : poi))
      );
      setModal({
        isOpen: true,
        type: 'success',
        title: 'POI đã được duyệt',
        message: 'Nội dung đã được chuyển sang trạng thái approved.',
      });
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: 'Lỗi', message: err.message || 'Không thể duyệt POI.' });
    }
  };

  const handleRejectPOI = async (poiId) => {
    if (!rejectReason.trim()) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Thiếu lý do reject',
        message: 'Vui lòng nhập lý do trước khi reject POI.',
      });
      return;
    }
    try {
      await rejectPOI(poiId, rejectReason.trim());
      setPOIs((prev) =>
        prev.map((poi) =>
          poi.id === poiId
            ? { ...poi, status: 'rejected', rejectReason: rejectReason.trim() }
            : poi
        )
      );
      setRejectReason('');
      setModal({
        isOpen: true,
        type: 'info',
        title: 'POI đã bị từ chối',
        message: 'Lý do reject đã được lưu để owner chỉnh sửa.',
      });
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: 'Lỗi', message: err.message || 'Không thể reject POI.' });
    }
  };

  const handleDeletePOI = async (poiId) => {
    if (!window.confirm('Bạn có chắc muốn xóa POI này?')) return;
    try {
      await deletePOI(poiId);
      setPOIs((prev) => prev.filter((poi) => poi.id !== poiId));
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: 'Lỗi', message: err.message || 'Không thể xóa POI.' });
    }
  };

  const canEditPOI = (poi) => {
    if (!poi) return false;
    if (currentUserRole === 'admin') return true;
    if (currentUserRole === 'moderator') {
      return poi.createdByUser === currentUserEmail;
    }
    return false;
  };

  const createEmptyMenuItem = () => ({
    id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: { vi: '', en: '', zh: '' },
    description: { vi: '', en: '', zh: '' },
    price: 0,
    currency: 'VND',
    image: '',
    category: 'Other',
  });

  const normalizeMenuItems = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map((item, idx) => ({
      id: item?.id || `tmp-${Date.now()}-${idx}`,
      name: {
        vi: item?.name?.vi || '',
        en: item?.name?.en || '',
        zh: item?.name?.zh || '',
      },
      description: {
        vi: item?.description?.vi || '',
        en: item?.description?.en || '',
        zh: item?.description?.zh || '',
      },
      price: Number(item?.price || 0),
      currency: item?.currency || 'VND',
      image: item?.image || '',
      category: item?.category || 'Other',
    }));
  };

  const addMenuItem = () => {
    setSelectedPOI((prev) => ({
      ...prev,
      menu: [...normalizeMenuItems(prev?.menu), createEmptyMenuItem()],
    }));
  };

  const updateMenuItem = (index, updater) => {
    setSelectedPOI((prev) => {
      const nextMenu = normalizeMenuItems(prev?.menu);
      if (index < 0 || index >= nextMenu.length) return prev;
      nextMenu[index] = updater(nextMenu[index]);
      return { ...prev, menu: nextMenu };
    });
  };

  const removeMenuItem = (index) => {
    setSelectedPOI((prev) => ({
      ...prev,
      menu: normalizeMenuItems(prev?.menu).filter((_, idx) => idx !== index),
    }));
  };

  const triggerPOIImageUpload = () => {
    if (poiImageInputRef.current) {
      poiImageInputRef.current.click();
    }
  };

  const handleUploadPOIImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPOIImage(true);
      const imageUrl = await uploadPOIImage(file);
      setSelectedPOI((prev) => ({ ...prev, image: imageUrl }));
      setModal({ isOpen: true, type: 'success', title: 'Upload ảnh thành công', message: 'Ảnh quán đã được cập nhật.' });
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: 'Upload thất bại', message: err.message || 'Không thể upload ảnh quán.' });
    } finally {
      setUploadingPOIImage(false);
      event.target.value = '';
    }
  };

  const triggerMenuImageUpload = (index) => {
    const input = menuImageInputRefs.current[index];
    if (input) {
      input.click();
    }
  };

  const handleUploadMenuImage = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingMenuIndex(index);
      const imageUrl = await uploadPOIImage(file);
      updateMenuItem(index, (item) => ({ ...item, image: imageUrl }));
      setModal({ isOpen: true, type: 'success', title: 'Upload ảnh món thành công', message: `Đã cập nhật ảnh cho món #${index + 1}.` });
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: 'Upload thất bại', message: err.message || 'Không thể upload ảnh món.' });
    } finally {
      setUploadingMenuIndex(-1);
      event.target.value = '';
    }
  };

  const openCreatePOI = () => {
    const draft = {
      id: null,
      name: '',
      description: '',
      price: '$$',
      image: '',
      category: '',
      location: { lat: 10.796, lng: 106.749 },
      rating: 0,
      phone: '',
      website: '',
      audio: '',
      narration: { sourceLanguage: 'vi', content: '' },
      hours: '',
      address: '',
      menu: [createEmptyMenuItem()],
      status: 'pending',
      rejectReason: '',
    };
    setSelectedPOI(draft);
    setAddressQuery('');
    setAddressSuggestions([]);
    setAddressHint('');
    setRejectReason('');
  };

  const openPOIEditor = (poi) => {
    const draft = {
      ...poi,
      menu: normalizeMenuItems(poi.menu),
      narration: poi.narration || {
        sourceLanguage: 'vi',
        content: poi.description || '',
      },
    };
    setSelectedPOI(draft);
    setPreviewTranslated(false);
    setPreviewLanguage('en');
    setPreviewTranslatedText('');
    setAudioRate(1);
    setAudioVoice('standard-female');
    setAudioDuration(null);
    setAddressQuery(poi.address || '');
    setAddressSuggestions([]);
    setAddressHint('');
  };

  const handleAddressSearch = async (query) => {
    setAddressQuery(query);
    setSelectedPOI((prev) => ({ ...prev, address: query }));

    if (addressSearchTimerRef.current) {
      clearTimeout(addressSearchTimerRef.current);
      addressSearchTimerRef.current = null;
    }

    if (!query || query.trim().length < 3) {
      setAddressSuggestions([]);
      setAddressHint('');
      setSearchingAddress(false);
      return;
    }

    const requestSeq = ++addressSearchSeqRef.current;
    setSearchingAddress(true);
    setAddressHint('');

    addressSearchTimerRef.current = setTimeout(async () => {
      const results = await searchAddressSuggestions(query.trim(), 6);
      if (requestSeq !== addressSearchSeqRef.current) {
        return;
      }

      let nextSuggestions = Array.isArray(results) ? results : [];
      if (nextSuggestions.length === 0) {
        const normalized = query.trim().toLowerCase();
        const localFallback = pois
          .filter((poi) =>
            (poi.address || '').toLowerCase().includes(normalized) ||
            (poi.name || '').toLowerCase().includes(normalized)
          )
          .slice(0, 6)
          .map((poi) => ({
            display_name: poi.address || poi.name,
            lat: poi.location?.lat,
            lng: poi.location?.lng,
          }))
          .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));

        nextSuggestions = localFallback;
        setAddressHint(
          localFallback.length > 0
            ? 'Không lấy được gợi ý online, đang hiển thị gợi ý nội bộ từ dữ liệu POI.'
            : 'Chưa có gợi ý địa chỉ. Bạn có thể nhập cụ thể hơn hoặc ghim trực tiếp trên bản đồ.'
        );
      }

      setAddressSuggestions(nextSuggestions);
      setSearchingAddress(false);
    }, 350);
  };

  const handlePickAddressSuggestion = (item) => {
    setSelectedPOI((prev) => ({
      ...prev,
      address: item.display_name || prev.address,
      location: { lat: item.lat, lng: item.lng },
    }));
    setAddressQuery(item.display_name || '');
    setAddressSuggestions([]);
    setAddressHint('');
  };

  const handleLocationPinChange = async (coords) => {
    setSelectedPOI((prev) => ({ ...prev, location: coords }));
    const reverse = await reverseGeocodeLocation(coords.lat, coords.lng);
    if (reverse?.display_name) {
      setSelectedPOI((prev) => ({ ...prev, address: reverse.display_name }));
      setAddressQuery(reverse.display_name);
      setAddressHint('');
    }
  };

  const savePOIContent = async () => {
    if (!selectedPOI) return;

    if (!selectedPOI.name?.trim()) {
      setModal({ isOpen: true, type: 'error', title: 'Thiếu tên POI', message: 'Vui lòng nhập tên quán/POI.' });
      return;
    }

    if (!selectedPOI.location?.lat || !selectedPOI.location?.lng) {
      setModal({ isOpen: true, type: 'error', title: 'Thiếu vị trí', message: 'Vui lòng chọn vị trí quán trên map hoặc từ gợi ý địa chỉ.' });
      return;
    }

    const payload = {
      name: selectedPOI.name,
      description: selectedPOI.description || '',
      price: selectedPOI.price || '$$',
      image: selectedPOI.image || '',
      category: selectedPOI.category || '',
      location: selectedPOI.location,
      rating: Number(selectedPOI.rating || 0),
      phone: selectedPOI.phone || '',
      website: selectedPOI.website || '',
      audio: selectedPOI.audio || '',
      narration: selectedPOI.narration,
      hours: selectedPOI.hours || '',
      address: selectedPOI.address || '',
      rejectReason: selectedPOI.rejectReason || '',
      status: selectedPOI.status || 'pending',
      menu: normalizeMenuItems(selectedPOI.menu).map((item) => ({
        id: item.id?.startsWith('tmp-') ? null : String(item.id),
        name: {
          vi: item.name.vi || '',
          en: item.name.en || '',
          zh: item.name.zh || '',
        },
        description: {
          vi: item.description.vi || '',
          en: item.description.en || '',
          zh: item.description.zh || '',
        },
        price: Number(item.price || 0),
        currency: item.currency || 'VND',
        image: item.image || '',
        category: item.category || 'Other',
      })),
    };

    try {
      if (selectedPOI.id) {
        if (!canEditPOI(selectedPOI)) {
          setModal({ isOpen: true, type: 'error', title: 'Không có quyền', message: 'Moderator chỉ có thể chỉnh sửa POI do mình tạo.' });
          return;
        }
        const updated = await updatePOI(selectedPOI.id, payload);
        const nextUpdated = {
          ...updated,
          language: (updated.narration?.sourceLanguage || 'vi').toUpperCase(),
          restaurant: updated.createdBy || 'Unknown',
        };
        setPOIs((prev) =>
          prev.map((poi) => (poi.id === selectedPOI.id ? { ...poi, ...nextUpdated } : poi))
        );
        setSelectedPOI(nextUpdated);
      } else {
        const created = await createPOI(payload);
        const nextCreated = {
          ...created,
          language: (created.narration?.sourceLanguage || 'vi').toUpperCase(),
          restaurant: created.createdBy || 'Unknown',
        };
        setPOIs((prev) => [{
          ...nextCreated,
        }, ...prev]);
        setSelectedPOI(nextCreated);
      }
      setModal({
        isOpen: true,
        type: 'success',
        title: selectedPOI.id ? 'Đã cập nhật POI' : 'Đã tạo POI',
        message: selectedPOI.id
          ? 'Thông tin chi tiết quán đã được lưu vào database.'
          : 'POI mới đã được tạo và lưu vào database (pending).',
      });
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: 'Lỗi lưu POI', message: err.message || 'Không thể lưu nội dung.' });
    }
  };

  const updateNarration = (patch) => {
    setSelectedPOI((prev) => ({
      ...prev,
      narration: {
        ...prev.narration,
        ...patch,
      },
    }));
  };

  const handlePreviewTranslate = async () => {
    if (!selectedPOI?.narration?.content?.trim()) return;
    setPreviewLoading(true);
    try {
      const data = await translateNarration({
        text: selectedPOI.narration.content,
        from: selectedPOI.narration.sourceLanguage,
        to: previewLanguage,
      });
      setPreviewTranslatedText(data.translatedText || '');
      setPreviewTranslated(true);
    } catch (err) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Lỗi dịch thuyết minh',
        message: err.message || 'Không thể dịch lúc này',
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerateAudioMeta = () => {
    const text = previewTranslated && previewTranslatedText
      ? previewTranslatedText
      : selectedPOI?.narration?.content || '';

    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const baseWpm = 155;
    const estimatedSeconds = words > 0 ? Math.max(8, Math.round((words / baseWpm) * 60 / audioRate)) : 0;
    setAudioDuration(estimatedSeconds);

    setModal({
      isOpen: true,
      type: 'success',
      title: 'Generate Audio thành công',
      message: `Voice: ${audioVoice}, tốc độ ${audioRate}x, thời lượng ước tính ${estimatedSeconds}s.`,
    });
  };

  if (loading) return <Loading fullScreen text="Đang tải Admin Dashboard..." />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f4f6f8]">
        <div className="max-w-[1700px] mx-auto p-4 md:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5">
            <aside className="bg-[#111827] rounded-2xl p-4 text-white xl:sticky xl:top-6 h-fit">
              <div className="pb-4 border-b border-white/10 mb-4">
                <p className="text-xs uppercase text-white/60 tracking-[0.18em]">Control Center</p>
                <h2 className="text-xl font-bold mt-1">Admin Console</h2>
              </div>

              <nav className="space-y-1">
                {SIDEBAR_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveView(item.key)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition text-sm ${
                      activeView === item.key
                        ? 'bg-white text-[#111827] font-semibold'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-6 p-3 rounded-lg bg-white/10 text-xs text-white/75 leading-relaxed">
                Role-based access: chỉ Admin và Moderator có quyền kiểm duyệt dữ liệu hệ thống.
              </div>
            </aside>

            <main className="min-w-0 space-y-5">
              <header className="bg-white rounded-2xl border border-[#e5e7eb] p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-[#111827]">Smart Food Tour Admin Dashboard</h1>
                  <p className="text-sm text-[#6b7280]">Quản lý POI, Tour, Restaurant, dữ liệu đa ngôn ngữ và hệ thống AI.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[#d1d5db] text-sm w-56"
                    placeholder="Tìm theo POI / Merchant..."
                  />
                </div>
              </header>

              {activeView === 'overview' && (
                <div className="space-y-5">
                  <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                    {kpi.map((card) => (
                      <div key={card.label} className={`bg-gradient-to-br ${card.tone} text-white rounded-2xl p-4 shadow-lg`}>
                        <p className="text-xs uppercase tracking-widest text-white/80">{card.label}</p>
                        <p className="text-3xl font-bold mt-2">{card.value}</p>
                      </div>
                    ))}
                  </section>

                  <section className="grid grid-cols-1 2xl:grid-cols-[1.4fr_0.8fr] gap-5">
                    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-[#111827]">Map Overview</h3>
                        <span className="text-xs text-[#6b7280]">POI phân bố theo khu vực</span>
                      </div>
                      <div className="h-[360px] rounded-xl overflow-hidden border border-[#e5e7eb]">
                        <MapComponent
                          pois={approvedPOIs}
                          routeTarget={null}
                          selectedPOIId={selectedPOI?.id || null}
                          onPOISelect={(poi) => {
                            openPOIEditor(poi);
                            setActiveView('poi');
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
                      <h3 className="font-bold text-[#111827] mb-3">Activity Feed</h3>
                      <div className="space-y-3">
                        {activityFeed.map((item) => (
                          <div key={item.id} className="rounded-xl border border-[#e5e7eb] p-3 bg-[#f9fafb]">
                            <p className="text-sm font-semibold text-[#111827]">{item.text}</p>
                            <p className="text-xs text-[#6b7280] mt-1">{item.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeView === 'poi' && (
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">
                  <section className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
                    <div className="p-4 border-b border-[#e5e7eb] flex justify-between items-center gap-3">
                      <h3 className="font-bold text-[#111827]">POI Management</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#6b7280]">{filteredPOIs.length} POI</span>
                        <button
                          className="px-3 py-1.5 rounded bg-[#111827] text-white text-xs font-semibold"
                          onClick={openCreatePOI}
                        >
                          Tạo POI
                        </button>
                      </div>
                    </div>
                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#f8fafc] text-[#475569]">
                          <tr>
                            <th className="text-left px-3 py-3">Tên POI</th>
                            <th className="text-left px-3 py-3">Restaurant</th>
                            <th className="text-left px-3 py-3">Category</th>
                            <th className="text-left px-3 py-3">Creator</th>
                            <th className="text-left px-3 py-3">Status</th>
                            <th className="text-left px-3 py-3">Ngôn ngữ</th>
                            <th className="text-left px-3 py-3">Ngày tạo</th>
                            <th className="text-left px-3 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPOIs.map((poi) => (
                            <tr key={poi.id} className="border-t border-[#eef2f7] align-top">
                              <td className="px-3 py-3 font-semibold text-[#111827]">{poi.name}</td>
                              <td className="px-3 py-3 text-[#4b5563]">{poi.restaurant}</td>
                              <td className="px-3 py-3 text-[#4b5563]">{poi.category}</td>
                              <td className="px-3 py-3 text-[#4b5563]">{poi.createdByUser || '-'}</td>
                              <td className="px-3 py-3">
                                <span className={`px-2 py-1 rounded-full border text-xs font-semibold ${STATUS_STYLES[poi.status] || STATUS_STYLES.pending}`}>
                                  {poi.status}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-[#4b5563]">{poi.language}</td>
                              <td className="px-3 py-3 text-[#4b5563]">{poi.createdAt}</td>
                              <td className="px-3 py-3">
                                <div className="flex flex-wrap gap-1.5">
                                  <button className="px-2 py-1 rounded bg-[#111827] text-white text-xs" onClick={() => openPOIEditor(poi)}>
                                    View
                                  </button>
                                  <button className="px-2 py-1 rounded bg-emerald-600 text-white text-xs" onClick={() => handleApprovePOI(poi.id)}>
                                    Approve
                                  </button>
                                  <button className="px-2 py-1 rounded bg-amber-500 text-white text-xs" onClick={() => openPOIEditor(poi)}>
                                    Reject
                                  </button>
                                  <button
                                    className={`px-2 py-1 rounded text-white text-xs ${canEditPOI(poi) ? 'bg-sky-600' : 'bg-slate-400 cursor-not-allowed'}`}
                                    disabled={!canEditPOI(poi)}
                                    onClick={() => openPOIEditor(poi)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className={`px-2 py-1 rounded text-white text-xs ${canEditPOI(poi) ? 'bg-rose-600' : 'bg-slate-400 cursor-not-allowed'}`}
                                    disabled={!canEditPOI(poi)}
                                    onClick={() => handleDeletePOI(poi.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="bg-white rounded-2xl border border-[#e5e7eb] p-4 h-fit xl:sticky xl:top-6">
                    <h3 className="font-bold text-[#111827] mb-3">POI Moderation</h3>
                    {selectedPOI ? (
                      <div className="space-y-3">
                        <img src={selectedPOI.image || '/placeholder.jpg'} alt={selectedPOI.name} className="w-full h-40 rounded-xl object-cover border border-[#e5e7eb]" />
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-[#6b7280]">Tên POI</p>
                            <input
                              value={selectedPOI.name}
                              onChange={(e) => setSelectedPOI((prev) => ({ ...prev, name: e.target.value }))}
                              className="w-full border border-[#d1d5db] rounded-lg px-2 py-1.5"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-[#6b7280]">Category</p>
                            <input
                              value={selectedPOI.category}
                              onChange={(e) => setSelectedPOI((prev) => ({ ...prev, category: e.target.value }))}
                              className="w-full border border-[#d1d5db] rounded-lg px-2 py-1.5"
                            />
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-[#6b7280]">Mô tả quán</p>
                          <textarea
                            value={selectedPOI.description || ''}
                            onChange={(e) => setSelectedPOI((prev) => ({ ...prev, description: e.target.value }))}
                            className="w-full border border-[#d1d5db] rounded-lg p-2 text-sm"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-[#6b7280]">Điện thoại</p>
                            <input
                              value={selectedPOI.phone || ''}
                              onChange={(e) => setSelectedPOI((prev) => ({ ...prev, phone: e.target.value }))}
                              className="w-full border border-[#d1d5db] rounded-lg px-2 py-1.5"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-[#6b7280]">Website</p>
                            <input
                              value={selectedPOI.website || ''}
                              onChange={(e) => setSelectedPOI((prev) => ({ ...prev, website: e.target.value }))}
                              className="w-full border border-[#d1d5db] rounded-lg px-2 py-1.5"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-[#6b7280]">Giờ mở cửa</p>
                            <input
                              value={selectedPOI.hours || ''}
                              onChange={(e) => setSelectedPOI((prev) => ({ ...prev, hours: e.target.value }))}
                              className="w-full border border-[#d1d5db] rounded-lg px-2 py-1.5"
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-[#6b7280]">Hình ảnh POI (URL)</p>
                            <input
                              value={selectedPOI.image || ''}
                              onChange={(e) => setSelectedPOI((prev) => ({ ...prev, image: e.target.value }))}
                              className="w-full border border-[#d1d5db] rounded-lg px-2 py-1.5"
                              placeholder="https://..."
                            />
                            <input
                              ref={poiImageInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleUploadPOIImage}
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="px-2 py-1 text-[11px] rounded border border-[#d1d5db] bg-white"
                                onClick={triggerPOIImageUpload}
                                disabled={uploadingPOIImage}
                              >
                                {uploadingPOIImage ? 'Đang upload...' : 'Upload ảnh'}
                              </button>
                              <button
                                type="button"
                                className="px-2 py-1 text-[11px] rounded border border-[#d1d5db] bg-white"
                                onClick={() => setSelectedPOI((prev) => ({ ...prev, image: '' }))}
                              >
                                Xóa ảnh
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-[#e5e7eb] p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-[#374151]">Menu món ăn</p>
                            <button
                              type="button"
                              onClick={addMenuItem}
                              className="px-2.5 py-1.5 rounded bg-[#111827] text-white text-xs"
                            >
                              + Thêm món
                            </button>
                          </div>

                          {normalizeMenuItems(selectedPOI.menu).length === 0 && (
                            <p className="text-xs text-[#6b7280]">Chưa có món nào. Bấm "Thêm món" để bắt đầu.</p>
                          )}

                          {normalizeMenuItems(selectedPOI.menu).map((menuItem, idx) => (
                            <div key={menuItem.id || idx} className="border border-[#e5e7eb] rounded-lg p-2 space-y-2 bg-[#fafafa]">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-[#374151]">Món #{idx + 1}</p>
                                <button
                                  type="button"
                                  className="px-2 py-1 text-[11px] rounded bg-rose-600 text-white"
                                  onClick={() => removeMenuItem(idx)}
                                >
                                  Xóa
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  value={menuItem.name.vi}
                                  onChange={(e) => updateMenuItem(idx, (item) => ({ ...item, name: { ...item.name, vi: e.target.value } }))}
                                  className="border border-[#d1d5db] rounded px-2 py-1.5 text-xs"
                                  placeholder="Tên món (VI)"
                                />
                                <input
                                  value={menuItem.name.en}
                                  onChange={(e) => updateMenuItem(idx, (item) => ({ ...item, name: { ...item.name, en: e.target.value } }))}
                                  className="border border-[#d1d5db] rounded px-2 py-1.5 text-xs"
                                  placeholder="Tên món (EN)"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  value={menuItem.price}
                                  onChange={(e) => updateMenuItem(idx, (item) => ({ ...item, price: Number(e.target.value || 0) }))}
                                  className="border border-[#d1d5db] rounded px-2 py-1.5 text-xs"
                                  placeholder="Giá"
                                  type="number"
                                  min={0}
                                />
                                <input
                                  value={menuItem.category}
                                  onChange={(e) => updateMenuItem(idx, (item) => ({ ...item, category: e.target.value }))}
                                  className="border border-[#d1d5db] rounded px-2 py-1.5 text-xs"
                                  placeholder="Category"
                                />
                              </div>

                              <input
                                value={menuItem.image}
                                onChange={(e) => updateMenuItem(idx, (item) => ({ ...item, image: e.target.value }))}
                                className="w-full border border-[#d1d5db] rounded px-2 py-1.5 text-xs"
                                placeholder="Ảnh món (URL)"
                              />
                              <input
                                ref={(el) => { menuImageInputRefs.current[idx] = el; }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleUploadMenuImage(idx, e)}
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  className="px-2 py-1 text-[11px] rounded border border-[#d1d5db] bg-white"
                                  onClick={() => triggerMenuImageUpload(idx)}
                                  disabled={uploadingMenuIndex === idx}
                                >
                                  {uploadingMenuIndex === idx ? 'Đang upload...' : 'Upload ảnh món'}
                                </button>
                                <button
                                  type="button"
                                  className="px-2 py-1 text-[11px] rounded border border-[#d1d5db] bg-white"
                                  onClick={() => updateMenuItem(idx, (item) => ({ ...item, image: '' }))}
                                >
                                  Xóa ảnh món
                                </button>
                              </div>
                              {menuItem.image && (
                                <img src={menuItem.image} alt={menuItem.name.vi || `menu-${idx + 1}`} className="w-full h-24 object-cover rounded border border-[#e5e7eb]" />
                              )}
                              <textarea
                                value={menuItem.description.vi}
                                onChange={(e) => updateMenuItem(idx, (item) => ({ ...item, description: { ...item.description, vi: e.target.value } }))}
                                className="w-full border border-[#d1d5db] rounded p-2 text-xs"
                                rows={2}
                                placeholder="Mô tả món (VI)"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="relative">
                          <p className="text-xs text-[#6b7280] mb-1">Địa chỉ quán / chi nhánh</p>
                          <input
                            value={addressQuery}
                            onChange={(e) => handleAddressSearch(e.target.value)}
                            className="w-full border border-[#d1d5db] rounded-lg px-2 py-1.5 text-sm"
                            placeholder="Nhập địa chỉ để gợi ý từ bản đồ..."
                          />
                          {searchingAddress && <p className="text-[11px] text-[#6b7280] mt-1">Đang tìm địa chỉ...</p>}
                          {!searchingAddress && !!addressHint && (
                            <p className="text-[11px] text-[#b45309] mt-1">{addressHint}</p>
                          )}
                          {addressSuggestions.length > 0 && (
                            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#d1d5db] rounded-lg shadow max-h-44 overflow-auto">
                              {addressSuggestions.map((item, idx) => (
                                <button
                                  key={`${item.display_name}-${idx}`}
                                  type="button"
                                  className="w-full text-left px-2 py-2 text-xs hover:bg-[#f3f4f6] border-b border-[#f3f4f6]"
                                  onClick={() => handlePickAddressSuggestion(item)}
                                >
                                  {item.display_name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-xs text-[#6b7280] mb-1">Ngôn ngữ gốc thuyết minh</p>
                          <LanguageSelector
                            value={selectedPOI.narration?.sourceLanguage || 'vi'}
                            onChange={(lang) => updateNarration({ sourceLanguage: lang })}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-[#6b7280]">Nội dung thuyết minh (Rich Text cơ bản)</p>
                            <span className="text-[11px] text-[#9ca3af]">
                              {(selectedPOI.narration?.content || '').length}/1500
                            </span>
                          </div>
                          <div className="flex gap-2 mb-2">
                            <button
                              type="button"
                              className="px-2 py-1 text-xs rounded border border-[#d1d5db] bg-white"
                              onClick={() => updateNarration({ content: `${selectedPOI.narration?.content || ''}**in đậm**` })}
                            >
                              Bold
                            </button>
                            <button
                              type="button"
                              className="px-2 py-1 text-xs rounded border border-[#d1d5db] bg-white"
                              onClick={() => updateNarration({ content: `${selectedPOI.narration?.content || ''}\n\n` })}
                            >
                              Xuống dòng
                            </button>
                          </div>
                          <textarea
                            value={selectedPOI.narration?.content || ''}
                            onChange={(e) => updateNarration({ content: e.target.value })}
                            className="w-full border border-[#d1d5db] rounded-lg p-2 text-sm leading-6"
                            rows={6}
                            maxLength={1500}
                            placeholder="Nhập thuyết minh chi tiết cho POI..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="p-2 rounded-lg bg-[#f9fafb] border border-[#e5e7eb]">
                            <p className="text-xs text-[#6b7280]">Giá</p>
                            <input
                              value={selectedPOI.price}
                              onChange={(e) => setSelectedPOI((prev) => ({ ...prev, price: e.target.value }))}
                              className="w-full font-semibold bg-transparent outline-none"
                            />
                          </div>
                          <div className="p-2 rounded-lg bg-[#f9fafb] border border-[#e5e7eb]">
                            <p className="text-xs text-[#6b7280]">Status</p>
                            <p className="font-semibold capitalize">{selectedPOI.status}</p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-3 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-[#374151]">Preview User View</p>
                            <TranslationBadge
                              from={selectedPOI.narration?.sourceLanguage || 'vi'}
                              to={previewLanguage}
                              isTranslated={previewTranslated && Boolean(previewTranslatedText)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <LanguageSelector value={previewLanguage} onChange={setPreviewLanguage} className="flex-1" />
                            <button
                              type="button"
                              onClick={handlePreviewTranslate}
                              disabled={previewLoading}
                              className="px-3 py-2 rounded-lg bg-[#111827] text-white text-xs font-semibold disabled:opacity-50"
                            >
                              {previewLoading ? 'Đang dịch...' : 'Dịch preview'}
                            </button>
                            <TranslateToggle
                              showTranslated={previewTranslated}
                              onChange={setPreviewTranslated}
                              disabled={!previewTranslatedText}
                            />
                          </div>
                          <div className="min-h-[96px] rounded-lg bg-white border border-[#e5e7eb] p-3 text-sm whitespace-pre-wrap leading-6">
                            {previewTranslated && previewTranslatedText
                              ? previewTranslatedText
                              : (selectedPOI.narration?.content || 'Chưa có nội dung')}
                          </div>
                        </div>

                        <div className="rounded-xl border border-[#e5e7eb] bg-white p-3 space-y-3">
                          <p className="text-xs font-semibold text-[#374151]">Generate Audio</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <select
                              value={audioVoice}
                              onChange={(e) => setAudioVoice(e.target.value)}
                              className="border border-[#d1d5db] rounded-lg px-2 py-1.5"
                            >
                              <option value="standard-female">Female - Standard</option>
                              <option value="standard-male">Male - Standard</option>
                              <option value="warm-story">Warm Story</option>
                            </select>
                            <select
                              value={audioRate}
                              onChange={(e) => setAudioRate(Number(e.target.value))}
                              className="border border-[#d1d5db] rounded-lg px-2 py-1.5"
                            >
                              <option value={0.75}>0.75x</option>
                              <option value={1}>1x</option>
                              <option value={1.25}>1.25x</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={handleGenerateAudioMeta}
                            className="w-full px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold"
                          >
                            Generate Audio
                          </button>
                          {audioDuration !== null && (
                            <p className="text-xs text-[#6b7280]">Thời lượng ước tính: {audioDuration}s</p>
                          )}
                          <AudioPlayer
                            text={previewTranslated && previewTranslatedText ? previewTranslatedText : (selectedPOI.narration?.content || '')}
                            languageCode={previewTranslated ? previewLanguage : (selectedPOI.narration?.sourceLanguage || 'vi')}
                          />
                        </div>

                        <div>
                          <p className="text-xs text-[#6b7280] mb-1">Preview audio</p>
                          <audio controls className="w-full">
                            <source src={selectedPOI.audio} type="audio/mpeg" />
                          </audio>
                        </div>
                        <div className="text-xs text-[#6b7280]">
                          Vị trí hiện tại: {selectedPOI.location?.lat?.toFixed?.(6) || '--'}, {selectedPOI.location?.lng?.toFixed?.(6) || '--'}
                        </div>
                        <div className="h-40 rounded-xl overflow-hidden border border-[#e5e7eb]">
                          <MapComponent
                            pois={[]}
                            routeTarget={null}
                            selectedPOIId={selectedPOI.id || null}
                            onPOISelect={() => {}}
                            initialCenter={selectedPOI.location || { lat: 10.796, lng: 106.749 }}
                            disableAutoLocate
                            showUserMarker={false}
                            editableLocation
                            locationPin={selectedPOI.location}
                            onLocationPinChange={handleLocationPinChange}
                          />
                        </div>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-full border border-[#d1d5db] rounded-lg p-2 text-sm"
                          rows={3}
                          placeholder="Nhập lý do reject (nếu có)..."
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={savePOIContent} className="rounded-lg bg-[#111827] text-white text-sm font-semibold">
                            {selectedPOI.id ? 'Lưu POI' : 'Tạo POI'}
                          </button>
                          {selectedPOI.id ? (
                            <button onClick={() => handleApprovePOI(selectedPOI.id)} className="rounded-lg bg-emerald-600 text-white text-sm font-semibold">Approve</button>
                          ) : (
                            <button onClick={() => setSelectedPOI(null)} className="rounded-lg bg-[#374151] text-white text-sm font-semibold">Close</button>
                          )}
                        </div>
                        {selectedPOI.id && (
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleRejectPOI(selectedPOI.id)} className="rounded-lg bg-amber-500 text-white text-sm font-semibold">Reject</button>
                            <button onClick={() => setSelectedPOI(null)} className="rounded-lg bg-[#374151] text-white text-sm font-semibold">Close</button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-[#6b7280]">Chọn một POI từ danh sách để bắt đầu moderation.</p>
                    )}
                  </section>
                </div>
              )}

              {activeView === 'tour' && (
                <div className="space-y-5">
                  {/* ── Tour List View ── */}
                  {tourView === 'list' && (
                    <>
                      {/* Header */}
                      <div className="bg-white rounded-2xl border border-[#e5e7eb] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-bold text-[#111827]">Tour Management</h2>
                          <p className="text-sm text-[#6b7280] mt-0.5">{filteredTours.length} tour • {tours.filter(t=>t.status==='published').length} published</p>
                        </div>
                        <button
                          onClick={openCreateTour}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:bg-[#1f2937] transition"
                        >
                          <PlusIcon className="w-4 h-4" /> Tạo Tour
                        </button>
                      </div>

                      {/* Filters */}
                      <div className="bg-white rounded-2xl border border-[#e5e7eb] px-4 py-3 flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[180px]">
                          <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                          <input
                            value={tourSearch}
                            onChange={(e) => setTourSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#d1d5db] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
                            placeholder="Tìm tour..."
                          />
                        </div>
                        <select
                          value={tourFilterLang}
                          onChange={(e) => setTourFilterLang(e.target.value)}
                          className="px-3 py-2 rounded-lg border border-[#d1d5db] text-sm bg-white focus:outline-none"
                        >
                          <option value="all">Ngôn ngữ</option>
                          <option value="VI">VI</option>
                          <option value="EN">EN</option>
                          <option value="KR">KR</option>
                          <option value="CN">CN</option>
                        </select>
                        <select
                          value={tourFilterStatus}
                          onChange={(e) => setTourFilterStatus(e.target.value)}
                          className="px-3 py-2 rounded-lg border border-[#d1d5db] text-sm bg-white focus:outline-none"
                        >
                          <option value="all">Trạng thái</option>
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>

                      {/* Tour Table */}
                      <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
                        {filteredTours.length === 0 ? (
                          <div className="py-20 text-center text-[#9ca3af]">
                            <RouteIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-semibold">Chưa có tour nào</p>
                            <p className="text-sm mt-1">Nhấn "Tạo Tour" để bắt đầu</p>
                          </div>
                        ) : (
                          <table className="w-full text-sm">
                            <thead className="bg-[#f8fafc] border-b border-[#e5e7eb]">
                              <tr>
                                <th className="text-left px-4 py-3 font-semibold text-[#374151]">Tên Tour</th>
                                <th className="text-left px-4 py-3 font-semibold text-[#374151]">Ngôn ngữ</th>
                                <th className="text-left px-4 py-3 font-semibold text-[#374151]">POI</th>
                                <th className="text-left px-4 py-3 font-semibold text-[#374151]">Trạng thái</th>
                                <th className="text-left px-4 py-3 font-semibold text-[#374151]">Phiên bản</th>
                                <th className="text-left px-4 py-3 font-semibold text-[#374151]">Cập nhật</th>
                                <th className="text-left px-4 py-3 font-semibold text-[#374151]">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredTours.map((tour) => (
                                <tr key={tour.id} className="border-t border-[#f3f4f6] hover:bg-[#f9fafb] transition">
                                  <td className="px-4 py-3">
                                    <p className="font-semibold text-[#111827]">{tour.name}</p>
                                    <p className="text-xs text-[#6b7280] mt-0.5 line-clamp-1">{tour.description}</p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#f1f5f9] text-[#374151] text-xs font-semibold border border-[#e2e8f0]">
                                      <GlobeIcon className="w-3 h-3" /> {tour.language}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="inline-flex items-center gap-1 text-[#374151] text-sm font-medium">
                                      <MapPinIcon className="w-4 h-4 text-[#6b7280]" /> {tour.pois.length}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {tour.status === 'published' ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Published
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Draft
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-[#6b7280] text-sm">v{tour.version || 1}</td>
                                  <td className="px-4 py-3 text-[#6b7280] text-sm">{tour.updatedAt}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <button
                                        onClick={() => openEditTour(tour)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#f3f4f6] text-[#374151] text-xs font-semibold hover:bg-[#e5e7eb] transition"
                                      >
                                        <EditIcon className="w-3.5 h-3.5" /> Sửa
                                      </button>
                                      <button
                                        onClick={() => setPublishConfirm(tour)}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                                          tour.status === 'published'
                                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                        }`}
                                      >
                                        <UploadIcon className="w-3.5 h-3.5" />
                                        {tour.status === 'published' ? 'Unpublish' : 'Publish'}
                                      </button>
                                      <button
                                        onClick={() => duplicateTour(tour)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold hover:bg-sky-100 transition"
                                      >
                                        <CopyIcon className="w-3.5 h-3.5" /> Copy
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm(tour)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition"
                                      >
                                        <TrashIcon className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </>
                  )}

                  {/* ── Tour Edit View ── */}
                  {tourView === 'edit' && editingTour && (
                    <>
                      {/* Edit Header */}
                      <div className="bg-white rounded-2xl border border-[#e5e7eb] px-5 py-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => { setTourView('list'); setEditingTour(null); setSelectedVersion(null); }}
                            className="p-2 rounded-lg hover:bg-[#f3f4f6] transition text-[#6b7280]"
                          >
                            <ArrowLeftIcon className="w-5 h-5" />
                          </button>
                          <div>
                            <h2 className="text-xl font-bold text-[#111827]">
                              {editingTour.id ? 'Chỉnh sửa Tour' : 'Tạo Tour mới'}
                            </h2>
                            {editingTour.id && (
                              <p className="text-xs text-[#6b7280] mt-0.5">v{editingTour.version} • {editingTour.updatedAt}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Version selector (existing tours only) */}
                          {editingTour.id && editingTour.versions && editingTour.versions.length > 0 && (
                            <select
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10);
                                if (v === 0) { setSelectedVersion(null); return; }
                                const found = editingTour.versions.find((vr) => vr.v === v);
                                setSelectedVersion(found || null);
                              }}
                              value={selectedVersion ? selectedVersion.v : 0}
                              className="px-3 py-2 rounded-lg border border-[#d1d5db] text-sm bg-white focus:outline-none"
                            >
                              <option value={0}>Phiên bản hiện tại</option>
                              {editingTour.versions.map((vr) => (
                                <option key={vr.v} value={vr.v}>v{vr.v} — {vr.updatedAt}</option>
                              ))}
                            </select>
                          )}
                          <button
                            onClick={saveTour}
                            disabled={!!selectedVersion}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:bg-[#1f2937] transition disabled:opacity-40"
                          >
                            <CheckIcon className="w-4 h-4" /> Lưu phiên bản mới
                          </button>
                        </div>
                      </div>

                      {selectedVersion && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2 text-amber-800 text-sm">
                          <WarningIcon className="w-4 h-4 flex-shrink-0" />
                          Đang xem phiên bản v{selectedVersion.v} (read-only). Chọn "Phiên bản hiện tại" để chỉnh sửa.
                        </div>
                      )}

                      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-5">
                        {/* Left: Tour Form */}
                        <div className="space-y-4">
                          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 space-y-4">
                            <h3 className="font-bold text-[#111827] text-sm uppercase tracking-wide">Thông tin Tour</h3>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-[#374151]">Tên tour <span className="text-rose-500">*</span></label>
                              <input
                                value={editingTour.name}
                                onChange={(e) => setEditingTour((prev) => ({ ...prev, name: e.target.value }))}
                                disabled={!!selectedVersion}
                                className="w-full px-3 py-2 rounded-lg border border-[#d1d5db] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 disabled:bg-[#f9fafb]"
                                placeholder="Nhập tên tour..."
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-[#374151]">Mô tả</label>
                              <textarea
                                value={editingTour.description}
                                onChange={(e) => setEditingTour((prev) => ({ ...prev, description: e.target.value }))}
                                disabled={!!selectedVersion}
                                className="w-full px-3 py-2 rounded-lg border border-[#d1d5db] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#111827]/20 disabled:bg-[#f9fafb]"
                                rows={3}
                                placeholder="Mô tả tour..."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-[#374151]">Ngôn ngữ</label>
                                <select
                                  value={editingTour.language}
                                  onChange={(e) => setEditingTour((prev) => ({ ...prev, language: e.target.value }))}
                                  disabled={!!selectedVersion}
                                  className="w-full px-3 py-2 rounded-lg border border-[#d1d5db] text-sm bg-white focus:outline-none disabled:bg-[#f9fafb]"
                                >
                                  <option value="VI">VI – Tiếng Việt</option>
                                  <option value="EN">EN – English</option>
                                  <option value="KR">KR – 한국어</option>
                                  <option value="CN">CN – 中文</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-[#374151]">Trạng thái</label>
                                <button
                                  disabled={!!selectedVersion}
                                  onClick={() => setEditingTour((prev) => ({ ...prev, status: prev.status === 'published' ? 'draft' : 'published' }))}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-semibold transition disabled:opacity-50 ${
                                    editingTour.status === 'published'
                                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                      : 'border-[#d1d5db] bg-white text-[#6b7280]'
                                  }`}
                                >
                                  <span>{editingTour.status === 'published' ? 'Published' : 'Draft'}</span>
                                  <span className={`w-8 h-5 rounded-full transition-colors relative ${editingTour.status === 'published' ? 'bg-emerald-500' : 'bg-[#d1d5db]'}`}>
                                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editingTour.status === 'published' ? 'left-3.5' : 'left-0.5'}`} />
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Mini Map preview */}
                          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-bold text-[#111827] text-sm uppercase tracking-wide">Preview Lộ trình</h3>
                              <span className="text-xs text-[#6b7280]">
                                {(selectedVersion ? selectedVersion.pois : editingTour.pois).length} điểm
                              </span>
                            </div>
                            <div className="h-52 rounded-xl overflow-hidden border border-[#e5e7eb]">
                              <MapComponent
                                pois={(selectedVersion ? selectedVersion.pois : editingTour.pois)
                                  .map((id) => pois.find((p) => p.id === id)).filter(Boolean)}
                                routeTarget={null}
                                onPOISelect={() => {}}
                                disableAutoLocate
                                showUserMarker={false}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Right: POI Builder */}
                        <div className="space-y-4">
                          {/* Selected POIs list (drag-drop reorder) */}
                          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
                            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                              <div>
                                <h3 className="font-bold text-[#111827] text-sm uppercase tracking-wide">POI trong Tour</h3>
                                <p className="text-xs text-[#6b7280] mt-0.5">
                                  Kéo để sắp xếp thứ tự • {(selectedVersion ? selectedVersion.pois : editingTour.pois).length} địa điểm
                                </p>
                              </div>
                              {!selectedVersion && (
                                <button
                                  onClick={optimizeEditingRoute}
                                  disabled={editingTour.pois.length < 2}
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-40"
                                >
                                  <RouteIcon className="w-4 h-4" /> Tối ưu lộ trình
                                </button>
                              )}
                            </div>

                            {(selectedVersion ? selectedVersion.pois : editingTour.pois).length === 0 ? (
                              <div className="py-12 rounded-xl border-2 border-dashed border-[#e5e7eb] text-center text-[#9ca3af]">
                                <MapPinIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Chưa có POI nào</p>
                                <p className="text-xs mt-1">Thêm POI từ danh sách bên dưới</p>
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                                {(selectedVersion
                                  ? selectedVersion.pois.map((id) => pois.find((p) => p.id === id)).filter(Boolean)
                                  : editingPOIObjects
                                ).map((poi, idx) => (
                                  <div
                                    key={poi.id}
                                    draggable={!selectedVersion}
                                    onDragStart={() => handleDragStart(idx)}
                                    onDragEnter={() => handleDragEnter(idx)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                                      dragOver === idx && dragging !== idx
                                        ? 'border-indigo-400 bg-indigo-50'
                                        : 'border-[#e5e7eb] bg-[#f8fafc]'
                                    }`}
                                  >
                                    {!selectedVersion && (
                                      <span className="cursor-grab text-[#9ca3af] flex-shrink-0">
                                        <GripVerticalIcon className="w-4 h-4" />
                                      </span>
                                    )}
                                    <span className="w-6 h-6 rounded-full bg-[#111827] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                      {idx + 1}
                                    </span>
                                    <img
                                      src={poi.image || '/placeholder.jpg'}
                                      alt={poi.name}
                                      className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-[#e5e7eb]"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-[#111827] text-sm truncate">{poi.name}</p>
                                      <p className="text-xs text-[#6b7280]">{poi.category} • {poi.address}</p>
                                    </div>
                                    {!selectedVersion && (
                                      <div className="flex gap-1 flex-shrink-0">
                                        <button onClick={() => moveTourPOI(idx, -1)} className="w-7 h-7 rounded-lg border border-[#d1d5db] bg-white flex items-center justify-center hover:bg-[#f3f4f6] transition">
                                          <ArrowLeftIcon className="w-3.5 h-3.5 -rotate-90" />
                                        </button>
                                        <button onClick={() => moveTourPOI(idx, 1)} className="w-7 h-7 rounded-lg border border-[#d1d5db] bg-white flex items-center justify-center hover:bg-[#f3f4f6] transition">
                                          <ArrowRightIcon className="w-3.5 h-3.5 rotate-90" />
                                        </button>
                                        <button onClick={() => removePOIFromTour(poi.id)} className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center hover:bg-rose-100 transition">
                                          <CloseIcon className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* POI Picker */}
                          {!selectedVersion && (
                            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
                              <h3 className="font-bold text-[#111827] text-sm uppercase tracking-wide mb-3">Thêm POI vào Tour</h3>
                              <div className="relative mb-3">
                                <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                                <input
                                  value={poiSearch}
                                  onChange={(e) => setPoiSearch(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#d1d5db] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
                                  placeholder="Tìm theo tên hoặc category..."
                                />
                              </div>
                              {availablePOIs.length === 0 ? (
                                <p className="text-sm text-[#9ca3af] py-6 text-center">
                                  {poiSearch ? 'Không tìm thấy POI phù hợp' : 'Tất cả POI đã được thêm vào tour'}
                                </p>
                              ) : (
                                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                                  {availablePOIs.map((poi) => (
                                    <div
                                      key={poi.id}
                                      className="flex items-center gap-3 p-2.5 rounded-xl border border-[#e5e7eb] hover:border-[#111827] hover:bg-[#f9fafb] transition cursor-pointer"
                                      onClick={() => addPOIToTour(poi.id)}
                                    >
                                      <img
                                        src={poi.image || '/placeholder.jpg'}
                                        alt={poi.name}
                                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-[#e5e7eb]"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-[#111827] text-sm truncate">{poi.name}</p>
                                        <p className="text-xs text-[#6b7280]">{poi.category}</p>
                                      </div>
                                      <button className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#111827] text-white flex items-center justify-center hover:bg-[#1f2937] transition">
                                        <PlusIcon className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── Publish Confirm Modal ── */}
                  {publishConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`w-10 h-10 rounded-full flex items-center justify-center ${publishConfirm.status === 'published' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {publishConfirm.status === 'published' ? <WarningIcon className="w-5 h-5" /> : <UploadIcon className="w-5 h-5" />}
                          </span>
                          <div>
                            <p className="font-bold text-[#111827]">
                              {publishConfirm.status === 'published' ? 'Unpublish tour?' : 'Publish tour?'}
                            </p>
                            <p className="text-sm text-[#6b7280]">{publishConfirm.name}</p>
                          </div>
                        </div>
                        <p className="text-sm text-[#374151] mb-5">
                          {publishConfirm.status === 'published'
                            ? 'Tour sẽ bị ẩn khỏi người dùng và chuyển sang trạng thái Draft.'
                            : 'Tour sẽ hiển thị cho tất cả người dùng sau khi publish.'}
                        </p>
                        <div className="flex gap-3">
                          <button onClick={() => togglePublish(publishConfirm)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition ${publishConfirm.status === 'published' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                            {publishConfirm.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <button onClick={() => setPublishConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-[#d1d5db] text-sm font-semibold text-[#374151] hover:bg-[#f3f4f6] transition">
                            Hủy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Delete Confirm Modal ── */}
                  {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                            <TrashIcon className="w-5 h-5" />
                          </span>
                          <div>
                            <p className="font-bold text-[#111827]">Xóa tour?</p>
                            <p className="text-sm text-[#6b7280]">{deleteConfirm.name}</p>
                          </div>
                        </div>
                        <p className="text-sm text-[#374151] mb-5">Hành động này không thể hoàn tác. Tour và tất cả lịch sử phiên bản sẽ bị xóa.</p>
                        <div className="flex gap-3">
                          <button onClick={() => handleDeleteTour(deleteConfirm.id)} className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition">
                            Xóa vĩnh viễn
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-[#d1d5db] text-sm font-semibold text-[#374151] hover:bg-[#f3f4f6] transition">
                            Hủy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeView === 'restaurants' && (
                <section className="bg-white rounded-2xl border border-[#e5e7eb] p-4 overflow-auto">
                  <h3 className="font-bold text-[#111827] mb-3">Merchant Management</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-[#f8fafc] text-[#475569]">
                      <tr>
                        <th className="text-left px-3 py-2">Tên quán</th>
                        <th className="text-left px-3 py-2">Số POI</th>
                        <th className="text-left px-3 py-2">Status</th>
                        <th className="text-left px-3 py-2">Lượt xem</th>
                        <th className="text-left px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurantRows.map((row) => (
                        <tr key={row.id} className="border-t border-[#eef2f7]">
                          <td className="px-3 py-2 font-semibold text-[#111827]">{row.name}</td>
                          <td className="px-3 py-2">{row.poiCount}</td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 border border-emerald-200">Active</span>
                          </td>
                          <td className="px-3 py-2">{row.views}</td>
                          <td className="px-3 py-2 flex gap-2">
                            <button className="px-2 py-1 rounded bg-[#111827] text-white text-xs">View Profile</button>
                            <button
                              className="px-2 py-1 rounded bg-rose-600 text-white text-xs"
                              onClick={() => {
                                if (!window.confirm(`Disable account ${row.name}?`)) return;
                                setModal({
                                  isOpen: true,
                                  type: 'info',
                                  title: 'Account disabled',
                                  message: `Tài khoản ${row.name} đã bị vô hiệu hóa.`,
                                });
                              }}
                            >
                              Disable
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {activeView === 'language' && (
                <section className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
                  <h3 className="font-bold text-[#111827] mb-3">Language & Content Management</h3>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {['VN', 'EN', 'KR', 'CN'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setLangTab(tab)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${
                          langTab === tab ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-[#374151] border-[#d1d5db]'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <textarea className="border border-[#d1d5db] rounded-lg p-2 text-sm h-36" defaultValue={`[${langTab}] POI title / description`} />
                    <textarea className="border border-[#d1d5db] rounded-lg p-2 text-sm h-36" defaultValue={`[${langTab}] Audio transcript`} />
                    <textarea className="border border-[#d1d5db] rounded-lg p-2 text-sm h-36" defaultValue={`[${langTab}] UI text keys`} />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-2 rounded-lg bg-[#111827] text-white text-sm font-semibold">Lưu thay đổi</button>
                    <button className="px-3 py-2 rounded-lg border border-[#d1d5db] text-sm font-semibold">Preview</button>
                  </div>
                </section>
              )}

              {activeView === 'chatbot' && (
                <section className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
                  <h3 className="font-bold text-[#111827] mb-3">Chatbot Data (RAG)</h3>
                  <div className="space-y-2 mb-4">
                    {['poi_chunks_vn.json', 'poi_chunks_en.json', 'restaurant_profiles.json', 'tour_routes.json'].map((doc) => (
                      <div key={doc} className="flex items-center justify-between border border-[#e5e7eb] rounded-lg p-3 bg-[#f9fafb]">
                        <div>
                          <p className="font-semibold text-sm text-[#111827]">{doc}</p>
                          <p className="text-xs text-[#6b7280]">Synced 12 minutes ago</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">ready</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-2 rounded-lg bg-[#111827] text-white text-sm font-semibold"
                      onClick={() => setModal({ isOpen: true, type: 'success', title: 'Re-index done', message: 'Knowledge base đã được re-index thành công.' })}
                    >
                      Re-index
                    </button>
                    <button
                      className="px-3 py-2 rounded-lg border border-[#d1d5db] text-sm font-semibold"
                      onClick={() => setModal({ isOpen: true, type: 'info', title: 'Sync complete', message: 'Dữ liệu POI đã được đồng bộ sang chatbot.' })}
                    >
                      Update data
                    </button>
                  </div>
                </section>
              )}

              {activeView === 'analytics' && (
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
                    <h3 className="font-bold text-[#111827] mb-3">Traffic & Engagement</h3>
                    <div className="space-y-3">
                      {[72, 60, 90, 55, 68, 84].map((value, idx) => (
                        <div key={idx}>
                          <p className="text-xs text-[#6b7280] mb-1">Ngày {idx + 1}</p>
                          <div className="h-3 bg-[#eef2f7] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#334155] to-[#0f172a]" style={{ width: `${value}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
                    <h3 className="font-bold text-[#111827] mb-3">Heatmap khu vực</h3>
                    <div className="grid grid-cols-6 gap-2">
                      {Array.from({ length: 36 }).map((_, idx) => {
                        const intensity = ((idx * 13) % 100) / 100;
                        return (
                          <div
                            key={idx}
                            className="rounded-md h-8"
                            style={{ background: `rgba(17, 24, 39, ${0.12 + intensity * 0.75})` }}
                          ></div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-[#6b7280] mt-3">Vùng đậm thể hiện mật độ tương tác cao hơn.</p>
                  </div>
                </section>
              )}

              {activeView === 'settings' && (
                <section className="bg-white rounded-2xl border border-[#e5e7eb] p-4 space-y-5">
                  <h3 className="font-bold text-[#111827]">System Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Category POI</label>
                      <input className="w-full border border-[#d1d5db] rounded-lg px-3 py-2" defaultValue="Pho, Banh Mi, Com Tam, Cafe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Language Config</label>
                      <input className="w-full border border-[#d1d5db] rounded-lg px-3 py-2" defaultValue="VN, EN, KR, CN" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Payment Config</label>
                      <input className="w-full border border-[#d1d5db] rounded-lg px-3 py-2" defaultValue="VNPAY / Stripe (sandbox)" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">API Keys</label>
                      <input className="w-full border border-[#d1d5db] rounded-lg px-3 py-2" defaultValue="map_key_xxx | ai_key_xxx" />
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-[#111827] text-white text-sm font-semibold">Save settings</button>
                </section>
              )}

              {activeView === 'users' && (
                <section className="space-y-5">
                  <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4 space-y-4">
                    <h3 className="font-bold text-[#111827]">Admin - User Management (Merchant/Owner)</h3>
                    {typeof window !== 'undefined' && localStorage.getItem('userRole') !== 'admin' ? (
                      <p className="text-sm text-rose-600">Chỉ admin mới có quyền tạo/cập nhật tài khoản merchant.</p>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input
                            className="md:col-span-2 w-full border border-[#d1d5db] rounded-lg px-3 py-2"
                            placeholder="owner@example.com"
                            value={ownerForm.email}
                            onChange={(e) => setOwnerForm((prev) => ({ ...prev, email: e.target.value }))}
                          />
                          <select
                            className="w-full border border-[#d1d5db] rounded-lg px-3 py-2"
                            value={ownerForm.language}
                            onChange={(e) => setOwnerForm((prev) => ({ ...prev, language: e.target.value }))}
                          >
                            <option value="vi">vi</option>
                            <option value="en">en</option>
                            <option value="zh">zh</option>
                          </select>
                          <select
                            className="w-full border border-[#d1d5db] rounded-lg px-3 py-2"
                            value={ownerForm.role}
                            onChange={(e) => setOwnerForm((prev) => ({ ...prev, role: e.target.value }))}
                          >
                            <option value="owner">owner</option>
                            <option value="moderator">moderator</option>
                            <option value="visitor">visitor</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="px-4 py-2 rounded-lg bg-[#111827] text-white text-sm font-semibold"
                            onClick={handleCreateOwnerAccount}
                          >
                            Tạo/Cập nhật tài khoản
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg border border-[#d1d5db] text-sm font-semibold"
                            onClick={reloadManagedUsers}
                          >
                            Làm mới danh sách
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-[#111827]">Danh sách merchant/user</h4>
                      {userLoading && <span className="text-xs text-[#6b7280]">Đang tải...</span>}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left border-b border-[#e5e7eb]">
                            <th className="py-2 pr-3">Email</th>
                            <th className="py-2 pr-3">Role</th>
                            <th className="py-2 pr-3">Language</th>
                            <th className="py-2 pr-3">Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {managedUsers.map((user) => (
                            <tr key={user.id} className="border-b border-[#f1f5f9]">
                              <td className="py-2 pr-3">{user.email}</td>
                              <td className="py-2 pr-3">{user.role}</td>
                              <td className="py-2 pr-3">{user.language}</td>
                              <td className="py-2 pr-3">{new Date(user.created_at).toLocaleString()}</td>
                            </tr>
                          ))}
                          {!managedUsers.length && (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-[#6b7280]">Chưa có dữ liệu user.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}
            </main>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </>
  );
}
