import React, { useState } from 'react';
import { X, Link2, Sparkles, Server, Check, ArrowRight, History } from 'lucide-react';
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
  const [sessionUrl, setSessionUrl] = useState('https://antigravity.google.com/r/9536b9ab-7791-405c-ae37-34e58371f052-v2');

  const recentSessions = [
    {
      name: 'Google Antigravity Session',
      url: 'https://antigravity.google.com/r/9536b9ab-7791-405c-ae37-34e58371f052-v2',
      type: 'remote'
    },
    {
      name: 'Local Desktop Bridge',
      url: 'ws://192.168.0.201:4200',
      type: 'bridge'
    }
  ];

  if (!isOpen) return null;

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUrl.trim()) return;
    triggerHaptic('medium', hapticsEnabled);
    onScannedData(sessionUrl.trim());
    onClose();
  };

  const handleSelectRecent = (url: string) => {
    triggerHaptic('light', hapticsEnabled);
    setSessionUrl(url);
    onScannedData(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-sm bg-surface border border-surface-border rounded-3xl p-4 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-100">Antigravity Remote Session</h3>
              <p className="text-[10px] text-gray-400">Connect to your active cloud or local workspace</p>
            </div>
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

        {/* Input Form */}
        <form onSubmit={handleLaunch} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-gray-300 block mb-1">
              Session Link or Bridge URL
            </label>
            <textarea
              rows={3}
              required
              value={sessionUrl}
              onChange={(e) => setSessionUrl(e.target.value)}
              placeholder="https://antigravity.google.com/r/..."
              className="w-full bg-surface-card border border-surface-border rounded-xl p-2.5 text-xs font-mono text-gray-100 focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-bold text-xs shadow-lg active:scale-98 flex items-center justify-center gap-2"
          >
            <Link2 className="w-4 h-4" /> Launch Remote Session 🚀
          </button>
        </form>

        {/* Recent / Quick Connect Presets */}
        <div className="space-y-1.5 pt-1 border-t border-surface-border">
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
            <History className="w-3 h-3" /> Quick Presets
          </div>
          {recentSessions.map((session, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectRecent(session.url)}
              className="w-full p-2 rounded-xl bg-surface-card hover:bg-surface-subtle border border-surface-border text-left flex items-center justify-between transition-colors active:scale-98"
            >
              <div className="truncate pr-2">
                <span className="text-xs font-bold text-gray-200 block truncate">
                  {session.name}
                </span>
                <span className="text-[10px] text-gray-400 font-mono truncate block">
                  {session.url}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
