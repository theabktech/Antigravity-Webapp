import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, QrCode as QrIcon, Check, Copy, AlertCircle, RefreshCw, Link2, Wifi } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { triggerHaptic } from '../services/haptics';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScannedData: (url: string, token?: string) => void;
  currentHostUrl: string;
  currentToken?: string;
  hapticsEnabled: boolean;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScannedData,
  currentHostUrl,
  currentToken,
  hapticsEnabled
}) => {
  const [mode, setMode] = useState<'scan' | 'show' | 'manual'>('scan');
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState('ws://192.168.0.201:4200');
  const [manualToken, setManualToken] = useState('agy_sec_token_99a8');
  const [copied, setCopied] = useState(false);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerId = 'qr-reader-target';

  // Pair payload for QR generation
  const pairPayload = JSON.stringify({
    type: 'antigravity_pair',
    url: currentHostUrl || `ws://${typeof window !== 'undefined' ? window.location.hostname : '192.168.0.201'}:4200`,
    token: currentToken || 'agy_sec_token_99a8',
    name: 'Antigravity Desktop Host'
  });

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      scannerRef.current = null;
      setIsScanningActive(false);
    }
  };

  useEffect(() => {
    if (!isOpen || mode !== 'scan') {
      stopScanner();
      return;
    }

    let isSubscribed = true;

    const startScanner = async () => {
      try {
        setScanError(null);
        await stopScanner();

        const html5QrCode = new Html5Qrcode(readerId);
        scannerRef.current = html5QrCode;

        // Try environment camera first, then fallback to any camera
        const config = {
          fps: 15,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0
        };

        const onScanSuccess = (decodedText: string) => {
          if (!isSubscribed) return;
          triggerHaptic('success', hapticsEnabled);
          try {
            const parsed = JSON.parse(decodedText);
            if (parsed.url) {
              onScannedData(parsed.url, parsed.token);
            } else {
              onScannedData(decodedText);
            }
          } catch {
            onScannedData(decodedText);
          }
          stopScanner();
          onClose();
        };

        try {
          await html5QrCode.start({ facingMode: 'environment' }, config, onScanSuccess, () => {});
          if (isSubscribed) setIsScanningActive(true);
        } catch (envErr) {
          console.warn('Environment camera failed, trying default camera:', envErr);
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length > 0) {
            await html5QrCode.start(cameras[0].id, config, onScanSuccess, () => {});
            if (isSubscribed) setIsScanningActive(true);
          } else {
            throw new Error('No camera found on this device');
          }
        }
      } catch (err: any) {
        if (isSubscribed) {
          console.warn('Camera scanner error:', err);
          setScanError('Camera permission required. You can grant camera permission in Android settings, or use Instant Wi-Fi Pair below.');
        }
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 250);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    triggerHaptic('light', hapticsEnabled);
    navigator.clipboard.writeText(pairPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    triggerHaptic('medium', hapticsEnabled);
    onScannedData(manualUrl.trim(), manualToken.trim() || undefined);
    stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-sm bg-surface border border-surface-border rounded-3xl p-4 shadow-2xl space-y-4">
        {/* Header & Tabs */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex gap-1.5 bg-surface-card p-1 rounded-xl border border-surface-border">
            <button
              onClick={() => {
                triggerHaptic('light', hapticsEnabled);
                setMode('scan');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === 'scan' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Scan
            </button>
            <button
              onClick={() => {
                triggerHaptic('light', hapticsEnabled);
                setMode('manual');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === 'manual' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" /> Quick Pair
            </button>
            <button
              onClick={() => {
                triggerHaptic('light', hapticsEnabled);
                setMode('show');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === 'show' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <QrIcon className="w-3.5 h-3.5" /> Show QR
            </button>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light', hapticsEnabled);
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-full bg-surface-subtle text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scan Mode View */}
        {mode === 'scan' && (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative w-full max-w-[260px] h-[260px] rounded-2xl overflow-hidden bg-black/90 border-2 border-dashed border-indigo-500/50 flex items-center justify-center">
              <div id={readerId} className="w-full h-full" />
              {scanError && (
                <div className="absolute inset-0 p-4 bg-surface/95 flex flex-col items-center justify-center text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                  <p className="text-xs text-gray-200">{scanError}</p>
                  <button
                    onClick={() => setMode('manual')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow mt-1"
                  >
                    Use Quick Pair Instead
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 text-center max-w-xs">
              Point phone camera at the QR code on your PC screen.
            </p>
          </div>
        )}

        {/* Manual Quick Pair Mode */}
        {mode === 'manual' && (
          <form onSubmit={handleManualPair} className="space-y-3">
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 mb-1">
                <Wifi className="w-4 h-4" />
                <span>Instant Desktop Wi-Fi Pair</span>
              </div>
              <p className="text-[11px] text-gray-300">
                Connect directly to your desktop bridge server running on port 4200.
              </p>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Host WebSocket URL
                </label>
                <input
                  type="text"
                  required
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="ws://192.168.0.201:4200"
                  className="w-full bg-surface-card border border-surface-border rounded-xl px-3 py-2 text-xs font-mono text-gray-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Security Token
                </label>
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="agy_sec_token_99a8"
                  className="w-full bg-surface-card border border-surface-border rounded-xl px-3 py-2 text-xs font-mono text-gray-100 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-bold text-xs shadow-lg active:scale-98"
            >
              Connect & Pair Now
            </button>
          </form>
        )}

        {/* Show QR Mode View */}
        {mode === 'show' && (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
              <QRCodeSVG
                value={pairPayload}
                size={200}
                bgColor="#ffffff"
                fgColor="#090b10"
                level="Q"
              />
            </div>
            <div className="w-full bg-surface-card border border-surface-border rounded-xl p-2.5 flex items-center justify-between">
              <div className="truncate pr-2">
                <span className="text-[10px] text-gray-400 block">Pairing URL</span>
                <span className="font-mono text-xs text-sky-400 truncate block">
                  {currentHostUrl || 'ws://192.168.0.201:4200'}
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className="flex-shrink-0 p-2 bg-surface-subtle border border-surface-border text-gray-300 rounded-lg active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
