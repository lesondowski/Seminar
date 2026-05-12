import { useCallback, useEffect, useRef, useState } from "react";
import { X, Images, Camera } from "lucide-react";
import jsQR from "jsqr";

const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function QRAccessRouter({ onSubmit, loading }) {
  const [qrCode, setQrCode] = useState("SITE-ENTRY-ABC123");
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [manualMode, setManualMode] = useState(IS_MOCK);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const scanLoopRef = useRef(null);
  const scanLockRef = useRef(false);
  const scanningActiveRef = useRef(false);

  const stopCamera = useCallback(() => {
    scanningActiveRef.current = false;

    if (scanLoopRef.current) {
      window.cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
  }, []);

  const handleDecoded = useCallback((rawValue) => {
    if (!rawValue || scanLockRef.current) return;
    scanLockRef.current = true;
    stopCamera();
    onSubmit(rawValue.trim());
  }, [onSubmit, stopCamera]);

  const scanFrame = useCallback(async () => {
    if (!scanningActiveRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detector = detectorRef.current;

    if (!video || !canvas || video.readyState < 2 || loading || scanLockRef.current) {
      if (scanningActiveRef.current) {
        scanLoopRef.current = window.requestAnimationFrame(scanFrame);
      }
      return;
    }

    try {
      if (detector) {
        const barcodes = await detector.detect(video);
        const qr = barcodes?.find((item) => item.rawValue);
        if (qr?.rawValue) {
          handleDecoded(qr.rawValue);
          return;
        }
      } else {
        const width = video.videoWidth;
        const height = video.videoHeight;

        if (width > 0 && height > 0) {
          const context = canvas.getContext("2d", { willReadFrequently: true });
          if (context) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            const imageData = context.getImageData(0, 0, width, height);
            const result = jsQR(imageData.data, width, height, {
              inversionAttempts: "dontInvert",
            });

            if (result?.data) {
              handleDecoded(result.data);
              return;
            }
          }
        }
      }
    } catch {
      // Ignore transient detector errors and keep scanning.
    }

    if (scanningActiveRef.current) {
      scanLoopRef.current = window.requestAnimationFrame(scanFrame);
    }
  }, [handleDecoded, loading]);

  const startCamera = useCallback(async () => {
    if (IS_MOCK || manualMode || typeof window === "undefined") {
      return;
    }

    setCameraError("");
    setCameraReady(false);
    scanLockRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      if ("BarcodeDetector" in window) {
        detectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
      } else {
        detectorRef.current = null;
      }

      scanningActiveRef.current = true;
      setCameraReady(true);
      scanLoopRef.current = window.requestAnimationFrame(scanFrame);
    } catch (err) {
      const denied = err?.name === "NotAllowedError" || err?.name === "SecurityError";
      setCameraError(
        denied
          ? "Bạn đã từ chối quyền camera. Hãy cấp quyền camera và thử lại."
          : "Không thể mở camera. Vui lòng thử lại hoặc nhập mã thủ công."
      );
      setManualMode(true);
      stopCamera();
    }
  }, [manualMode, scanFrame, stopCamera]);

  useEffect(() => {
    void startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (!loading) {
      scanLockRef.current = false;
    }
  }, [loading]);

  return (
    <div className="qr-scanner-shell">
      <div className="qr-camera-bg">
        {!IS_MOCK && !manualMode && (
          <video
            ref={videoRef}
            className="qr-camera-video"
            autoPlay
            muted
            playsInline
            aria-label="Camera preview"
          />
        )}
        {!IS_MOCK && <canvas ref={canvasRef} className="qr-hidden-canvas" aria-hidden="true" />}
      </div>

      {/* Top controls bar */}
      <div className="qr-controls-top">
        <button
          className="qr-ctrl-btn"
          aria-label="Đóng"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.history.back();
            }
          }}
          type="button"
        >
          <X size={20} />
        </button>
        <span className="qr-title-label">SCANNER</span>
        <span className="h-10 w-10" aria-hidden="true" />
      </div>

      {/* Scan frame area */}
      <div className="qr-frame-area">
        <div className="qr-frame">
          <span className="qr-corner qr-corner--tl" />
          <span className="qr-corner qr-corner--tr" />
          <span className="qr-corner qr-corner--bl" />
          <span className="qr-corner qr-corner--br" />
          <div className="qr-scan-line" />
        </div>

        <p className="qr-hint-text">Căn chỉnh mã QR vào khung để quét</p>

        {!IS_MOCK && !manualMode && !cameraError && (
          <p className="qr-camera-state">{cameraReady ? "Đang quét..." : "Đang mở camera..."}</p>
        )}

        {!IS_MOCK && cameraError && (
          <p className="qr-camera-error">{cameraError}</p>
        )}

        {/* Dev/demo: manual QR code input */}
        {(IS_MOCK || manualMode) && (
          <div className="qr-mock-section">
            <p className="qr-mock-label">Nhập mã QR thủ công</p>
            <input
              className="qr-mock-input"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="SITE-ENTRY-ABC123"
              aria-label="Mã QR"
            />
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="qr-controls-bottom">
        {(IS_MOCK || manualMode) ? (
          <button
            className="qr-gallery-btn"
            onClick={() => onSubmit(qrCode)}
            disabled={loading || !qrCode.trim()}
            type="button"
          >
            <Camera size={20} />
            {loading ? "Đang kiểm tra..." : "Quét QR"}
          </button>
        ) : (
          <div className="qr-live-actions">
            <button
              className="qr-gallery-btn"
              type="button"
              onClick={() => {
                setManualMode(true);
                stopCamera();
              }}
              disabled={loading}
            >
              <Images size={20} />
              Nhập mã thủ công
            </button>
          </div>
        )}

        {!IS_MOCK && manualMode && (
          <button
            className="qr-retry-btn"
            type="button"
            onClick={() => {
              setManualMode(false);
              setCameraError("");
            }}
            disabled={loading}
          >
            Bật lại camera
          </button>
        )}

        <p className="qr-secondary-hint">
          <Camera size={13} />
          Tìm mã QR trên địa điểm POI
        </p>
      </div>
    </div>
  );
}
