import React, { useState } from 'react';
import { FileText, Copy, Check, Share2, Layers, BookOpen, Download } from 'lucide-react';
import { ArtifactFile, AgentSettings } from '../types/antigravity';
import { triggerHaptic } from '../services/haptics';

interface ArtifactViewerProps {
  artifacts: ArtifactFile[];
  selectedArtifactName?: string | null;
  settings: AgentSettings;
}

export const ArtifactViewer: React.FC<ArtifactViewerProps> = ({
  artifacts,
  selectedArtifactName,
  settings
}) => {
  const [activeId, setActiveId] = useState<string>(() => {
    if (selectedArtifactName) {
      const match = artifacts.find((a) => a.name === selectedArtifactName);
      if (match) return match.id;
    }
    return artifacts[0]?.id || '';
  });

  const [copied, setCopied] = useState(false);

  const activeArtifact = artifacts.find((a) => a.id === activeId) || artifacts[0];

  const handleCopy = () => {
    if (!activeArtifact) return;
    triggerHaptic('light', settings.hapticsEnabled);
    navigator.clipboard.writeText(activeArtifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!activeArtifact) return;
    triggerHaptic('light', settings.hapticsEnabled);
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeArtifact.name,
          text: activeArtifact.content
        });
      } catch {
        // Ignored
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden pb-20">
      {/* Horizontal Tabs */}
      <div className="px-3 py-2 bg-surface-card border-b border-surface-border flex items-center gap-2 overflow-x-auto no-scrollbar">
        {artifacts.map((art) => {
          const isSelected = activeArtifact?.id === art.id;
          return (
            <button
              key={art.id}
              onClick={() => {
                triggerHaptic('light', settings.hapticsEnabled);
                setActiveId(art.id);
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all active:scale-95 ${
                isSelected
                  ? 'bg-indigo-600 text-white font-semibold shadow-md'
                  : 'bg-surface-subtle text-gray-300 hover:text-white border border-surface-border'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{art.name}</span>
            </button>
          );
        })}
      </div>

      {/* Artifact Content Area */}
      {activeArtifact ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
          {/* Header Card */}
          <div className="bg-surface border border-surface-border rounded-2xl p-3.5 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-sky-400 font-semibold truncate">
                {activeArtifact.path}
              </span>
              <span className="text-[10px] text-gray-400">{activeArtifact.updatedAt}</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{activeArtifact.summary}</p>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-surface-border">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] bg-surface-subtle border border-surface-border text-gray-200 px-2.5 py-1 rounded-lg active:scale-95"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-[11px] bg-surface-subtle border border-surface-border text-gray-200 px-2.5 py-1 rounded-lg active:scale-95"
              >
                <Share2 className="w-3 h-3" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Formatted Markdown Content */}
          <div className="bg-surface/60 border border-surface-border rounded-2xl p-4 font-sans text-xs text-gray-200 leading-relaxed space-y-3">
            <pre className="whitespace-pre-wrap font-sans text-xs text-gray-200">
              {activeArtifact.content}
            </pre>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
          <BookOpen className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs">No artifacts generated yet</p>
        </div>
      )}
    </div>
  );
};
