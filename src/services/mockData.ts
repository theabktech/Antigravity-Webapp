import {
  ChatMessage,
  ToolCall,
  Subagent,
  ScheduledTask,
  ArtifactFile,
  TerminalSession,
  WorkspaceProject
} from '../types/antigravity';

export const INITIAL_PROJECT: WorkspaceProject = {
  id: 'antigravity-core',
  name: 'Antigravity Workspace (Mobile Remote)',
  path: 'd:/Antigravity Webapp',
  activeBranch: 'main',
  modifiedFilesCount: 4
};

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    timestamp: '09:47 AM',
    content: 'Let\'s build a mobile webapp for running the remote connection feature for Antigravity on my phone. I should be able to install this on my phone so that I can use Antigravity without my browser.'
  },
  {
    id: 'msg-2',
    sender: 'agent',
    timestamp: '09:48 AM',
    content: 'I will design and build **Antigravity Mobile (AGY Remote PWA)** with standalone mobile presentation, QR pairing, live action approvals, real-time terminal streaming, voice dictation, and subagent orchestration.',
    thought: 'Planning complete architecture: PWA manifest, service worker for offline caching, WebSocket host bridge, thumb-friendly mobile UI with approvals center, and camera QR scanner for instant LAN/tunnel connection.',
    toolCalls: [
      {
        id: 'tool-1',
        name: 'write_to_file',
        summary: 'Write implementation plan',
        action: 'Writing implementation plan for mobile PWA',
        status: 'completed',
        params: { TargetFile: 'implementation_plan.md' },
        output: 'Successfully created implementation_plan.md'
      },
      {
        id: 'tool-2',
        name: 'run_command',
        summary: 'Initialize Vite & PWA packages',
        action: 'Running npm install in background',
        status: 'completed',
        params: { CommandLine: 'npm install' },
        output: 'added 145 packages in 11s'
      }
    ],
    artifacts: [
      {
        id: 'art-1',
        name: 'implementation_plan.md',
        summary: 'Full mobile PWA architecture, pairing protocols, and approval engine'
      }
    ]
  }
];

export const INITIAL_PENDING_APPROVALS: ToolCall[] = [
  {
    id: 'pending-cmd-1',
    name: 'run_command',
    summary: 'Deploy production bridge tunnel',
    action: 'Run cloudflare tunnel or ngrok remote bridge',
    status: 'pending',
    requiresReview: true,
    params: {
      CommandLine: 'cloudflared tunnel --url http://localhost:5173 --name antigravity-mobile',
      Cwd: 'd:/Antigravity Webapp',
      WaitMsBeforeAsync: 10000
    }
  },
  {
    id: 'pending-cmd-2',
    name: 'replace_file_content',
    summary: 'Update security execution policy',
    action: 'Enable biometric auth requirement for strict commands',
    status: 'pending',
    requiresReview: true,
    params: {
      TargetFile: 'config/security.json',
      Instruction: 'Set ToolExecutionPolicy to strict and require mobile approval',
      StartLine: 12,
      EndLine: 18
    }
  }
];

export const INITIAL_SUBAGENTS: Subagent[] = [
  {
    id: 'subagent-1',
    name: 'Codebase Researcher',
    role: 'Deep Codebase Indexer',
    state: 'running',
    stateDetail: 'Grep indexing symbol definitions in 146 modules...',
    model: 'Gemini 3.7 Flash',
    lastActive: 'Just now',
    progressPercent: 78
  },
  {
    id: 'subagent-2',
    name: 'A11y Inspector',
    role: 'Flutter / Web Accessibility Agent',
    state: 'idle',
    stateDetail: 'Waiting for UI render tree snapshot',
    model: 'Gemini 3.7 Pro',
    lastActive: '2m ago',
    progressPercent: 100
  },
  {
    id: 'subagent-3',
    name: 'Test Runner',
    role: 'E2E & Integration Subagent',
    state: 'completed',
    stateDetail: '18/18 test suites passed in 1.4s',
    model: 'Gemini 3.7 Flash',
    lastActive: '5m ago',
    progressPercent: 100
  }
];

export const INITIAL_SCHEDULED_TASKS: ScheduledTask[] = [
  {
    id: 'task-cron-1',
    type: 'cron',
    prompt: 'Poll system resources & network telemetry every 5 minutes',
    cronExpression: '*/5 * * * *',
    status: 'active',
    nextRun: 'in 2 mins'
  },
  {
    id: 'task-timer-2',
    type: 'timer',
    prompt: 'Notify user when long-running build completes',
    durationSeconds: 300,
    remainingSeconds: 142,
    status: 'active'
  }
];

export const INITIAL_ARTIFACTS: ArtifactFile[] = [
  {
    id: 'art-plan',
    name: 'implementation_plan.md',
    path: 'brain/implementation_plan.md',
    type: 'markdown',
    summary: 'Mobile PWA specification, remote pairing architecture, and security policies.',
    updatedAt: '09:56 AM',
    userFacing: true,
    requestFeedback: false,
    content: `# Antigravity Mobile (AGY Remote PWA) Implementation Plan

Build a dedicated, mobile-first Progressive Web App (PWA) that allows users to remotely control and monitor Google Antigravity from their phone with a native app experience.

## Key Capabilities
- **Standalone PWA Mode**: Full-screen, no URL bar, custom splash, fast offline boot.
- **QR Pairing**: Instant camera-based handshake with desktop IDE.
- **Interactive Action Center**: 1-tap Approve/Reject for terminal commands and code writes.
- **Voice Dictation**: Hands-free prompts and slash commands on the go.
- **Subagent & Terminal Live Monitor**: Real-time inspection of background tasks and subagents.
`
  },
  {
    id: 'art-arch',
    name: 'architecture_diagram.mermaid',
    path: 'brain/architecture.mmd',
    type: 'diagram',
    summary: 'Antigravity Mobile to Desktop Host Bridge Protocol Flow',
    updatedAt: '09:58 AM',
    userFacing: true,
    content: `graph TD
  Phone[📱 Mobile PWA Client] -->|WebSocket & REST| Bridge[⚡ Antigravity Host Bridge]
  Bridge --> CLI[💻 Antigravity CLI / IDE Engine]
  Bridge --> Tasks[⚙️ Background Tasks & Subagents]
  Bridge --> Transcripts[📜 JSONL Brain Transcripts]
  Phone --> QR[📷 QR Camera Scanner / Token Pairing]
`
  },
  {
    id: 'art-perf',
    name: 'mobile_benchmarks.md',
    path: 'brain/mobile_benchmarks.md',
    type: 'markdown',
    summary: 'Latency benchmarks over Local Wi-Fi, Tailscale, and Cloudflare Tunnel.',
    updatedAt: '10:01 AM',
    userFacing: true,
    content: `# Antigravity Mobile Latency Benchmarks

| Connection Type | Average Latency | Streaming Token FPS | Haptic Response |
| :--- | :--- | :--- | :--- |
| **Local LAN (Wi-Fi 6)** | 3 - 6 ms | 85 tokens/sec | Instant (< 5ms) |
| **Tailscale WireGuard** | 12 - 24 ms | 70 tokens/sec | Instant (< 15ms) |
| **Cloudflare Tunnel** | 28 - 45 ms | 60 tokens/sec | Instant (< 30ms) |
| **Cellular (5G)** | 35 - 55 ms | 55 tokens/sec | Instant (< 40ms) |
`
  }
];

export const INITIAL_TERMINAL_SESSION: TerminalSession = {
  id: 'term-main',
  name: 'Antigravity Server Terminal',
  cwd: 'd:/Antigravity Webapp',
  lines: [
    { id: 'l1', type: 'system', text: '⚡ Antigravity Remote Host Shell v2.0 connected', timestamp: '09:47:00' },
    { id: 'l2', type: 'input', text: 'node -v && npm -v', timestamp: '09:47:02' },
    { id: 'l3', type: 'stdout', text: 'v25.8.2\n11.11.1', timestamp: '09:47:03' },
    { id: 'l4', type: 'input', text: 'npm run build', timestamp: '09:58:10' },
    { id: 'l5', type: 'stdout', text: '✓ 14 modules transformed.\ndist/index.html   0.82 kB\ndist/assets/index.js   148.24 kB', timestamp: '09:58:14' },
    { id: 'l6', type: 'system', text: 'Ready for mobile input 🚀', timestamp: '09:58:15' }
  ]
};
