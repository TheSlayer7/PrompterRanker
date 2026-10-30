import React from 'react';
import {
  History,
  Trash2,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
} from 'lucide-react';
import type { HistoryEntry } from '../types/prompt';

interface AuditHistoryPageProps {
  history: HistoryEntry[];
  onLoadPrompt: (promptText: string) => void;
  onClearHistory: () => void;
}

export const AuditHistoryPage: React.FC<AuditHistoryPageProps> = ({
  history,
  onLoadPrompt,
  onClearHistory,
}) => {
  return (
    <div className="audit-history-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-section-title">Audit History & Prompt Timeline</h2>
          <p className="page-section-subtitle">
            Timeline of previously evaluated prompts, scoring performance, and token counts.
          </p>
        </div>

        {history.length > 0 && (
          <button className="btn btn-secondary btn-sm danger" onClick={onClearHistory}>
            <Trash2 size={13} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state-card">
          <History size={32} color="var(--text-muted)" />
          <h3>No evaluation history yet</h3>
          <p>As you type and score prompts in the Prompt Studio, evaluation snapshots will appear here automatically.</p>
        </div>
      ) : (
        <div className="history-timeline">
          {history.map((entry) => (
            <div key={entry.id} className="history-card">
              <div className="history-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    className="history-grade-badge"
                    style={{
                      background: entry.score >= 80 ? 'rgba(16, 185, 129, 0.12)' : entry.score >= 60 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                      color: entry.score >= 80 ? 'var(--emerald)' : entry.score >= 60 ? 'var(--amber)' : 'var(--rose)',
                      borderColor: entry.score >= 80 ? 'rgba(16, 185, 129, 0.3)' : entry.score >= 60 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(244, 63, 94, 0.3)',
                    }}
                  >
                    {entry.letterGrade} ({entry.score}/100)
                  </span>

                  <span className="history-model-tag">
                    <Layers size={12} />
                    {entry.modelName}
                  </span>

                  <span className="history-tokens-tag">
                    {entry.tokenCount} tokens
                  </span>
                </div>

                <div className="history-time-wrap">
                  <Clock size={12} color="var(--text-muted)" />
                  <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="history-prompt-preview">
                <code>{entry.prompt}</code>
              </div>

              <div className="history-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onLoadPrompt(entry.prompt)}
                >
                  <Sparkles size={13} />
                  <span>Restore in Studio</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

