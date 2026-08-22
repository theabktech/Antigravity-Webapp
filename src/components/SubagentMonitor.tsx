import React from 'react';
import { Cpu, Play, Square, Clock, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Subagent, ScheduledTask, AgentSettings } from '../types/antigravity';
import { triggerHaptic } from '../services/haptics';

interface SubagentMonitorProps {
  subagents: Subagent[];
  scheduledTasks: ScheduledTask[];
  onKillSubagent: (id: string) => void;
  onCancelTask: (id: string) => void;
  onSpawnSubagent: (typeName: string, role: string) => void;
  settings: AgentSettings;
}

export const SubagentMonitor: React.FC<SubagentMonitorProps> = ({
  subagents,
  scheduledTasks,
  onKillSubagent,
  onCancelTask,
  onSpawnSubagent,
  settings
}) => {
  const handleKill = (id: string) => {
    triggerHaptic('warning', settings.hapticsEnabled);
    onKillSubagent(id);
  };

  const handleCancelTask = (id: string) => {
    triggerHaptic('light', settings.hapticsEnabled);
    onCancelTask(id);
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 pb-28 bg-background">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/50 via-surface to-surface-card border border-indigo-500/30 rounded-2xl p-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-100">Subagent Mesh & Tasks</h2>
              <p className="text-[11px] text-indigo-300/80">
                Parallel Autonomous Agent Execution
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('medium', settings.hapticsEnabled);
              onSpawnSubagent('research', 'Codebase Researcher');
            }}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-md active:scale-95 transition-all"
          >
            <Play className="w-3 h-3" /> Spawn
          </button>
        </div>
      </div>

      {/* Active Subagents Section */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Subagents ({subagents.length})
          </span>
          <span className="text-[11px] text-gray-400">
            {subagents.filter((s) => s.state === 'running').length} active
          </span>
        </div>

        <div className="space-y-2.5">
          {subagents.map((agent) => {
            const isRunning = agent.state === 'running';
            return (
              <div
                key={agent.id}
                className="bg-surface border border-surface-border rounded-2xl p-3 shadow-md"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isRunning ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'
                      }`}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-gray-100">{agent.name}</h4>
                      <span className="text-[10px] text-gray-400">{agent.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-surface-subtle text-sky-400 rounded-md border border-surface-border">
                      {agent.model}
                    </span>
                    {isRunning && (
                      <button
                        onClick={() => handleKill(agent.id)}
                        className="p-1 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900 border border-rose-500/30 active:scale-90"
                      >
                        <Square className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {agent.stateDetail && (
                  <p className="text-[11px] text-gray-300 bg-surface-subtle p-2 rounded-xl border border-surface-border/80 font-mono my-2">
                    {agent.stateDetail}
                  </p>
                )}

                {/* Progress bar */}
                {agent.progressPercent !== undefined && (
                  <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden mt-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full transition-all duration-300"
                      style={{ width: `${agent.progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Tasks & Cron Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Scheduled Tasks & Cron ({scheduledTasks.length})
          </span>
          <Clock className="w-3.5 h-3.5 text-gray-400" />
        </div>

        <div className="space-y-2">
          {scheduledTasks.map((task) => (
            <div
              key={task.id}
              className="bg-surface border border-surface-border rounded-xl p-2.5 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="p-1.5 rounded-lg bg-indigo-950/50 text-indigo-400 border border-indigo-500/20">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-medium text-gray-200 block truncate">
                    {task.prompt}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {task.type === 'cron' ? `Cron: ${task.cronExpression}` : `Timer: ${task.remainingSeconds}s remaining`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleCancelTask(task.id)}
                className="text-[10px] text-gray-400 hover:text-rose-400 px-2 py-1 bg-surface-subtle rounded-md border border-surface-border active:scale-95"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
