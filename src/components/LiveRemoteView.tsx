import React, { useEffect } from 'react';
import { Sparkles, ArrowLeft, RefreshCw, QrCode, ExternalLink } from 'lucide-react';
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
  useEffect(() => {
    // Automatically navigate the top-level WebView directly so Google Account cookies & OAuth work without iframe 403
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = remoteUrl;
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [remoteUrl]);

  const handleLaunchNow = () => {
    triggerHaptic('medium', hapticsEnabled);
    if (typeof window !== 'undefined') {
      window.location.href = remoteUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090b10] text-gray-100 p-6 space-y-5 select-none">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.6)] animate-pulse">
        <Sparkles className="w-8 h-8 text-white" />
      </div>

      <div className="text-center space-y-2 max-w-xs">
        <h3 className="text-base font-bold text-gray-100">Launching Antigravity Remote</h3>
        <p className="text-xs text-gray-400 font-mono break-all bg-surface-card p-2.5 rounded-2xl border border-surface-border">
          {remoteUrl}
        </p>
      </div>

      <div className="w-full max-w-xs space-y-2.5 pt-2">
        <button
          onClick={handleLaunchNow}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-bold text-xs shadow-lg active:scale-98 flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" /> Open Fullscreen Session
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => {
              triggerHaptic('light', hapticsEnabled);
              onOpenScanner();
            }}
            className="flex-1 py-2 rounded-xl bg-surface-subtle border border-surface-border text-gray-300 text-xs font-semibold active:scale-95 flex items-center justify-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-400" /> Rescan QR
          </button>
          <button
            onClick={() => {
              triggerHaptic('light', hapticsEnabled);
              onExit();
            }}
            className="flex-1 py-2 rounded-xl bg-surface-subtle border border-surface-border text-gray-300 text-xs font-semibold active:scale-95 flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
      </div>
    </div>
  );
};
