import {
  ConnectionStatus,
  HostProfile,
  ChatMessage,
  ToolCall,
  Subagent,
  ScheduledTask,
  ArtifactFile,
  TerminalLine,
  AgentSettings
} from '../types/antigravity';
import {
  INITIAL_MESSAGES,
  INITIAL_PENDING_APPROVALS,
  INITIAL_SUBAGENTS,
  INITIAL_SCHEDULED_TASKS,
  INITIAL_ARTIFACTS,
  INITIAL_TERMINAL_SESSION
} from './mockData';

type Listener<T> = (data: T) => void;

class BridgeClientService {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'connected'; // Starts connected to Local/Simulator
  private latency = 8; // ms
  private pingInterval: any = null;

  // Active state
  private messages: ChatMessage[] = [...INITIAL_MESSAGES];
  private pendingApprovals: ToolCall[] = [...INITIAL_PENDING_APPROVALS];
  private subagents: Subagent[] = [...INITIAL_SUBAGENTS];
  private scheduledTasks: ScheduledTask[] = [...INITIAL_SCHEDULED_TASKS];
  private artifacts: ArtifactFile[] = [...INITIAL_ARTIFACTS];
  private terminalLines: TerminalLine[] = [...INITIAL_TERMINAL_SESSION.lines];
  
  private profiles: HostProfile[] = [
    {
      id: 'local-sim',
      name: 'Mobile Simulator / Demo Mode',
      url: 'sim://localhost',
      isDefault: true,
      lastConnected: 'Active Now'
    },
    {
      id: 'host-lan',
      name: 'Desktop LAN (Wi-Fi Bridge)',
      url: 'ws://' + (typeof window !== 'undefined' ? window.location.hostname : 'localhost') + ':4200',
      token: 'agy_sec_token_99a8',
      lastConnected: 'Ready'
    }
  ];
  private activeProfileId = 'local-sim';

  // Listeners
  private statusListeners = new Set<Listener<ConnectionStatus>>();
  private latencyListeners = new Set<Listener<number>>();
  private messagesListeners = new Set<Listener<ChatMessage[]>>();
  private approvalsListeners = new Set<Listener<ToolCall[]>>();
  private subagentsListeners = new Set<Listener<Subagent[]>>();
  private tasksListeners = new Set<Listener<ScheduledTask[]>>();
  private artifactsListeners = new Set<Listener<ArtifactFile[]>>();
  private terminalListeners = new Set<Listener<TerminalLine[]>>();
  private profilesListeners = new Set<Listener<HostProfile[]>>();

  constructor() {
    this.loadProfiles();
    this.startHeartbeat();
  }

  private loadProfiles() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('agy_host_profiles');
        if (saved) {
          this.profiles = JSON.parse(saved);
        }
        const active = localStorage.getItem('agy_active_profile');
        if (active) {
          this.activeProfileId = active;
        }
      } catch (e) {
        console.warn('Failed to load profiles:', e);
      }
    }
  }

  private saveProfiles() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('agy_host_profiles', JSON.stringify(this.profiles));
        localStorage.setItem('agy_active_profile', this.activeProfileId);
      } catch (e) {
        console.warn('Failed to save profiles:', e);
      }
    }
  }

  public getProfiles(): HostProfile[] {
    return [...this.profiles];
  }

  public getActiveProfile(): HostProfile {
    return this.profiles.find(p => p.id === this.activeProfileId) || this.profiles[0];
  }

  public addProfile(profile: Omit<HostProfile, 'id'>): HostProfile {
    const newProfile: HostProfile = {
      ...profile,
      id: 'profile-' + Date.now()
    };
    this.profiles.push(newProfile);
    this.saveProfiles();
    this.notifyProfiles();
    return newProfile;
  }

  public removeProfile(id: string) {
    this.profiles = this.profiles.filter(p => p.id !== id);
    if (this.activeProfileId === id && this.profiles.length > 0) {
      this.activeProfileId = this.profiles[0].id;
    }
    this.saveProfiles();
    this.notifyProfiles();
  }

  public connectToProfile(profileId: string) {
    const profile = this.profiles.find(p => p.id === profileId);
    if (!profile) return;

    this.activeProfileId = profileId;
    this.saveProfiles();
    this.notifyProfiles();

    if (profile.url.startsWith('sim://')) {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      this.setStatus('connected');
      this.latency = Math.floor(Math.random() * 6) + 4;
      this.notifyLatency();
      return;
    }

    // Connect to real WebSocket Bridge Server
    this.setStatus('connecting');
    try {
      if (this.ws) {
        this.ws.close();
      }
      this.ws = new WebSocket(profile.url);

      this.ws.onopen = () => {
        this.setStatus('connected');
        if (profile.token) {
          this.ws?.send(JSON.stringify({ type: 'auth', token: profile.token }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleBridgeMessage(data);
        } catch (e) {
          console.warn('Failed to parse bridge message:', e);
        }
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
      };

      this.ws.onerror = () => {
        this.setStatus('error');
      };
    } catch (e) {
      this.setStatus('error');
    }
  }

  private handleBridgeMessage(data: any) {
    switch (data.type) {
      case 'pong':
        this.latency = Date.now() - (data.timestamp || Date.now());
        this.notifyLatency();
        break;
      case 'chat_stream':
        this.appendStreamChunk(data.chunk);
        break;
      case 'tool_approval_request':
        this.pendingApprovals.push(data.toolCall);
        this.notifyApprovals();
        break;
      case 'terminal_output':
        this.addTerminalLine({
          id: 'term-' + Date.now(),
          type: data.stream || 'stdout',
          text: data.text,
          timestamp: new Date().toLocaleTimeString()
        });
        break;
      case 'subagents_update':
        this.subagents = data.subagents;
        this.notifySubagents();
        break;
    }
  }

  private startHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      } else if (this.status === 'connected') {
        // Random subtle jitter for simulator latency
        this.latency = Math.max(4, Math.min(24, this.latency + (Math.random() > 0.5 ? 1 : -1)));
        this.notifyLatency();
      }
    }, 3000);
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.statusListeners.forEach(l => l(status));
  }

  private notifyLatency() {
    this.latencyListeners.forEach(l => l(this.latency));
  }

  private notifyMessages() {
    this.messagesListeners.forEach(l => l([...this.messages]));
  }

  private notifyApprovals() {
    this.approvalsListeners.forEach(l => l([...this.pendingApprovals]));
  }

  private notifySubagents() {
    this.subagentsListeners.forEach(l => l([...this.subagents]));
  }

  private notifyTasks() {
    this.tasksListeners.forEach(l => l([...this.scheduledTasks]));
  }

  private notifyArtifacts() {
    this.artifactsListeners.forEach(l => l([...this.artifacts]));
  }

  private notifyTerminal() {
    this.terminalListeners.forEach(l => l([...this.terminalLines]));
  }

  private notifyProfiles() {
    this.profilesListeners.forEach(l => l([...this.profiles]));
  }

  // Action methods
  public sendMessage(content: string, settings?: AgentSettings) {
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content
    };
    this.messages.push(userMsg);
    this.notifyMessages();

    // If connected to real bridge, send via WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'user_prompt', content, settings }));
      return;
    }

    // Otherwise, simulate real-time AI response with streaming tokens & actions
    this.simulateAgentResponse(content, settings);
  }

  private simulateAgentResponse(prompt: string, settings?: AgentSettings) {
    const agentMsgId = 'msg-' + (Date.now() + 1);
    const agentMsg: ChatMessage = {
      id: agentMsgId,
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: '',
      isStreaming: true,
      thought: 'Analyzing mobile request, evaluating permissions & execution pipeline...'
    };
    this.messages.push(agentMsg);
    this.notifyMessages();

    // Simulated responses based on keywords
    let responseText = '';
    let toolCallsToTrigger: ToolCall[] = [];

    if (prompt.startsWith('/goal')) {
      responseText = `🎯 **Autonomous Goal Activated**: Running comprehensive task exploration in background.\n\nI will continue executing multi-step verification until the objective is fully satisfied and report back.`;
      toolCallsToTrigger.push({
        id: 'goal-tool-' + Date.now(),
        name: 'invoke_subagent',
        summary: 'Spawn autonomous goal worker',
        action: 'Starting deep goal fulfillment loop',
        status: 'completed',
        params: { Role: 'Autonomous Goal Executor', TypeName: 'self' },
        output: 'Subagent conversation-id: auto-goal-8821 spawned'
      });
    } else if (prompt.startsWith('/schedule')) {
      responseText = `⏱️ **Schedule Created**: One-shot timer set for execution.\n\nNotification will be dispatched to your mobile device upon trigger.`;
      this.scheduledTasks.push({
        id: 'task-' + Date.now(),
        type: 'timer',
        prompt: prompt.replace('/schedule', '').trim() || 'Mobile scheduled reminder',
        durationSeconds: 180,
        remainingSeconds: 180,
        status: 'active'
      });
      this.notifyTasks();
    } else if (prompt.startsWith('/grill-me')) {
      responseText = `🔥 **Grill-Me Mode Activated**:\n\n1. What is the preferred transport protocol for your remote bridge (Tailscale vs Cloudflare Tunnel)?\n2. Should strict command approval require biometric confirmation on mobile?\n3. Would you like live push notifications enabled for long-running subagent tasks?`;
    } else if (prompt.toLowerCase().includes('status') || prompt.toLowerCase().includes('check')) {
      responseText = `✅ **Antigravity Status Check**:\n- **Model**: ${settings?.model || 'Gemini 3.7 Flash'}\n- **Active Subagents**: ${this.subagents.filter(s => s.state === 'running').length} running\n- **Pending Approvals**: ${this.pendingApprovals.length} item(s)\n- **Host Latency**: ${this.latency} ms\n- **Battery & PWA Engine**: Optimized 60 FPS`;
    } else {
      responseText = `I have received your instruction: *" ${prompt} "*. \n\nI am analyzing the workspace files and executing the requested subroutines. All changes are being recorded in the live audit log.`;
      toolCallsToTrigger.push({
        id: 'tool-call-' + Date.now(),
        name: 'grep_search',
        summary: 'Search project context',
        action: 'Scanning workspace modules',
        status: 'completed',
        params: { Query: prompt.slice(0, 20), SearchPath: 'd:/Antigravity Webapp' },
        output: 'Found 8 references across 3 files.'
      });
    }

    // Stream the text chunk by chunk
    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < responseText.length) {
        const step = Math.min(6, responseText.length - charIndex);
        agentMsg.content += responseText.slice(charIndex, charIndex + step);
        charIndex += step;
        this.notifyMessages();
      } else {
        clearInterval(interval);
        agentMsg.isStreaming = false;
        if (toolCallsToTrigger.length > 0) {
          agentMsg.toolCalls = toolCallsToTrigger;
        }
        this.notifyMessages();

        // If strict approval or command test, add a simulated approval item
        if (prompt.toLowerCase().includes('deploy') || prompt.toLowerCase().includes('run')) {
          this.pendingApprovals.push({
            id: 'approval-' + Date.now(),
            name: 'run_command',
            summary: 'Execute prompt requested command',
            action: `Run command in workspace: ${prompt}`,
            status: 'pending',
            requiresReview: true,
            params: { CommandLine: prompt, Cwd: 'd:/Antigravity Webapp' }
          });
          this.notifyApprovals();
        }
      }
    }, 25);
  }

  private appendStreamChunk(chunk: string) {
    const lastMsg = this.messages[this.messages.length - 1];
    if (lastMsg && lastMsg.sender === 'agent' && lastMsg.isStreaming) {
      lastMsg.content += chunk;
      this.notifyMessages();
    }
  }

  public approveTool(toolId: string) {
    const index = this.pendingApprovals.findIndex(t => t.id === toolId);
    if (index !== -1) {
      const tool = this.pendingApprovals[index];
      tool.status = 'approved';
      this.pendingApprovals.splice(index, 1);
      this.notifyApprovals();

      // Log in terminal
      this.addTerminalLine({
        id: 'term-' + Date.now(),
        type: 'input',
        text: tool.params?.CommandLine || `Execute: ${tool.name}`,
        timestamp: new Date().toLocaleTimeString()
      });
      this.addTerminalLine({
        id: 'term-' + (Date.now() + 1),
        type: 'stdout',
        text: `✓ Mobile approval granted. Executed successfully with exit code 0.`,
        timestamp: new Date().toLocaleTimeString()
      });

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'tool_decision', toolId, decision: 'approve' }));
      }
    }
  }

  public rejectTool(toolId: string) {
    const index = this.pendingApprovals.findIndex(t => t.id === toolId);
    if (index !== -1) {
      this.pendingApprovals.splice(index, 1);
      this.notifyApprovals();

      this.addTerminalLine({
        id: 'term-' + Date.now(),
        type: 'stderr',
        text: `✗ Tool execution rejected by mobile operator.`,
        timestamp: new Date().toLocaleTimeString()
      });

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'tool_decision', toolId, decision: 'reject' }));
      }
    }
  }

  public killSubagent(subagentId: string) {
    this.subagents = this.subagents.map(s => {
      if (s.id === subagentId) {
        return { ...s, state: 'completed', stateDetail: 'Terminated by mobile operator' };
      }
      return s;
    });
    this.notifySubagents();
  }

  public cancelTask(taskId: string) {
    this.scheduledTasks = this.scheduledTasks.filter(t => t.id !== taskId);
    this.notifyTasks();
  }

  public sendTerminalInput(command: string) {
    this.addTerminalLine({
      id: 'term-' + Date.now(),
      type: 'input',
      text: command,
      timestamp: new Date().toLocaleTimeString()
    });

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'terminal_input', command }));
      return;
    }

    // Simulated terminal responses
    setTimeout(() => {
      let output = '';
      const cmd = command.trim().toLowerCase();
      if (cmd === 'git status') {
        output = 'On branch main\nChanges not staged for commit:\n  modified: src/App.tsx\n  modified: public/manifest.webmanifest\n\nno changes added to commit';
      } else if (cmd === 'ls' || cmd === 'dir') {
        output = 'dist/   node_modules/   public/   server/   src/   package.json   vite.config.ts';
      } else if (cmd.startsWith('echo ')) {
        output = command.slice(5);
      } else if (cmd === 'clear' || cmd === 'cls') {
        this.terminalLines = [];
        this.notifyTerminal();
        return;
      } else {
        output = `Executed: ${command}\nProcess exited with code 0`;
      }
      this.addTerminalLine({
        id: 'term-' + Date.now(),
        type: 'stdout',
        text: output,
        timestamp: new Date().toLocaleTimeString()
      });
    }, 150);
  }

  private addTerminalLine(line: TerminalLine) {
    this.terminalLines.push(line);
    if (this.terminalLines.length > 300) {
      this.terminalLines.shift();
    }
    this.notifyTerminal();
  }

  public clearChat() {
    this.messages = [];
    this.notifyMessages();
  }

  // Subscribe methods
  public subscribeStatus(listener: Listener<ConnectionStatus>) {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  public subscribeLatency(listener: Listener<number>) {
    this.latencyListeners.add(listener);
    listener(this.latency);
    return () => this.latencyListeners.delete(listener);
  }

  public subscribeMessages(listener: Listener<ChatMessage[]>) {
    this.messagesListeners.add(listener);
    listener(this.messages);
    return () => this.messagesListeners.delete(listener);
  }

  public subscribeApprovals(listener: Listener<ToolCall[]>) {
    this.approvalsListeners.add(listener);
    listener(this.pendingApprovals);
    return () => this.approvalsListeners.delete(listener);
  }

  public subscribeSubagents(listener: Listener<Subagent[]>) {
    this.subagentsListeners.add(listener);
    listener(this.subagents);
    return () => this.subagentsListeners.delete(listener);
  }

  public subscribeTasks(listener: Listener<ScheduledTask[]>) {
    this.tasksListeners.add(listener);
    listener(this.scheduledTasks);
    return () => this.tasksListeners.delete(listener);
  }

  public subscribeArtifacts(listener: Listener<ArtifactFile[]>) {
    this.artifactsListeners.add(listener);
    listener(this.artifacts);
    return () => this.artifactsListeners.delete(listener);
  }

  public subscribeTerminal(listener: Listener<TerminalLine[]>) {
    this.terminalListeners.add(listener);
    listener(this.terminalLines);
    return () => this.terminalListeners.delete(listener);
  }

  public subscribeProfiles(listener: Listener<HostProfile[]>) {
    this.profilesListeners.add(listener);
    listener(this.profiles);
    return () => this.profilesListeners.delete(listener);
  }
}

export const bridgeClient = new BridgeClientService();
