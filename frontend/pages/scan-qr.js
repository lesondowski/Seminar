import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/common/Navbar';
import Loading from '../components/common/Loading';
import jsQR from 'jsqr';
import { buildQrRedirect, parseQrPayload } from '../utils/qr/qrUtils';

export default function ScanQrPage() {
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const detectorRef = useRef(null);

  const [status, setStatus] = useState('idle');
  const [scanError, setScanError] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [decodedRoute, setDecodedRoute] = useState(null);
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState('');

  const canUseBarcodeDetector = useMemo(() => {
    return typeof window !== 'undefined' && 'BarcodeDetector' in window;
  }, []);

  const stopStream = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleDecodedText = useCallback((rawText) => {
    const parsed = parseQrPayload(rawText);
    if (!parsed.ok) {
      setScanError(parsed.error);
      return;
    }

    setDecodedRoute(parsed);
    setStatus('success');
    stopStream();
  }, [stopStream]);

  const scanFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;

    if (video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      setScanError('Canvas context is unavailable.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      if (detectorRef.current) {
        const barcodes = await detectorRef.current.detect(canvas);
        if (barcodes.length > 0 && barcodes[0].rawValue) {
          handleDecodedText(barcodes[0].rawValue);
          return;
        }
      } else {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code?.data) {
          handleDecodedText(code.data);
          return;
        }
      }
    } catch (error) {
      setScanError('Cannot decode QR frame.');
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [handleDecodedText]);

  const loadDeviceList = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;

    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = allDevices.filter((device) => device.kind === 'videoinput');
    setDevices(videoDevices);

    if (!deviceId && videoDevices.length > 0) {
      const preferred = videoDevices.find((device) => /back|rear|environment/i.test(device.label));
      setDeviceId(preferred?.deviceId || videoDevices[0].deviceId);
    }
  }, [deviceId]);

  const startScanner = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setScanError('Browser does not support camera access.');
      setStatus('error');
      return;
    }

    stopStream();
    setScanError('');
    setStatus('requesting');

    try {
      const constraints = {
        audio: false,
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: 'environment' } },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      if (canUseBarcodeDetector) {
        const BarcodeDetectorClass = window.BarcodeDetector;
        detectorRef.current = new BarcodeDetectorClass({ formats: ['qr_code'] });
      } else {
        detectorRef.current = null;
      }

      await loadDeviceList();
      setStatus('active');
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch (error) {
      setStatus('error');
      setScanError('Cannot access camera. Please allow permission or use manual input.');
    }
  }, [deviceId, canUseBarcodeDetector, loadDeviceList, scanFrame, stopStream]);

  useEffect(() => {
    startScanner();
    return () => stopStream();
  }, [startScanner, stopStream]);

  const handleManualSubmit = () => {
    const parsed = parseQrPayload(manualInput);
    if (!parsed.ok) {
      setScanError(parsed.error);
      return;
    }

    setDecodedRoute(parsed);
    setStatus('success');
  };

  const handleContinue = (option) => {
    if (!decodedRoute) return;
    const target = buildQrRedirect(decodedRoute, option);
    router.push(target);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FFFFFF] px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-[#212121]">Quet QR</h1>
            <p className="text-sm text-[#757575]">Huong camera vao ma QR de tiep tuc.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
            <div className="rounded-2xl border border-[#DDDDDD] bg-[#111111] p-3 relative overflow-hidden min-h-[360px]">
              {(status === 'requesting' || status === 'idle') && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 text-white text-sm">
                  <Loading text="Dang mo camera..." />
                </div>
              )}

              <video ref={videoRef} muted playsInline className="w-full h-full rounded-xl object-cover min-h-[340px]" />
              <canvas ref={canvasRef} className="hidden" />

              <div className="pointer-events-none absolute inset-8 border-2 border-white/70 rounded-xl" />
              <div className="pointer-events-none absolute left-10 right-10 top-1/2 h-[2px] bg-white/70 animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-[#DDDDDD] p-4 bg-[#F9F9F9]">
                <p className="text-sm font-semibold text-[#212121] mb-2">Camera</p>
                <select
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="w-full rounded-lg border border-[#DDDDDD] px-3 py-2 text-sm"
                >
                  {devices.length === 0 ? (
                    <option value="">Default camera</option>
                  ) : (
                    devices.map((device, index) => (
                      <option key={device.deviceId || index} value={device.deviceId}>
                        {device.label || `Camera ${index + 1}`}
                      </option>
                    ))
                  )}
                </select>
                <button
                  onClick={startScanner}
                  className="mt-2 w-full rounded-lg bg-[#333333] text-white text-sm font-semibold px-3 py-2"
                >
                  Quet lai
                </button>
              </div>

              <div className="rounded-xl border border-[#DDDDDD] p-4">
                <p className="text-sm font-semibold text-[#212121] mb-2">Nhap link QR thu cong</p>
                <textarea
                  rows={4}
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="https://your-domain/qr?poi=2"
                  className="w-full rounded-lg border border-[#DDDDDD] px-3 py-2 text-sm resize-none"
                />
                <button
                  onClick={handleManualSubmit}
                  className="mt-2 w-full rounded-lg border border-[#333333] text-[#333333] text-sm font-semibold px-3 py-2"
                >
                  Xu ly link
                </button>
              </div>

              {scanError && (
                <div className="rounded-xl border border-[#DC3545]/40 bg-[#FFF5F5] p-3 text-sm text-[#DC3545]">
                  {scanError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {status === 'success' && decodedRoute && (
        <div className="fixed inset-0 z-[9999] bg-black/45 p-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#DDDDDD] p-5">
            <h2 className="text-lg font-bold text-[#212121] mb-2">QR hop le</h2>
            <p className="text-sm text-[#757575] mb-4">
              {decodedRoute.type === 'entry'
                ? 'Ban da quet ENTRY QR. Tiep tuc vao app.'
                : `Ban da quet POI QR #${decodedRoute.poiId}. Chon cach mo.`}
            </p>

            {decodedRoute.type === 'entry' ? (
              <button
                onClick={() => handleContinue('detail')}
                className="w-full rounded-lg bg-[#333333] text-white px-4 py-2 font-semibold"
              >
                Vao app
              </button>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleContinue('detail')}
                  className="rounded-lg bg-[#333333] text-white px-4 py-2 font-semibold"
                >
                  Mo chi tiet POI
                </button>
                <button
                  onClick={() => handleContinue('map')}
                  className="rounded-lg border border-[#333333] text-[#333333] px-4 py-2 font-semibold"
                >
                  Mo map va highlight POI
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
