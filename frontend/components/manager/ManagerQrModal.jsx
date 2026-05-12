/**
 * ManagerQrModal.jsx
 *
 * Modal hiển thị mã QR dẫn tới POI trên visitor app
 *
 * Props:
 *   poi     {object|null}  — POI object với id, name; null = modal đóng
 *   onClose {() => void}   — callback khi nhấn Đóng/overlay
 */
import { useRef, useEffect } from "react";
import QRCodeStyling from "qr-code-styling";
import { Copy, Download, X } from "lucide-react";
import { buildPoiCanonicalUrl } from "@/utils/poiLinks";

export default function ManagerQrModal({ poi, onClose }) {
  const qrRef = useRef(null);
  const inputRef = useRef(null);
  const poiId = poi?.id;

  const qrValue = buildPoiCanonicalUrl(
    poiId,
    typeof window !== "undefined" ? window.location.origin : ""
  );

  useEffect(() => {
    if (!poi || !qrRef.current) return;

    if (qrRef.current && poi) {
      qrRef.current.innerHTML = "";
      const qrCode = new QRCodeStyling({
        width: 200,
        height: 200,
        data: qrValue,
        dotsOptions: {
          color: "#000",
          type: "square",
        },
        cornersSquareOptions: {
          type: "square",
        },
        backgroundOptions: {
          color: "#fff",
        },
        margin: 0,
      });
      qrCode.append(qrRef.current);
    }
  }, [poi, qrValue]);

  if (!poi) return null;

  function handleCopyUrl() {
    if (inputRef.current) {
      inputRef.current.select();
      document.execCommand("copy");
      // Có thể thêm toast notification nếu cần
    }
  }

  function handleDownload() {
    if (!poiId) return;

    const qrCode = new QRCodeStyling({
      width: 200,
      height: 200,
      data: qrValue,
      dotsOptions: {
        color: "#000",
        type: "square",
      },
      backgroundOptions: {
        color: "#fff",
      },
    });
    qrCode.download({ name: `poi-${poiId}-qr`, extension: "png" });
  }

  return (
    <>
      {/* Overlay */}
      <div className="mgr-qr-overlay" onClick={onClose} />

      {/* Modal card */}
      <div className="mgr-qr-modal">
        {/* Header */}
        <div className="mgr-qr-modal-header">
          <h2 className="mgr-qr-modal-title">Mã QR – {poi.name}</h2>
          <button
            type="button"
            className="mgr-qr-modal-close"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* QR Code */}
        <div className="mgr-qr-container" ref={qrRef} />

        {/* URL display + copy */}
        <div className="mgr-qr-url-section">
          <label className="mgr-label" style={{ marginBottom: 6 }}>
            Đường dẫn
          </label>
          <div className="mgr-qr-url-group">
            <input
              ref={inputRef}
              type="text"
              className="mgr-qr-url-input"
              value={qrValue}
              readOnly
            />
            <button
              type="button"
              className="mgr-qr-url-btn"
              onClick={handleCopyUrl}
              title="Sao chép"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mgr-qr-actions">
          <button
            type="button"
            className="mgr-btn mgr-btn--ghost"
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            type="button"
            className="mgr-btn mgr-btn--primary"
            onClick={handleDownload}
          >
            <Download size={16} />
            Tải xuống PNG
          </button>
        </div>
      </div>
    </>
  );
}
