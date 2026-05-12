/**
 * ManagerPoiEditor.jsx
 *
 * Split-pane editor: left = form, right = map picker (dynamic import).
 *
 * Props:
 *   initialPoi  {object|null}  — existing POI for edit; null for create
 *   onSave      {(poi) => void}
 *   onCancel    {() => void}
 */
import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Camera, X, AlertCircle, QrCode } from "lucide-react";
import ManagerQrModal from "@/components/manager/ManagerQrModal";

// Load Leaflet map only on client (no SSR)
const ManagerPoiMapPicker = dynamic(
  () => import("@/components/manager/ManagerPoiMapPicker"),
  { ssr: false, loading: () => <div className="mgr-map-wrapper mgr-map-placeholder">Đang tải bản đồ…</div> },
);

const DEFAULT_LAT = 10.7769;
const DEFAULT_LNG = 106.7009;

function emptyForm() {
  return {
    name: "",
    description: "",
    opening_from: "08:00",
    opening_to: "22:00",
    price_min_vnd: "",
    price_max_vnd: "",
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    images: [],
    status: "draft",
  };
}

export default function ManagerPoiEditor({ initialPoi, onSave, onCancel }) {
  const [form, setForm] = useState(
    initialPoi
      ? {
          name: initialPoi.name || "",
          description: initialPoi.narration || "",
          opening_from: initialPoi.opening_from || "08:00",
          opening_to: initialPoi.opening_to || "22:00",
          price_min_vnd: initialPoi.price_min_vnd ?? "",
          price_max_vnd: initialPoi.price_max_vnd ?? "",
          lat: initialPoi.lat || DEFAULT_LAT,
          lng: initialPoi.lng || DEFAULT_LNG,
          images: initialPoi.images || [],
          status: initialPoi.status || "draft",
        }
      : emptyForm(),
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [adjustedNotice, setAdjustedNotice] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const fileInputRef = useRef(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setN = (key) => (e) => set(key, e.target.value);

  // Map callback — memoised to avoid re-renders re-creating the picker
  const handleMapChange = useCallback((lat, lng) => {
    setForm((f) => ({ ...f, lat, lng }));
  }, []);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Tên không được để trống";
    if (form.price_min_vnd !== "" && Number(form.price_min_vnd) < 0)
      errs.price_min_vnd = "Giá thấp nhất phải ≥ 0";
    if (
      form.price_min_vnd !== "" &&
      form.price_max_vnd !== "" &&
      Number(form.price_max_vnd) < Number(form.price_min_vnd)
    )
      errs.price_max_vnd = "Giá cao nhất phải ≥ giá thấp nhất";
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        narration: form.description.trim(),
        opening_from: form.opening_from,
        opening_to: form.opening_to,
        price_min_vnd: form.price_min_vnd !== "" ? Number(form.price_min_vnd) : null,
        price_max_vnd: form.price_max_vnd !== "" ? Number(form.price_max_vnd) : null,
        lat: form.lat,
        lng: form.lng,
        images: form.images,
        status: form.status,
      };
      const result = await onSave(payload);
      if (result?.adjusted) setAdjustedNotice(true);
    } finally {
      setSaving(false);
    }
  }

  function handleImageFiles(fileList) {
    Array.from(fileList).forEach((file) => {
      const url = URL.createObjectURL(file);
      setForm((f) => ({ ...f, images: [...f.images, url] }));
    });
  }

  function removeImage(idx) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  return (
    <div className="mgr-editor-shell">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="mgr-editor-header">
        <button type="button" className="mgr-editor-back" onClick={onCancel}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="mgr-editor-title">
          {initialPoi ? "Chỉnh sửa địa điểm" : "Tạo địa điểm mới"}
        </h1>
        {initialPoi?.id && (
          <button
            type="button"
            className="mgr-icon-btn"
            onClick={() => setShowQr(true)}
            title="Lấy mã QR"
            style={{ marginLeft: "auto" }}
          >
            <QrCode size={18} />
          </button>
        )}
      </div>

      {adjustedNotice && (
        <div className="mgr-alert mgr-alert--info" style={{ margin: "0 24px 8px" }}>
          <AlertCircle size={16} />
          Tọa độ hiển thị đã được dịch chuyển ~1 cm để tránh trùng vị trí với POI khác.
        </div>
      )}

      {/* ── Two-pane body ─────────────────────────────────────────────── */}
      <div className="mgr-editor-body">
        {/* Left: form */}
        <div className="mgr-editor-form-panel">
          <div className="mgr-editor-form">

            {/* POI Name */}
            <div className="mgr-form-group">
              <label className="mgr-label">
                Tên địa điểm
                <input
                  className={`mgr-field${errors.name ? " mgr-field--error" : ""}`}
                  value={form.name}
                  onChange={setN("name")}
                  placeholder="Ví dụ: The Teal Terrace"
                />
              </label>
              {errors.name && <p className="mgr-field-err">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="mgr-form-group">
              <label className="mgr-label">
                Description
                <textarea
                  className="mgr-field mgr-textarea"
                  value={form.description}
                  onChange={setN("description")}
                  placeholder="Mô tả chi tiết về địa điểm này..."
                  rows={3}
                />
              </label>
            </div>

            {/* Hours */}
            <div className="mgr-form-row">
              <div className="mgr-form-group" style={{ flex: 1 }}>
                <label className="mgr-label">
                  Mở cửa
                  <input
                    type="time"
                    className="mgr-field"
                    value={form.opening_from}
                    onChange={setN("opening_from")}
                  />
                </label>
              </div>
              <div className="mgr-form-group" style={{ flex: 1 }}>
                <label className="mgr-label">
                  Đóng cửa
                  <input
                    type="time"
                    className="mgr-field"
                    value={form.opening_to}
                    onChange={setN("opening_to")}
                  />
                </label>
              </div>
            </div>

            {/* Price Range */}
            <div className="mgr-form-group">
              <p className="mgr-label">Price Range (VND)</p>
              <div className="mgr-form-row">
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    min={0}
                    className={`mgr-field${errors.price_min_vnd ? " mgr-field--error" : ""}`}
                    placeholder="Min"
                    value={form.price_min_vnd}
                    onChange={setN("price_min_vnd")}
                  />
                  {errors.price_min_vnd && <p className="mgr-field-err">{errors.price_min_vnd}</p>}
                </div>
                <span className="mgr-price-sep">—</span>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    min={0}
                    className={`mgr-field${errors.price_max_vnd ? " mgr-field--error" : ""}`}
                    placeholder="Max"
                    value={form.price_max_vnd}
                    onChange={setN("price_max_vnd")}
                  />
                  {errors.price_max_vnd && <p className="mgr-field-err">{errors.price_max_vnd}</p>}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mgr-form-group">
              <label className="mgr-label">
                Trạng thái
                <select className="mgr-field" value={form.status} onChange={setN("status")}>
                  <option value="draft">Draft (chờ duyệt)</option>
                  <option value="active">Active (đang hoạt động)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>

            {/* Image Upload */}
            <div className="mgr-form-group">
              <p className="mgr-label">Hình ảnh</p>
              <div className="mgr-image-grid">
                {form.images.map((src, i) => (
                  <div key={i} className="mgr-image-cell">
                    <img src={src} alt={`Image ${i + 1}`} />
                    <button
                      type="button"
                      className="mgr-image-remove"
                      onClick={() => removeImage(i)}
                      aria-label="Xoá ảnh"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="mgr-image-add"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={20} />
                  <span>Thêm</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="mgr-hidden"
                onChange={(e) => handleImageFiles(e.target.files)}
              />
            </div>

            {/* Coordinate display */}
            <div className="mgr-form-group">
              <p className="mgr-label" style={{ marginBottom: 4 }}>Tọa độ đã ghim</p>
              <p className="mgr-coord-text">
                {form.lat.toFixed(6)}, {form.lng.toFixed(6)}
              </p>
              <p style={{ fontSize: 12, color: "#4b635c", marginTop: 2 }}>
                Kéo ghim hoặc nhấp vào bản đồ để thay đổi vị trí
              </p>
            </div>

          </div>
        </div>

        {/* Right: map */}
        <div className="mgr-editor-map-panel">
          <ManagerPoiMapPicker
            lat={form.lat}
            lng={form.lng}
            onChange={handleMapChange}
          />
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="mgr-editor-footer">
        <button type="button" className="mgr-btn mgr-btn--ghost" onClick={onCancel}>
          Hủy
        </button>
        <button
          type="button"
          className="mgr-btn mgr-btn--primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Đang lưu…" : "Lưu POI"}
        </button>
      </div>

      <ManagerQrModal poi={showQr ? initialPoi : null} onClose={() => setShowQr(false)} />
    </div>
  );
}
