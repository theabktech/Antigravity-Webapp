import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Terminal,
  FileCode,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Command,
  AtSign,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, AgentSettings, ToolCall } from '../types/antigravity';
import { triggerHaptic } from '../services/haptics';
import { speechService } from '../services/speech';

interface ChatCanvasProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  settings: AgentSettings;
  onOpenArtifact: (name: string) => void;
}

const SLASH_COMMANDS = [
  { cmd: '/goal', desc: 'Autonomous overnight goal fulfillment', icon: '🎯' },
  { cmd: '/schedule', desc: 'Set one-shot timer or recurring cron job', icon: '⏱️' },
  { cmd: '/grill-me', desc: 'Interactive interview to align on design plan', icon: '🔥' },
  { cmd: '/browser', desc: 'Web browsing and interaction mode', icon: '🌐' },
  { cmd: '/learn', desc: 'Persist corrected behavior for future tasks', icon: '🧠' },
  { cmd: '/teamwork-preview', desc: 'Multi-agent teamwork preview', icon: '👥' }
];

const CONTEXT_MENTIONS = [
  { tag: '@workspace', desc: 'Current project workspace root', icon: '📁' },
  { tag: '@terminal', desc: 'Active remote terminal output', icon: '💻' },
  { tag: '@tasks', desc: 'Active background tasks & cron', icon: '⚙️' },
  { tag: '@rules', desc: 'User custom guidelines & instructions', icon: '📜' }
];

export const ChatCanvas: React.FC<ChatCanvasProps> = ({
  messages,
  onSendMessage,
  settings,
  onOpenArtifact
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (settings.autoScrollChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, settings.autoScrollChat]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    triggerHaptic('medium', settings.hapticsEnabled);
    onSendMessage(inputText.trim());
    setInputText('');
    setShowSlashMenu(false);
    setShowMentionMenu(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);

    // Auto resize
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;

    // Trigger Slash menu
    if (val.endsWith('/')) {
      setShowSlashMenu(true);
      setShowMentionMenu(false);
    } else if (!val.includes('/')) {
      setShowSlashMenu(false);
    }

    // Trigger Mention menu
    if (val.endsWith('@')) {
      setShowMentionMenu(true);
      setShowSlashMenu(false);
    } else if (!val.includes('@')) {
      setShowMentionMenu(false);
    }
  };

  const handleToggleVoice = () => {
    triggerHaptic('selection', settings.hapticsEnabled);
    if (isRecording) {
      speechService.stop();
      setIsRecording(false);
    } else {
      speechService.start(
        (transcript, isFinal) => {
          setInputText((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
          if (isFinal) {
            triggerHaptic('light', settings.hapticsEnabled);
          }
        },
        (error) => {
          console.warn('Speech error:', error);
          setIsRecording(false);
        },
        (listening) => setIsRecording(listening),
        settings.speechDictationLang
      );
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    triggerHaptic('light', settings.hapticsEnabled);
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const toggleThought = (msgId: string) => {
    triggerHaptic('light', settings.hapticsEnabled);
    setExpandedThoughts((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const toggleTool = (toolId: string) => {
    triggerHaptic('light', settings.hapticsEnabled);
    setExpandedTools((prev) => ({ ...prev, [toolId]: !prev[toolId] }));
  };

  // Helper to render markdown and code snippets cleanly
  const renderMessageContent = (content: string, msgId: string) => {
    if (!content) return null;

    // Simple code block parser
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const language = lines[0].trim() || 'code';
        const code = lines.slice(language ? 1 : 0).join('\n');
        const codeBlockId = `${msgId}-code-${index}`;
        const isCopied = copiedCodeId === codeBlockId;

        return (
          <div key={index} className="my-2 rounded-xl overflow-hidden bg-black/60 border border-surface-border">
            <div className="flex items-center justify-between px-3 py-1.5 bg-surface-card border-b border-surface-border text-xs text-gray-400">
              <span className="font-mono text-[11px] text-sky-400 font-semibold">{language}</span>
              <button
                onClick={() => copyToClipboard(code, codeBlockId)}
                className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 font-mono text-xs text-gray-200 overflow-x-auto select-text whitespace-pre">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Format bold and bullet points
      const formatted = part.split('\n').map((line, lIdx) => {
        // Table or bullet detection
        const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
        return (
          <p key={lIdx} className={`${isBullet ? 'pl-3 relative before:content-["•"] before:absolute before:left-0 before:text-brand-accent' : ''} mb-1 leading-relaxed`}>
            {line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').split(/<b>(.*?)<\/b>/g).map((seg, sIdx) => 
              sIdx % 2 === 1 ? <strong key={sIdx} className="font-semibold text-white">{seg}</strong> : seg
            )}
          </p>
        );
      });

      return <div key={index}>{formatted}</div>;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 pb-28">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Sparkles className="w-7 h-7 text-sky-400" />
            </div>
            <h3 className="text-base font-bold text-gray-100">Antigravity Mobile Ready</h3>
            <p className="text-xs text-gray-400 max-w-xs mt-1">
              Send prompts, run overnight /goal workflows, review live actions, and control your host from your phone.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isThoughtOpen = Boolean(expandedThoughts[msg.id]);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
              >
                {/* Bubble Container */}
                <div
                  className={`relative rounded-2xl px-3.5 py-2.5 max-w-[92%] text-sm select-text ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-sm shadow-md'
                      : 'bg-surface border border-surface-border text-gray-200 rounded-bl-sm shadow-lg'
                  }`}
                >
                  {/* Sender & Timestamp */}
                  <div className="flex items-center justify-between gap-3 text-[10px] mb-1 opacity-70">
                    <span className="font-semibold uppercase tracking-wider">
                      {isUser ? 'You' : 'Antigravity'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Agent Thinking Accordion */}
                  {!isUser && msg.thought && (
                    <div className="mb-2">
                      <button
                        onClick={() => toggleThought(msg.id)}
                        className="flex items-center gap-1.5 text-xs text-indigo-300/80 bg-indigo-950/40 border border-indigo-500/20 rounded-lg px-2 py-1 hover:bg-indigo-950/70 transition-all"
                      >
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        <span className="font-medium">
                          {isThoughtOpen ? 'Hide reasoning' : 'View reasoning plan'}
                        </span>
                        {isThoughtOpen ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                      {isThoughtOpen && (
                        <div className="mt-1.5 p-2.5 bg-black/40 border border-indigo-500/20 rounded-xl text-xs text-indigo-200/90 font-mono leading-relaxed select-text">
                          {msg.thought}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="text-xs leading-relaxed">
                    {renderMessageContent(msg.content, msg.id)}
                    {msg.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-sky-400 ml-1 animate-pulse align-middle" />
                    )}
                  </div>

                  {/* Tool Executions Cards */}
                  {!isUser && msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-2.5 space-y-1.5 border-t border-surface-border/60 pt-2">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Tool Executions
                      </div>
                      {msg.toolCalls.map((tool) => {
                        const isToolOpen = Boolean(expandedTools[tool.id]);
                        return (
                          <div
                            key={tool.id}
                            className="bg-surface-card border border-surface-border rounded-xl p-2 text-xs"
                          >
                            <div
                              onClick={() => toggleTool(tool.id)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5 overflow-hidden">
                                {tool.name.includes('command') ? (
                                  <Terminal className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                ) : (
                                  <FileCode className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                                )}
                                <span className="font-mono font-semibold text-[11px] text-gray-200 truncate">
                                  {tool.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {tool.status === 'completed' ? (
                                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                                    <CheckCircle2 className="w-3 h-3" /> Done
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                                    <AlertCircle className="w-3 h-3" /> {tool.status}
                                  </span>
                                )}
                                {isToolOpen ? (
                                  <ChevronDown className="w-3 h-3 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                            </div>

                            <p className="text-[11px] text-gray-300 mt-1">{tool.action}</p>

                            {isToolOpen && (
                              <div className="mt-2 pt-2 border-t border-surface-border space-y-1.5 font-mono text-[11px]">
                                {tool.params && (
                                  <div>
                                    <span className="text-gray-400 block text-[10px]">Parameters:</span>
                                    <pre className="bg-black/50 p-1.5 rounded text-gray-200 overflow-x-auto">
                                      {JSON.stringify(tool.params, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {tool.output && (
                                  <div>
                                    <span className="text-gray-400 block text-[10px]">Output:</span>
                                    <pre className="bg-black/50 p-1.5 rounded text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                                      {tool.output}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Artifact Links */}
                  {!isUser && msg.artifacts && msg.artifacts.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-surface-border/60 flex flex-wrap gap-1.5">
                      {msg.artifacts.map((art) => (
                        <button
                          key={art.id}
                          onClick={() => {
                            triggerHaptic('light', settings.hapticsEnabled);
                            onOpenArtifact(art.name);
                          }}
                          className="flex items-center gap-1.5 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 rounded-lg px-2.5 py-1 text-xs transition-all active:scale-95"
                        >
                          <FileCode className="w-3 h-3 text-sky-400" />
                          <span className="font-semibold">{art.name}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Menus (Slash commands & Mentions) */}
      <div className="relative">
        {showSlashMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-2 max-h-48 overflow-y-auto z-40">
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-surface-border mb-1">
              <Command className="w-3 h-3 text-sky-400" />
              <span>Slash Commands</span>
            </div>
            {SLASH_COMMANDS.map((item) => (
              <button
                key={item.cmd}
                onClick={() => {
                  triggerHaptic('light', settings.hapticsEnabled);
                  setInputText(item.cmd + ' ');
                  setShowSlashMenu(false);
                  textareaRef.current?.focus();
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-surface-subtle text-left transition-colors active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  <span className="font-mono font-bold text-xs text-sky-400">{item.cmd}</span>
                </div>
                <span className="text-[11px] text-gray-400 truncate max-w-[180px]">{item.desc}</span>
              </button>
            ))}
          </div>
        )}

        {showMentionMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-2 max-h-48 overflow-y-auto z-40">
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-surface-border mb-1">
              <AtSign className="w-3 h-3 text-indigo-400" />
              <span>Attach Context</span>
            </div>
            {CONTEXT_MENTIONS.map((item) => (
              <button
                key={item.tag}
                onClick={() => {
                  triggerHaptic('light', settings.hapticsEnabled);
                  setInputText((prev) => prev.slice(0, -1) + item.tag + ' ');
                  setShowMentionMenu(false);
                  textareaRef.current?.focus();
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-surface-subtle text-left transition-colors active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  <span className="font-mono font-bold text-xs text-indigo-300">{item.tag}</span>
                </div>
                <span className="text-[11px] text-gray-400">{item.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-3 pb-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            triggerHaptic('light', settings.hapticsEnabled);
            setInputText('Antigravity status check');
          }}
          className="flex-shrink-0 bg-surface-subtle border border-surface-border text-gray-300 rounded-full px-2.5 py-1 text-[11px] active:scale-95"
        >
          ⚡ Status Check
        </button>
        <button
          onClick={() => {
            triggerHaptic('light', settings.hapticsEnabled);
            setInputText('/goal Run test suite and fix warnings');
          }}
          className="flex-shrink-0 bg-surface-subtle border border-surface-border text-sky-300 rounded-full px-2.5 py-1 text-[11px] active:scale-95"
        >
          🎯 /goal Fix Warnings
        </button>
        <button
          onClick={() => {
            triggerHaptic('light', settings.hapticsEnabled);
            setInputText('/grill-me');
          }}
          className="flex-shrink-0 bg-surface-subtle border border-surface-border text-amber-300 rounded-full px-2.5 py-1 text-[11px] active:scale-95"
        >
          🔥 /grill-me
        </button>
        <button
          onClick={() => {
            triggerHaptic('light', settings.hapticsEnabled);
            setInputText('/schedule Reminder in 10 mins');
          }}
          className="flex-shrink-0 bg-surface-subtle border border-surface-border text-indigo-300 rounded-full px-2.5 py-1 text-[11px] active:scale-95"
        >
          ⏱️ /schedule
        </button>
      </div>

      {/* Input Box & Voice Bar */}
      <div className="p-2.5 bg-surface/95 backdrop-blur-md border-t border-surface-border mb-16">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2 bg-surface-card border border-surface-border rounded-2xl px-3 py-1.5 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all"
        >
          {/* Slash & Mention Quick Buttons */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light', settings.hapticsEnabled);
              setShowSlashMenu(!showSlashMenu);
              setShowMentionMenu(false);
            }}
            className="p-1 text-gray-400 hover:text-sky-400 transition-colors"
          >
            <Command className="w-4 h-4" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            enterKeyHint="send"
            placeholder={isRecording ? 'Listening to voice...' : 'Prompt Antigravity (/ for commands)...'}
            className="flex-1 bg-transparent text-gray-100 text-xs py-1.5 focus:outline-none resize-none max-h-28 placeholder:text-gray-500"
          />

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-1.5 rounded-xl transition-all active:scale-90 ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-1.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-90 shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
