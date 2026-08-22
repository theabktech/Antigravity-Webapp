export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface HostProfile {
  id: string;
  name: string;
  url: string;
  token?: string;
  lastConnected?: string;
  isDefault?: boolean;
}

export type ModelType = 'gemini-3.7-flash' | 'gemini-3.7-pro' | 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'inherit';

export type ToolExecutionPolicy = 'always-proceed' | 'request-review' | 'strict' | 'proceed-in-sandbox';

export interface AgentSettings {
  model: ModelType;
  toolExecutionPolicy: ToolExecutionPolicy;
  terminalSandbox: boolean;
  hapticsEnabled: boolean;
  soundEffectsEnabled: boolean;
  speechDictationLang: string;
  autoScrollChat: boolean;
  theme: 'dark' | 'midnight' | 'matrix';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: string;
  content: string;
  isStreaming?: boolean;
  thought?: string;
  toolCalls?: ToolCall[];
  artifacts?: ArtifactPreview[];
}

export interface ToolCall {
  id: string;
  name: string;
  summary: string;
  action: string;
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'error';
  params: Record<string, any>;
  output?: string;
  requiresReview?: boolean;
}

export interface Subagent {
  id: string;
  name: string;
  role: string;
  state: 'running' | 'idle' | 'waiting_for_input' | 'completed' | 'errored';
  stateDetail?: string;
  model: string;
  lastActive: string;
  progressPercent?: number;
}

export interface ScheduledTask {
  id: string;
  type: 'timer' | 'cron';
  prompt: string;
  cronExpression?: string;
  durationSeconds?: number;
  remainingSeconds?: number;
  status: 'active' | 'paused' | 'completed';
  nextRun?: string;
}

export interface ArtifactFile {
  id: string;
  name: string;
  path: string;
  type: 'markdown' | 'code' | 'diagram' | 'image' | 'diff';
  content: string;
  summary: string;
  updatedAt: string;
  userFacing: boolean;
  requestFeedback?: boolean;
}

export interface ArtifactPreview {
  id: string;
  name: string;
  summary: string;
}

export interface TerminalSession {
  id: string;
  name: string;
  cwd: string;
  lines: TerminalLine[];
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'stdout' | 'stderr' | 'system';
  text: string;
  timestamp: string;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  path: string;
  activeBranch?: string;
  modifiedFilesCount: number;
}
