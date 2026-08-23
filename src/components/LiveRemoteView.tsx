import React, { useState, useEffect } from 'react';
import { RefreshCw, QrCode, ArrowLeft, ExternalLink, Shield, Wifi, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../services/haptics';

interface LiveRemoteViewProps {
  remoteUrl: string;
  onExit: () => void;
  onOpenScanner: () => void;
  hapticsEnabled: boolean;
}

export const LiveRemoteView: React.FC<LiveRemoteViewProps> = ({
  remoteUrl,
  onExit,
  onOpenScanner,
  hapticsEnabled
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    setIsLoading(true);
  }, [remoteUrl, iframeKey]);

  const handleRefresh = () => {
    triggerHaptic('light', hapticsEnabled);
    setIframeKey((prev) => prev + 1);
  };

  const handleDirectLaunch = () => {
    triggerHaptic('medium', hapticsEnabled);
    if (typeof window !== 'undefined') {
      window.location.href = remoteUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#090b10] text-gray-100 overflow-hidden select-none">
      {/* Floating Compact Control Bar */}
      <div
        className={`transition-all duration-300 z-50 ${
          isMinimized
            ? 'absolute top-3 right-3'
            : 'sticky top-0 bg-surface/90 backdrop-blur-md border-b border-surface-border pt-[env(safe-area-inset-top,8px)] px-3 pb-2'
        }`}
      >
        {isMinimized ? (
          <button
            onClick={() => {
              triggerHaptic('light', hapticsEnabled);
              setIsMinimized(false);
            }}
            className="w-10 h-10 rounded-full bg-indigo-600/90 border border-indigo-400/40 text-white flex items-center justify-center shadow-2xl backdrop-blur-md active:scale-95 animate-pulse"
          >
            <Sparkles className="w-5 h-5 text-sky-300" />
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <button
                onClick={() => {
                  triggerHaptic('light', hapticsEnabled);
                  onExit();
                }}
                className="p-1.5 rounded-xl bg-surface-subtle border border-surface-border text-gray-300 hover:text-white active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-gray-100 truncate">
                    Antigravity Remote Live
                  </span>
                </div>
                <span className="text-[10px] text-sky-400/80 font-mono truncate max-w-[180px]">
                  {remoteUrl}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-lg bg-surface-subtle border border-surface-border text-gray-300 hover:text-white active:scale-95"
                title="Reload Session"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
              </button>

              <button
                onClick={() => {
                  triggerHaptic('light', hapticsEnabled);
                  onOpenScanner();
                }}
                className="p-1.5 rounded-lg bg-surface-subtle border border-surface-border text-sky-400 hover:text-white active:scale-95"
                title="Scan Different QR Code"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  triggerHaptic('light', hapticsEnabled);
                  setIsMinimized(true);
                }}
                className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:text-white active:scale-95"
                title="Fullscreen App View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#090b10] flex flex-col items-center justify-center z-30 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shadow-2xl">
            <RefreshCw className="w-6 h-6 text-sky-400 animate-spin" />
          </div>
          <div className="text-center">
            <h4 className="text-sm font-bold text-gray-100">Connecting to Antigravity Remote</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Establishing secure session with your desktop IDE...
            </p>
          </div>
          <button
            onClick={handleDirectLaunch}
            className="text-xs text-sky-400 underline pt-2"
          >
            Having trouble? Tap to open directly
          </button>
        </div>
      )}

      {/* Embedded Fullscreen Webview Container */}
      <iframe
        key={iframeKey}
        src={remoteUrl}
        onLoad={() => setIsLoading(false)}
        className="w-full flex-1 border-none bg-[#090b10]"
        allow="camera *; microphone *; clipboard-read *; clipboard-write *; autoplay *; display-capture *"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-top-navigation-by-user-activation"
      />
    </div>
  );
};
