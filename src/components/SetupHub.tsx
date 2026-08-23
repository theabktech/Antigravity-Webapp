import React, { useState } from 'react';
import { Sparkles, Link2, Monitor, ArrowRight, Laptop, ShieldCheck, Check, History, Trash2, HelpCircle } from 'lucide-react';
import { triggerHaptic } from '../services/haptics';

interface SetupHubProps {
  onConnect: (url: string) => void;
  savedUrl?: string | null;
  onClearSaved: () => void;
  hapticsEnabled: boolean;
}

export const SetupHub: React.FC<SetupHubProps> = ({
  onConnect,
  savedUrl,
  onClearSaved,
  hapticsEnabled
}) => {
  const [inputUrl, setInputUrl] = useState(savedUrl || 'https://antigravity.google.com/r/');
  const [showWalkthrough, setShowWalkthrough] = useState(true);

  const presets = [
    {
      name: 'Google Antigravity Session',
      url: 'https://antigravity.google.com/r/9536b9ab-7791-405c-ae37-34e58371f052-v2',
      desc: 'Active Cloud IDE Remote Lease'
    },
    {
      name: 'Local Wi-Fi Bridge',
      url: 'ws://192.168.0.201:4200',
      desc: 'Direct Desktop WebSocket Bridge'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    triggerHaptic('medium', hapticsEnabled);
    onConnect(inputUrl.trim());
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text && (text.includes('antigravity.google.com') || text.includes('http') || text.includes('ws'))) {
          setInputUrl(text.trim());
          triggerHaptic('light', hapticsEnabled);
        }
      }
    } catch (e) {
      console.warn('Clipboard read failed:', e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090b10] text-gray-100 overflow-y-auto p-4 space-y-4 select-none pb-12">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pt-2 pb-1">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-extrabold text-gray-100 tracking-tight">
            Antigravity Mobile
          </h1>
          <p className="text-xs text-sky-400/90 font-medium">
            Official Remote Companion App
          </p>
        </div>
      </div>

      {/* Connection Card */}
      <form onSubmit={handleSubmit} className="bg-surface border border-surface-border rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-gray-200">Connect to Workspace</span>
          </div>
          <button
            type="button"
            onClick={handlePasteClipboard}
            className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold bg-indigo-950/50 px-2 py-1 rounded-lg border border-indigo-500/30 active:scale-95"
          >
            Paste from Clipboard
          </button>
        </div>

        <div>
          <textarea
            rows={2}
            required
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://antigravity.google.com/r/..."
            className="w-full bg-surface-card border border-surface-border rounded-2xl p-3 text-xs font-mono text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-bold text-xs shadow-lg active:scale-98 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Connect & Remember Instance 🚀
        </button>

        {savedUrl && (
          <div className="flex items-center justify-between pt-2 border-t border-surface-border text-[11px] text-gray-400">
            <span className="truncate max-w-[220px]">Saved: {savedUrl}</span>
            <button
              type="button"
              onClick={onClearSaved}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 active:scale-95"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
        )}
      </form>

      {/* Walkthrough: How to enable remote connection on PC */}
      <div className="bg-surface/80 border border-surface-border rounded-3xl p-4 space-y-3">
        <button
          onClick={() => setShowWalkthrough(!showWalkthrough)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-gray-200">
              How to enable Remote Connection on PC
            </span>
          </div>
          <span className="text-[11px] text-gray-400">{showWalkthrough ? 'Hide' : 'Show'}</span>
        </button>

        {showWalkthrough && (
          <div className="space-y-2.5 pt-1 text-xs text-gray-300 leading-relaxed border-t border-surface-border">
            <div className="flex items-start gap-2.5 bg-surface-card p-2.5 rounded-2xl border border-surface-border/60">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-white">Open Antigravity on your PC</strong>
                <p className="text-[11px] text-gray-400">Launch Google Antigravity desktop IDE.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-surface-card p-2.5 rounded-2xl border border-surface-border/60">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-white">Enable Remote Connection</strong>
                <p className="text-[11px] text-gray-400">
                  Click the <strong>Remote Connection</strong> icon in the top header or run <code className="text-sky-300">agy remote</code>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-surface-card p-2.5 rounded-2xl border border-surface-border/60">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-white">Copy your Session URL</strong>
                <p className="text-[11px] text-gray-400">
                  Copy the generated link (<code className="text-sky-300">https://antigravity.google.com/r/...</code>).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-surface-card p-2.5 rounded-2xl border border-surface-border/60">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                4
              </span>
              <div>
                <strong className="text-white">Paste & Connect on Phone</strong>
                <p className="text-[11px] text-gray-400">
                  Paste the link above. The app will log in and keep you connected!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
          Recent Presets
        </span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              triggerHaptic('light', hapticsEnabled);
              setInputUrl(p.url);
              onConnect(p.url);
            }}
            className="w-full p-3 rounded-2xl bg-surface-card hover:bg-surface-subtle border border-surface-border text-left flex items-center justify-between transition-colors active:scale-98"
          >
            <div className="truncate pr-2">
              <span className="text-xs font-bold text-gray-200 block truncate">{p.name}</span>
              <span className="text-[10px] text-gray-400 font-mono truncate block">{p.url}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-400 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
