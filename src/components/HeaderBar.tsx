import React from 'react';
import { Wifi, WifiOff, QrCode, Settings, Sparkles } from 'lucide-react';
import { ConnectionStatus, HostProfile, ModelType } from '../types/antigravity';
import { triggerHaptic } from '../services/haptics';

interface HeaderBarProps {
  status: ConnectionStatus;
  latency: number;
  activeProfile: HostProfile;
  model: ModelType;
  onOpenConnect: () => void;
  onOpenQR: () => void;
  onOpenSettings: () => void;
  hapticsEnabled: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  status,
  latency,
  activeProfile,
  model,
  onOpenConnect,
  onOpenQR,
  onOpenSettings,
  hapticsEnabled
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-500 text-emerald-400 border-emerald-500/30';
      case 'connecting':
        return 'bg-amber-500 text-amber-400 border-amber-500/30 animate-pulse';
      case 'error':
      case 'disconnected':
      default:
        return 'bg-rose-500 text-rose-400 border-rose-500/30';
    }
  };

  const formatModelName = (m: string) => {
    if (m.includes('3.7-flash')) return '3.7 Flash';
    if (m.includes('3.7-pro')) return '3.7 Pro';
    if (m.includes('2.5-flash')) return '2.5 Flash';
    return m.replace('gemini-', '');
  };

  return (
    <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur-md border-b border-surface-border pt-[env(safe-area-inset-top,8px)] px-3 pb-2.5">
      <div className="flex items-center justify-between">
        {/* Left: Brand & Connection Status Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic('light', hapticsEnabled);
              onOpenConnect();
            }}
            className="flex items-center gap-2 bg-surface-subtle border border-surface-border rounded-xl px-2.5 py-1.5 active:scale-95 transition-all"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                <span className="text-white text-xs font-black">A</span>
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-surface ${
                  status === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                }`}
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-surface ${
                  status === 'connected' ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
            </div>
            <div className="text-left flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-gray-100 leading-tight">
                  {activeProfile.name.split(' ')[0]}
                </span>
                {status === 'connected' ? (
                  <Wifi className="w-3 h-3 text-emerald-400" />
                ) : (
                  <WifiOff className="w-3 h-3 text-rose-400" />
                )}
              </div>
              <span className="text-[10px] text-gray-400 leading-none">
                {status === 'connected' ? `${latency}ms` : status}
              </span>
            </div>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick Model Selector Chip */}
          <button
            onClick={() => {
              triggerHaptic('light', hapticsEnabled);
              onOpenSettings();
            }}
            className="flex items-center gap-1 bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 rounded-lg px-2 py-1 text-xs font-medium active:scale-95 transition-all"
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>{formatModelName(model)}</span>
          </button>

          {/* QR Code Scanner */}
          <button
            onClick={() => {
              triggerHaptic('light', hapticsEnabled);
              onOpenQR();
            }}
            aria-label="Scan QR Pair Code"
            className="p-1.5 rounded-lg bg-surface-subtle border border-surface-border text-gray-300 hover:text-white active:scale-95 transition-all"
          >
            <QrCode className="w-4 h-4 text-brand-accent" />
          </button>

          {/* Settings Drawer */}
          <button
            onClick={() => {
              triggerHaptic('light', hapticsEnabled);
              onOpenSettings();
            }}
            aria-label="Settings"
            className="p-1.5 rounded-lg bg-surface-subtle border border-surface-border text-gray-300 hover:text-white active:scale-95 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
