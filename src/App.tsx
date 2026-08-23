import React, { useState, useEffect } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { Navigation, ActiveTab } from './components/Navigation';
import { ChatCanvas } from './components/ChatCanvas';
import { ApprovalCenter } from './components/ApprovalCenter';
import { TerminalConsole } from './components/TerminalConsole';
import { SubagentMonitor } from './components/SubagentMonitor';
import { ArtifactViewer } from './components/ArtifactViewer';
import { ConnectionModal } from './components/ConnectionModal';
import { QRScannerModal } from './components/QRScannerModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { SettingsDrawer } from './components/SettingsDrawer';
import { LiveRemoteView } from './components/LiveRemoteView';
import { bridgeClient } from './services/bridgeClient';
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
} from './types/antigravity';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [status, setStatus] = useState<ConnectionStatus>('connected');
  const [latency, setLatency] = useState<number>(8);
  const [profiles, setProfiles] = useState<HostProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<HostProfile>({
    id: 'local-sim',
    name: 'Mobile Simulator',
    url: 'sim://localhost'
  });

  // Antigravity Live Web Remote Session URL (e.g. https://antigravity.google.com/r/...)
  const [liveRemoteUrl, setLiveRemoteUrl] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('agy_live_remote_url');
      } catch (e) {}
    }
    return null;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [approvals, setApprovals] = useState<ToolCall[]>([]);
  const [subagents, setSubagents] = useState<Subagent[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactFile[]>([]);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [selectedArtifactName, setSelectedArtifactName] = useState<string | null>(null);

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // User Settings
  const [settings, setSettings] = useState<AgentSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('agy_mobile_settings');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      model: 'gemini-3.7-flash',
      toolExecutionPolicy: 'request-review',
      terminalSandbox: true,
      hapticsEnabled: true,
      soundEffectsEnabled: true,
      speechDictationLang: 'en-US',
      autoScrollChat: true,
      theme: 'dark'
    };
  });

  // URL query parameter shortcuts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get('action');
      if (action === 'approvals') {
        setActiveTab('approvals');
      } else if (action === 'pair') {
        setIsQRModalOpen(true);
      } else if (action === 'new-chat') {
        setActiveTab('chat');
      }
    }
  }, []);

  // Subscriptions to Bridge client
  useEffect(() => {
    const unsubStatus = bridgeClient.subscribeStatus(setStatus);
    const unsubLatency = bridgeClient.subscribeLatency(setLatency);
    const unsubMessages = bridgeClient.subscribeMessages(setMessages);
    const unsubApprovals = bridgeClient.subscribeApprovals(setApprovals);
    const unsubSubagents = bridgeClient.subscribeSubagents(setSubagents);
    const unsubTasks = bridgeClient.subscribeTasks(setScheduledTasks);
    const unsubArtifacts = bridgeClient.subscribeArtifacts(setArtifacts);
    const unsubTerminal = bridgeClient.subscribeTerminal(setTerminalLines);
    const unsubProfiles = bridgeClient.subscribeProfiles((profs) => {
      setProfiles(profs);
      setActiveProfile(bridgeClient.getActiveProfile());
    });

    return () => {
      unsubStatus();
      unsubLatency();
      unsubMessages();
      unsubApprovals();
      unsubSubagents();
      unsubTasks();
      unsubArtifacts();
      unsubTerminal();
      unsubProfiles();
    };
  }, []);

  const handleUpdateSettings = (updates: Partial<AgentSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('agy_mobile_settings', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleOpenArtifact = (name: string) => {
    setSelectedArtifactName(name);
    setActiveTab('artifacts');
  };

  const handleScannedPairData = (url: string, token?: string) => {
    // If it is a Google Antigravity Remote URL or web URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      setLiveRemoteUrl(url);
      try {
        localStorage.setItem('agy_live_remote_url', url);
      } catch (e) {}
      return;
    }

    // Otherwise connect to WebSocket Bridge
    const newProfile = bridgeClient.addProfile({
      name: 'Scanned Host',
      url,
      token,
      lastConnected: 'Just now'
    });
    bridgeClient.connectToProfile(newProfile.id);
  };

  // If active Google Antigravity Remote session is loaded
  if (liveRemoteUrl) {
    return (
      <>
        <LiveRemoteView
          remoteUrl={liveRemoteUrl}
          onExit={() => setLiveRemoteUrl(null)}
          onOpenScanner={() => setIsQRModalOpen(true)}
          hapticsEnabled={settings.hapticsEnabled}
        />
        <QRScannerModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          onScannedData={handleScannedPairData}
          currentHostUrl={liveRemoteUrl}
          hapticsEnabled={settings.hapticsEnabled}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background select-none text-gray-100 overflow-hidden">
      {/* Top Header */}
      <HeaderBar
        status={status}
        latency={latency}
        activeProfile={activeProfile}
        model={settings.model}
        onOpenConnect={() => setIsConnectModalOpen(true)}
        onOpenQR={() => setIsQRModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hapticsEnabled={settings.hapticsEnabled}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'chat' && (
          <ChatCanvas
            messages={messages}
            onSendMessage={(content) => bridgeClient.sendMessage(content, settings)}
            settings={settings}
            onOpenArtifact={handleOpenArtifact}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalCenter
            approvals={approvals}
            onApprove={(id) => bridgeClient.approveTool(id)}
            onReject={(id) => bridgeClient.rejectTool(id)}
            settings={settings}
          />
        )}

        {activeTab === 'terminal' && (
          <TerminalConsole
            lines={terminalLines}
            onSendCommand={(cmd) => bridgeClient.sendTerminalInput(cmd)}
            settings={settings}
          />
        )}

        {activeTab === 'subagents' && (
          <SubagentMonitor
            subagents={subagents}
            scheduledTasks={scheduledTasks}
            onKillSubagent={(id) => bridgeClient.killSubagent(id)}
            onCancelTask={(id) => bridgeClient.cancelTask(id)}
            onSpawnSubagent={(typeName, role) => {
              bridgeClient.sendMessage(`/spawn ${typeName} ${role}`, settings);
            }}
            settings={settings}
          />
        )}

        {activeTab === 'artifacts' && (
          <ArtifactViewer
            artifacts={artifacts}
            selectedArtifactName={selectedArtifactName}
            settings={settings}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApprovalsCount={approvals.length}
        activeSubagentsCount={subagents.filter((s) => s.state === 'running').length}
        hapticsEnabled={settings.hapticsEnabled}
      />

      {/* PWA Install Banner */}
      <PWAInstallPrompt
        hapticsEnabled={settings.hapticsEnabled}
      />

      {/* Modals & Drawers */}
      <ConnectionModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        profiles={profiles}
        activeProfile={activeProfile}
        status={status}
        onSelectProfile={(id) => {
          bridgeClient.connectToProfile(id);
          setIsConnectModalOpen(false);
        }}
        onAddProfile={(p) => bridgeClient.addProfile(p)}
        onRemoveProfile={(id) => bridgeClient.removeProfile(id)}
        onOpenQR={() => {
          setIsConnectModalOpen(false);
          setIsQRModalOpen(true);
        }}
        hapticsEnabled={settings.hapticsEnabled}
      />

      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onScannedData={handleScannedPairData}
        currentHostUrl={activeProfile.url}
        currentToken={activeProfile.token}
        hapticsEnabled={settings.hapticsEnabled}
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onClearChat={() => bridgeClient.clearChat()}
      />

      <PWAInstallPrompt
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        hapticsEnabled={settings.hapticsEnabled}
      />
    </div>
  );
};
export default App;
