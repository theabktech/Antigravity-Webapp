import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, QrCode as QrIcon, Check, Copy, AlertCircle, RefreshCw } from 'lucide-react';
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
  const [mode, setMode] = useState<'scan' | 'show'>('scan');
  const [scanError, setScanError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerId = 'qr-reader-target';

  // Pair payload for QR generation
  const pairPayload = JSON.stringify({
    type: 'antigravity_pair',
    url: currentHostUrl || `ws://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:4200`,
    token: currentToken || 'agy_sec_token_99a8',
    name: 'Antigravity Desktop Host'
  });

  useEffect(() => {
    if (!isOpen || mode !== 'scan') {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    let isSubscribed = true;

    const startScanner = async () => {
      try {
        setScanError(null);
        // Clean up previous instance if any
        if (scannerRef.current) {
          await scannerRef.current.stop().catch(() => {});
        }

        const html5QrCode = new Html5Qrcode(readerId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 }
          },
          (decodedText) => {
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
            onClose();
          },
          () => {
            // Frame non-match, ignore
          }
        );
      } catch (err: any) {
        if (isSubscribed) {
          console.warn('Camera scanner error:', err);
          setScanError('Camera permission required or device camera unavailable. Use manual host URL entry.');
        }
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    triggerHaptic('light', hapticsEnabled);
    navigator.clipboard.writeText(pairPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-sm bg-surface border border-surface-border rounded-3xl p-4 shadow-2xl space-y-4">
        {/* Header & Tabs */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex gap-2 bg-surface-card p-1 rounded-xl border border-surface-border">
            <button
              onClick={() => {
                triggerHaptic('light', hapticsEnabled);
                setMode('scan');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === 'scan' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Scan QR
            </button>
            <button
              onClick={() => {
                triggerHaptic('light', hapticsEnabled);
                setMode('show');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === 'show' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <QrIcon className="w-3.5 h-3.5" /> Show QR
            </button>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light', hapticsEnabled);
              onClose();
            }}
            className="p-1.5 rounded-full bg-surface-subtle text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scan Mode View */}
        {mode === 'scan' ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative w-full max-w-[260px] h-[260px] rounded-2xl overflow-hidden bg-black/80 border-2 border-dashed border-indigo-500/50 flex items-center justify-center">
              <div id={readerId} className="w-full h-full" />
              {scanError && (
                <div className="absolute inset-0 p-4 bg-surface/95 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                  <p className="text-xs text-gray-300">{scanError}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 text-center max-w-xs">
              Point phone camera at the pairing QR code on your Antigravity desktop screen.
            </p>
          </div>
        ) : (
          /* Show QR Mode View */
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
                  {currentHostUrl || 'ws://localhost:4200'}
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
