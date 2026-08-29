import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Trash2, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-react';
import { TerminalLine, AgentSettings } from '../types/antigravity';
import { triggerHaptic } from '../services/haptics';

interface TerminalConsoleProps {
  lines: TerminalLine[];
  onSendCommand: (cmd: string) => void;
  settings: AgentSettings;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  lines,
  onSendCommand,
  settings
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [history, setHistory] = useState<string[]>(['git status', 'npm run build']);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!commandInput.trim()) return;

    triggerHaptic('light', settings.hapticsEnabled);
    const cmd = commandInput.trim();
    onSendCommand(cmd);
    setHistory((prev) => [...prev.filter((c) => c !== cmd), cmd]);
    setHistoryIndex(-1);
    setCommandInput('');
  };

  const handleQuickKey = (keyAction: string) => {
    triggerHaptic('selection', settings.hapticsEnabled);
    if (keyAction === 'ctrl-c') {
      onSendCommand('^C (SIGINT)');
    } else if (keyAction === 'clear') {
      onSendCommand('clear');
    } else if (keyAction === 'up') {
      if (history.length > 0) {
        const nextIdx = historyIndex + 1 < history.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIdx);
        setCommandInput(history[history.length - 1 - nextIdx]);
      }
    } else if (keyAction === 'down') {
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setCommandInput(history[history.length - 1 - nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    } else if (keyAction === 'tab') {
      setCommandInput((prev) => prev + '  ');
    } else {
      setCommandInput((prev) => (prev ? `${prev} ${keyAction}` : keyAction));
    }
    inputRef.current?.focus();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#05070a] font-mono text-xs overflow-hidden pb-20">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-surface-card border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-semibold text-gray-300">Antigravity Shell</span>
        </div>
        <button
          onClick={() => handleQuickKey('clear')}
          className="text-gray-400 hover:text-gray-200 text-[10px] flex items-center gap-1 bg-surface-subtle px-2 py-0.5 rounded border border-surface-border"
        >
          <Trash2 className="w-3 h-3" /> Clear
        </button>
      </div>

      {/* Terminal Output Log */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-gray-200 select-text">
        {lines.map((l) => {
          let color = 'text-gray-300';
          let prefix = '';
          if (l.type === 'input') {
            color = 'text-sky-400 font-semibold';
            prefix = '$ ';
          } else if (l.type === 'stderr') {
            color = 'text-rose-400';
          } else if (l.type === 'system') {
            color = 'text-indigo-400 font-semibold';
          }

          return (
            <div key={l.id} className="leading-relaxed whitespace-pre-wrap break-all">
              <span className={color}>
                {prefix}
                {l.text}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Touch Action Bar */}
      <div className="px-2 py-1.5 bg-surface border-t border-surface-border flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleQuickKey('ctrl-c')}
          className="flex-shrink-0 bg-rose-950/60 border border-rose-500/30 text-rose-300 px-2 py-1 rounded-md text-[10px] font-bold active:scale-95"
        >
          Ctrl+C
        </button>
        <button
          onClick={() => handleQuickKey('up')}
          className="flex-shrink-0 bg-surface-card border border-surface-border text-gray-300 p-1 rounded-md active:scale-95"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleQuickKey('down')}
          className="flex-shrink-0 bg-surface-card border border-surface-border text-gray-300 p-1 rounded-md active:scale-95"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleQuickKey('tab')}
          className="flex-shrink-0 bg-surface-card border border-surface-border text-gray-300 px-2 py-1 rounded-md text-[10px] font-semibold active:scale-95"
        >
          Tab
        </button>
        <button
          onClick={() => handleQuickKey('git status')}
          className="flex-shrink-0 bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 px-2 py-1 rounded-md text-[10px] active:scale-95"
        >
          git status
        </button>
        <button
          onClick={() => handleQuickKey('npm test')}
          className="flex-shrink-0 bg-surface-card border border-surface-border text-gray-300 px-2 py-1 rounded-md text-[10px] active:scale-95"
        >
          npm test
        </button>
        <button
          onClick={() => handleQuickKey('ls')}
          className="flex-shrink-0 bg-surface-card border border-surface-border text-gray-300 px-2 py-1 rounded-md text-[10px] active:scale-95"
        >
          ls
        </button>
      </div>

      {/* Terminal Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-2 bg-surface-card border-t border-surface-border"
      >
        <span className="text-sky-400 font-bold">$</span>
        <input
          ref={inputRef}
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Execute shell command..."
          className="flex-1 bg-transparent text-gray-100 font-mono text-xs focus:outline-none placeholder:text-gray-600"
          autoCapitalize="none"
          autoCorrect="off"
        />
        <button
          type="submit"
          disabled={!commandInput.trim()}
          className="p-1.5 rounded-lg bg-brand-600 text-white disabled:opacity-40 active:scale-90"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
