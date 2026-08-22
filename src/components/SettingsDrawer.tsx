import React from 'react';
import {
  X,
  Sparkles,
  Shield,
  Vibrate,
  Globe,
  Smartphone,
  Trash2,
  Lock,
  Moon,
  Info
} from 'lucide-react';
import { AgentSettings, ModelType, ToolExecutionPolicy } from '../types/antigravity';
import { triggerHaptic } from '../services/haptics';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AgentSettings;
  onUpdateSettings: (updates: Partial<AgentSettings>) => void;
  onOpenInstallModal: () => void;
  onClearChat: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenInstallModal,
  onClearChat
}) => {
  if (!isOpen) return null;

  const models: { id: ModelType; label: string; desc: string }[] = [
    { id: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash', desc: 'Fast, high token throughput' },
    { id: 'gemini-3.7-pro', label: 'Gemini 3.7 Pro', desc: 'Complex reasoning & architecture' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: 'Lightweight & responsive' },
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', desc: 'Deep planning & analysis' }
  ];

  const policies: { id: ToolExecutionPolicy; label: string; desc: string }[] = [
    { id: 'request-review', label: 'Request Review', desc: 'Prompts mobile approval before running tools' },
    { id: 'strict', label: 'Strict Security', desc: 'All terminal commands require confirmation' },
    { id: 'always-proceed', label: 'Always Proceed', desc: 'Autonomous execution without review' },
    { id: 'proceed-in-sandbox', label: 'Sandbox Mode', desc: 'Isolate tools inside containerized sandbox' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-3">
      <div className="w-full max-w-md bg-surface border border-surface-border rounded-3xl p-4 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-100">Antigravity Settings</h3>
              <p className="text-[11px] text-gray-400">Model, security & mobile preferences</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light', settings.hapticsEnabled);
              onClose();
            }}
            className="p-1.5 rounded-full bg-surface-subtle text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
            Gemini Model Selection
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {models.map((m) => {
              const isSelected = settings.model === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    triggerHaptic('selection', settings.hapticsEnabled);
                    onUpdateSettings({ model: m.id });
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-indigo-950/50 border-brand-500 ring-1 ring-brand-500'
                      : 'bg-surface-card border-surface-border hover:bg-surface-subtle'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-gray-100 block">{m.label}</span>
                    <span className="text-[10px] text-gray-400">{m.desc}</span>
                  </div>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(56,189,248,0.8)]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tool Execution Policy */}
        <div className="space-y-2 pt-2 border-t border-surface-border">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
            Tool Execution & Permissions
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {policies.map((p) => {
              const isSelected = settings.toolExecutionPolicy === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    triggerHaptic('selection', settings.hapticsEnabled);
                    onUpdateSettings({ toolExecutionPolicy: p.id });
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-500'
                      : 'bg-surface-card border-surface-border hover:bg-surface-subtle'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-gray-100 block">{p.label}</span>
                    <span className="text-[10px] text-gray-400">{p.desc}</span>
                  </div>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Preferences Toggles */}
        <div className="space-y-2.5 pt-2 border-t border-surface-border">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
            Device Experience
          </label>

          <div className="flex items-center justify-between p-2.5 bg-surface-card border border-surface-border rounded-xl">
            <div className="flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-xs font-semibold text-gray-100 block">Haptic Feedback</span>
                <span className="text-[10px] text-gray-400">Vibrate on taps and approvals</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.hapticsEnabled}
              onChange={(e) => {
                triggerHaptic('selection', true);
                onUpdateSettings({ hapticsEnabled: e.target.checked });
              }}
              className="w-4 h-4 accent-brand-500 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 bg-surface-card border border-surface-border rounded-xl">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-gray-100 block">Terminal Sandbox</span>
                <span className="text-[10px] text-gray-400">Run shell inside isolated sandbox</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.terminalSandbox}
              onChange={(e) => {
                triggerHaptic('selection', settings.hapticsEnabled);
                onUpdateSettings({ terminalSandbox: e.target.checked });
              }}
              className="w-4 h-4 accent-brand-500 rounded"
            />
          </div>
        </div>

        {/* PWA & System Actions */}
        <div className="pt-2 border-t border-surface-border space-y-2">
          <button
            onClick={() => {
              triggerHaptic('light', settings.hapticsEnabled);
              onOpenInstallModal();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-sky-300 text-xs font-semibold active:scale-98"
          >
            <Smartphone className="w-4 h-4" /> Install as Phone PWA
          </button>

          <button
            onClick={() => {
              triggerHaptic('warning', settings.hapticsEnabled);
              onClearChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-surface-subtle hover:bg-rose-950/30 border border-surface-border hover:border-rose-500/30 text-rose-400 text-xs font-medium active:scale-98"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Chat History
          </button>
        </div>
      </div>
    </div>
  );
};
