import React, { useState } from 'react';
import { Wand2, Check, Copy, Sparkles, CheckCircle2 } from 'lucide-react';
import type { OptimizationResult } from '../types/prompt';

interface PromptOptimizerProps {
  optimization: OptimizationResult;
  originalScore: number;
  optimizedScore: number;
  onApply: (optimizedText: string) => void;
}

export const PromptOptimizer: React.FC<PromptOptimizerProps> = ({
  optimization,
  originalScore,
  optimizedScore,
  onApply,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(optimization.optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasTextChange = optimization.optimizedPrompt !== optimization.originalPrompt;
  const hasTokenReduction = optimization.tokensSaved > 0;

  return (
    <div className="glass-card optimizer-view" id="prompt-optimizer-card">
      <div className="editor-header">
        <div className="editor-title-wrap">
          <Wand2 size={18} color="var(--cyan)" />
          <h2 className="section-title">1-Click Token Optimizer & Diff View</h2>
        </div>

        <div className="editor-actions">
          <button
            className="btn btn-secondary"
            onClick={handleCopy}
            disabled={!optimization.optimizedPrompt}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Optimized'}</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => onApply(optimization.optimizedPrompt)}
            disabled={!hasTokenReduction}
          >
            <Sparkles size={14} />
            <span>{hasTokenReduction ? 'Apply to Editor' : 'No token reduction'}</span>
          </button>
        </div>
      </div>

      {/* Savings Metric Banner */}
      <div className="savings-banner">
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Token Efficiency Gain
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2 }}>
            <span className="savings-stat">
              {hasTokenReduction
                ? `-${optimization.tokensSaved} Tokens (${optimization.percentageSaved}% Saved)`
                : hasTextChange
                  ? 'Text cleaned, no token reduction'
                  : 'No safe changes detected'}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ({optimization.originalTokens} → {optimization.optimizedTokens} tokens)
            </span>
          </div>
          <div className="optimizer-score-result">
            <span>Score</span>
            <strong>{originalScore} → {optimizedScore}</strong>
            <span className={optimizedScore >= originalScore ? 'score-improved' : 'score-neutral'}>
              {optimizedScore > originalScore
                ? `+${optimizedScore - originalScore}`
                : optimizedScore === originalScore
                  ? 'unchanged'
                  : `${optimizedScore - originalScore}`}
            </span>
          </div>
          {optimization.strategy && (
            <div className="optimizer-strategy">
              Strategy: <strong>{optimization.strategy}</strong>
              {optimization.qualityScore !== undefined && ` · Quality ${optimization.qualityScore}/100`}
            </div>
          )}
        </div>

        <p className="optimizer-method-note">
          Local candidate optimizer: generates conservative rewrites, measures exact tokenizer savings and quality, then rejects candidates that add tokens or materially lower quality. No external AI service is used.
        </p>

        {optimization.improvements.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {optimization.improvements.map((imp, idx) => (
              <span key={idx} style={{ fontSize: '0.78rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={13} color="#10b981" />
                {imp.description}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Side-by-Side Diff Grid */}
      <div className="diff-grid">
        <div className="diff-box">
          <div className="diff-box-header">
            <span style={{ fontWeight: 600 }}>Original Prompt</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--rose)' }}>
              {optimization.originalTokens} tokens
            </span>
          </div>
          <div className="diff-content" style={{ opacity: 0.85 }}>
            {optimization.originalPrompt || '(No prompt entered)'}
          </div>
        </div>

        <div className="diff-box" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <div className="diff-box-header">
            <span style={{ fontWeight: 600, color: '#34d399' }}>Optimized Prompt</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#34d399' }}>
              {optimization.optimizedTokens} tokens
            </span>
          </div>
          <div className="diff-content">
            {optimization.optimizedPrompt || '(No prompt entered)'}
          </div>
        </div>
      </div>
    </div>
  );
};
