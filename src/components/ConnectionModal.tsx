import React, { useState } from 'react';
import { X, Server, Plus, Check, Wifi, Trash2, Shield, QrCode, Sparkles } from 'lucide-react';
import { HostProfile, ConnectionStatus } from '../types/antigravity';
import { triggerHaptic } from '../services/haptics';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: HostProfile[];
  activeProfile: HostProfile;
  status: ConnectionStatus;
  onSelectProfile: (id: string) => void;
  onAddProfile: (profile: Omit<HostProfile, 'id'>) => void;
  onRemoveProfile: (id: string) => void;
  onOpenQR: () => void;
  hapticsEnabled: boolean;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfile,
  status,
  onSelectProfile,
  onAddProfile,
  onRemoveProfile,
  onOpenQR,
  hapticsEnabled
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    triggerHaptic('medium', hapticsEnabled);
    onAddProfile({
      name: name.trim(),
      url: url.trim(),
      token: token.trim() || undefined,
      lastConnected: 'Ready'
    });
    setName('');
    setUrl('');
    setToken('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-3">
      <div className="w-full max-w-md bg-surface border border-surface-border rounded-3xl p-4 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-sky-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-100">Antigravity Host Connections</h3>
              <p className="text-[11px] text-gray-400">Remote bridge & mobile pairing</p>
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

        {/* Quick QR Pair Button */}
        <button
          onClick={() => {
            triggerHaptic('medium', hapticsEnabled);
            onOpenQR();
          }}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-surface-card to-surface border border-indigo-500/30 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-gray-100 block">Scan Desktop QR Code</span>
              <span className="text-[10px] text-sky-300/80">Pair camera directly with Antigravity IDE</span>
            </div>
          </div>
          <span className="text-xs text-sky-400 font-semibold">Scan &gt;</span>
        </button>

        {/* Profile List */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
            Available Hosts
          </div>
          {profiles.map((p) => {
            const isCurrent = p.id === activeProfile.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  triggerHaptic('light', hapticsEnabled);
                  onSelectProfile(p.id);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-brand-500 ring-1 ring-brand-500'
                    : 'bg-surface-card border-surface-border hover:bg-surface-subtle'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      isCurrent && status === 'connected' ? 'bg-emerald-400' : 'bg-gray-500'
                    }`}
                  />
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-100 truncate">{p.name}</span>
                      {isCurrent && (
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono block truncate">{p.url}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isCurrent ? (
                    <Check className="w-4 h-4 text-brand-accent" />
                  ) : (
                    p.id !== 'local-sim' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerHaptic('warning', hapticsEnabled);
                          onRemoveProfile(p.id);
                        }}
                        className="p-1 rounded-lg text-gray-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Host Form */}
        {showAddForm ? (
          <form onSubmit={handleAdd} className="bg-surface-card border border-surface-border rounded-2xl p-3 space-y-2.5">
            <div className="text-xs font-bold text-gray-200">Add New Remote Host</div>
            <input
              type="text"
              required
              placeholder="Host Name (e.g. Work PC, Tailscale Node)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-subtle border border-surface-border rounded-xl px-3 py-2 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-brand-500"
            />
            <input
              type="text"
              required
              placeholder="URL (e.g. ws://192.168.1.50:4200 or wss://tunnel.xyz)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-surface-subtle border border-surface-border rounded-xl px-3 py-2 text-xs font-mono text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-brand-500"
            />
            <input
              type="text"
              placeholder="Security Token (optional)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-surface-subtle border border-surface-border rounded-xl px-3 py-2 text-xs font-mono text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-brand-500"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-1.5 rounded-xl bg-surface-subtle text-gray-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
              >
                Save & Connect
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => {
              triggerHaptic('light', hapticsEnabled);
              setShowAddForm(true);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-surface-subtle border border-dashed border-surface-border text-gray-300 hover:text-white text-xs font-medium active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Host</span>
          </button>
        )}
      </div>
    </div>
  );
};
