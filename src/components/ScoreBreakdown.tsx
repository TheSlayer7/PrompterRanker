import React from 'react';
import type { PromptScore, ScoringCriterion } from '../types/prompt';
import { Sliders, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';

interface ScoreBreakdownProps {
  score: PromptScore;
  onApplySuggestion?: (suggestionId: string) => void;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ score, onApplySuggestion }) => {
  const criteriaList: ScoringCriterion[] = Object.values(score.criteria);

  const getStatusColor = (status: ScoringCriterion['status']) => {
    switch (status) {
      case 'excellent':
        return '#10b981';
      case 'good':
        return '#06b6d4';
      case 'fair':
        return '#f59e0b';
      case 'poor':
        return '#f43f5e';
    }
  };

  return (
    <div className="glass-card" id="score-breakdown-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="editor-header">
        <div className="editor-title-wrap">
          <Sliders size={18} color="var(--emerald)" />
          <h2 className="section-title">Criteria Breakdown & Heuristics</h2>
        </div>
      </div>

      {/* Progress Bars for Each Criterion */}
      <div className="criteria-list">
        {criteriaList.map((criterion) => {
          const color = getStatusColor(criterion.status);
          return (
            <div key={criterion.id} className="criterion-item">
              <div className="criterion-top">
                <div className="criterion-name-wrap">
                  <span className="criterion-name">{criterion.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    (Weight: {criterion.weight}%)
                  </span>
                </div>
                <span
                  className="criterion-score-badge"
                  style={{
                    background: `${color}20`,
                    color: color,
                    border: `1px solid ${color}40`,
                  }}
                >
                  {criterion.score}/100
                </span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${criterion.score}%`,
                    background: color,
                    boxShadow: `0 0 8px ${color}60`,
                  }}
                />
              </div>

              <p className="criterion-feedback">{criterion.feedback}</p>
            </div>
          );
        })}
      </div>

      {/* Detected Filler Words Warning */}
      {score.detectedFillerWords.length > 0 && (
        <div style={{
          padding: '14px 16px',
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fb7185', fontWeight: 600, fontSize: '0.88rem' }}>
            <Flame size={16} />
            <span>Conversational Filler Words Detected</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            LLMs do not need human pleasantries. The phrases below consume input context and slow down generation:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {score.detectedFillerWords.map((item, idx) => (
              <span
                key={idx}
                style={{
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  color: '#fda4af',
                  textDecoration: 'line-through',
                }}
              >
                "{item.phrase}" ({item.count}x / ~{item.tokenImpact} tokens)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions List */}
      {score.suggestions.length > 0 && (
        <div>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color="var(--amber)" />
            <span>High-Impact Recommendations</span>
          </h3>
          <div className="suggestions-list">
            {score.suggestions.map((sug) => (
              <div key={sug.id} className={`suggestion-card ${sug.severity}`}>
                <div className="suggestion-header">
                  <span className="suggestion-title">{sug.title}</span>
                  {sug.tokenSavingsEstimate && (
                    <span className="token-save-badge">
                      Save ~{sug.tokenSavingsEstimate} tokens
                    </span>
                  )}
                </div>
                <p className="suggestion-desc">{sug.description}</p>
                {onApplySuggestion && ['remove-filler', 'add-delimiters', 'add-role', 'add-constraints', 'add-output-spec'].includes(sug.id) && (
                  <button className="btn btn-secondary btn-sm suggestion-action" onClick={() => onApplySuggestion(sug.id)}>
                    Apply suggestion
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths checklist */}
      {score.strengths.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} color="var(--emerald)" />
            <span>Prompt Strengths</span>
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {score.strengths.map((str, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ color: 'var(--emerald)' }}>✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
