import React from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Terminal,
  FileEdit,
  AlertTriangle,
  Lock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ToolCall, AgentSettings } from '../types/antigravity';
import { triggerHaptic } from '../services/haptics';

interface ApprovalCenterProps {
  approvals: ToolCall[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  settings: AgentSettings;
}

export const ApprovalCenter: React.FC<ApprovalCenterProps> = ({
  approvals,
  onApprove,
  onReject,
  settings
}) => {
  const handleApproveWithConfetti = (id: string) => {
    triggerHaptic('success', settings.hapticsEnabled);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#38bdf8', '#10b981']
      });
    } catch {
      // safe fallback
    }
    onApprove(id);
  };

  const handleReject = (id: string) => {
    triggerHaptic('warning', settings.hapticsEnabled);
    onReject(id);
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 pb-28 bg-background">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-surface to-surface-card border border-amber-500/30 rounded-2xl p-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-100">Mobile Action Center</h2>
              <p className="text-[11px] text-amber-300/80">
                Policy: <span className="font-semibold uppercase">{settings.toolExecutionPolicy}</span>
              </p>
            </div>
          </div>
          <div className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
            {approvals.length} Pending
          </div>
        </div>
      </div>

      {/* Approvals List */}
      {approvals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center mb-3">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-gray-100">All Clean & Approved</h3>
          <p className="text-xs text-gray-400 max-w-xs mt-1">
            There are no pending actions or tool calls awaiting your authorization.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((item) => {
            const isCommand = item.name.includes('command');
            return (
              <div
                key={item.id}
                className="bg-surface border border-surface-border rounded-2xl p-3.5 shadow-xl transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-surface-subtle text-amber-400 border border-surface-border">
                      {isCommand ? <Terminal className="w-4 h-4" /> : <FileEdit className="w-4 h-4 text-sky-400" />}
                    </span>
                    <div>
                      <span className="font-mono text-xs font-bold text-gray-100 block">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-gray-400">{item.summary}</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    <Lock className="w-2.5 h-2.5" /> Requires Auth
                  </span>
                </div>

                {/* Intent & Description */}
                <p className="text-xs text-gray-300 mb-2.5 leading-relaxed bg-surface-subtle p-2 rounded-xl border border-surface-border">
                  {item.action}
                </p>

                {/* Code / Command Preview */}
                {item.params && (
                  <div className="mb-3 rounded-xl overflow-hidden bg-black/60 border border-surface-border font-mono text-xs">
                    <div className="px-2.5 py-1 bg-surface-card border-b border-surface-border text-[10px] text-gray-400 flex items-center justify-between">
                      <span>Payload / Parameters</span>
                      {item.params.Cwd && (
                        <span className="text-gray-500 truncate max-w-[150px]">{item.params.Cwd}</span>
                      )}
                    </div>
                    <pre className="p-2.5 text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap select-text">
                      {item.params.CommandLine || JSON.stringify(item.params, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleReject(item.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface-subtle hover:bg-rose-950/50 border border-surface-border hover:border-rose-500/40 text-rose-400 text-xs font-semibold active:scale-95 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApproveWithConfetti(item.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold active:scale-95 transition-all shadow-md shadow-emerald-950"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve & Run</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
