import React from 'react';
import { MessageSquare, ShieldAlert, Terminal, Cpu, FileText } from 'lucide-react';
import { triggerHaptic } from '../services/haptics';

export type ActiveTab = 'chat' | 'approvals' | 'terminal' | 'subagents' | 'artifacts';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingApprovalsCount: number;
  activeSubagentsCount: number;
  hapticsEnabled: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  activeSubagentsCount,
  hapticsEnabled
}) => {
  const tabs = [
    { id: 'chat' as ActiveTab, label: 'Chat', icon: MessageSquare },
    {
      id: 'approvals' as ActiveTab,
      label: 'Approvals',
      icon: ShieldAlert,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-500'
    },
    { id: 'terminal' as ActiveTab, label: 'Terminal', icon: Terminal },
    {
      id: 'subagents' as ActiveTab,
      label: 'Agents',
      icon: Cpu,
      badge: activeSubagentsCount > 0 ? activeSubagentsCount : undefined,
      badgeColor: 'bg-indigo-500'
    },
    { id: 'artifacts' as ActiveTab, label: 'Artifacts', icon: FileText }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-t border-surface-border pb-[env(safe-area-inset-bottom,8px)] pt-1.5 px-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light', hapticsEnabled);
                setActiveTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-brand-accent font-semibold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${tab.badgeColor} animate-pulse-subtle`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <div className="absolute -bottom-1 w-6 h-0.5 bg-brand-accent rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
