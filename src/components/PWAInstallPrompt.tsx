import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle, Smartphone } from 'lucide-react';
import { triggerHaptic } from '../services/haptics';

interface PWAInstallPromptProps {
  isOpen?: boolean;
  onClose?: () => void;
  hapticsEnabled: boolean;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  isOpen,
  onClose,
  hapticsEnabled
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if running standalone (already installed)
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    // Check iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture Chrome/Android install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    triggerHaptic('medium', hapticsEnabled);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  const isModalOpen = isOpen !== undefined ? isOpen : showModal;
  const handleCloseModal = () => {
    if (onClose) {
      onClose();
    } else {
      setShowModal(false);
    }
  };

  // If already standalone and modal is not explicitly triggered, show nothing
  if (isStandalone && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Install Pill (if not installed & not dismissed) */}
      {!isStandalone && !bannerDismissed && isOpen === undefined && (
        <div className="fixed bottom-16 left-3 right-3 z-30 animate-bounce">
          <div className="bg-gradient-to-r from-indigo-900/90 via-surface-card to-surface-subtle border border-indigo-500/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-100">Install Antigravity App</h4>
                <p className="text-[10px] text-indigo-300/90">Use without browser URL bar</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleInstallClick}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md active:scale-95 transition-all"
              >
                Install
              </button>
              <button
                onClick={() => setBannerDismissed(true)}
                className="p-1.5 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step-by-Step Install Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-surface border border-surface-border rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-100">Install as Phone App</h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-full bg-surface-subtle text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isStandalone ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-gray-100">App Already Installed!</h4>
                <p className="text-xs text-gray-400">
                  You are running in standalone mode with maximum performance and no browser UI.
                </p>
              </div>
            ) : isIOS ? (
              /* iOS Instructions */
              <div className="space-y-3">
                <p className="text-xs text-gray-300 leading-relaxed">
                  To install Antigravity on iPhone or iPad without the Safari browser address bar:
                </p>
                <div className="space-y-2.5 text-xs text-gray-200">
                  <div className="flex items-center gap-3 bg-surface-card p-2.5 rounded-xl border border-surface-border">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                      1
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>Tap the </span>
                      <Share className="w-4 h-4 text-sky-400 inline" />
                      <strong className="text-white">Share</strong> button in Safari.
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-surface-card p-2.5 rounded-xl border border-surface-border">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                      2
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>Scroll down and tap </span>
                      <strong className="text-white">Add to Home Screen</strong>
                      <PlusSquare className="w-4 h-4 text-sky-400 inline" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-surface-card p-2.5 rounded-xl border border-surface-border">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                      3
                    </span>
                    <span>
                      Tap <strong className="text-white">Add</strong> in the top-right corner.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Android / Desktop Instructions */
              <div className="space-y-3">
                <p className="text-xs text-gray-300 leading-relaxed">
                  Install Antigravity directly onto your home screen for quick launch and zero browser distractions.
                </p>
                {deferredPrompt ? (
                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-bold text-xs shadow-lg active:scale-98"
                  >
                    <Download className="w-4 h-4" /> Install Now
                  </button>
                ) : (
                  <div className="space-y-2 text-xs text-gray-300 bg-surface-card p-3 rounded-xl border border-surface-border">
                    <p>1. Open browser menu (three dots <strong>⋮</strong>)</p>
                    <p>2. Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></p>
                    <p>3. Confirm install prompt</p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleCloseModal}
              className="w-full py-2 bg-surface-subtle border border-surface-border rounded-xl text-gray-300 text-xs font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
