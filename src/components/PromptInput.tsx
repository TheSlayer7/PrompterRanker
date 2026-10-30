import React from 'react';
import { Trash2, Wand2, Copy, Check, FileText } from 'lucide-react';
import type { ModelConfig } from '../types/prompt';

interface PromptInputProps {
  prompt: string;
  onChange: (value: string) => void;
  tokenCount: number;
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  tokensPerWord: number;
  currentModel: ModelConfig;
  tokensSaved?: number;
  onOptimizeClick: () => void;
  onClear: () => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  onChange,
  tokenCount,
  wordCount,
  charCount,
  sentenceCount,
  tokensPerWord,
  currentModel,
  tokensSaved = 0,
  onOptimizeClick,
  onClear,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card" id="prompt-editor-card">
      <div className="editor-header">
        <div className="editor-title-wrap">
          <FileText size={16} color="var(--primary)" />
          <div>
            <h2 className="section-title">Your prompt</h2>
            <p className="section-helper">Write what you want the AI to do, then review the results on the right.</p>
          </div>
        </div>

        <div className="editor-actions">
          <button
            id="btn-copy-prompt"
            className="btn btn-ghost btn-sm"
            onClick={handleCopy}
            disabled={!prompt}
            title="Copy prompt to clipboard"
          >
            {copied ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            id="btn-clear-prompt"
            className="btn btn-ghost btn-sm"
            onClick={onClear}
            disabled={!prompt}
            title="Clear prompt"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>

          <button
            id="btn-optimize-action"
            className="btn btn-primary btn-sm"
            onClick={onOptimizeClick}
            disabled={!prompt || tokensSaved === 0}
            title={tokensSaved > 0 ? `Review optimization to save ${tokensSaved} tokens` : 'No safe token reduction detected'}
          >
            <Wand2 size={14} />
            <span>{tokensSaved > 0 ? `Review Optimize (-${tokensSaved} Tok)` : 'Already Efficient'}</span>
          </button>
        </div>
      </div>

      <textarea
        id="prompt-input-textarea"
        className="prompt-textarea"
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste or type your prompt here..."
        spellCheck="false"
      />

      <div className="editor-footer">
        <div className="stats-chips">
          <div className="stat-chip" title="Calculated tokens for current model">
            <span>Tokens ({currentModel.name}):</span>
            <strong>{tokenCount.toLocaleString()}</strong>
          </div>
          <div className="stat-chip">
            <span>Words:</span>
            <strong>{wordCount.toLocaleString()}</strong>
          </div>
          <div className="stat-chip">
            <span>Chars:</span>
            <strong>{charCount.toLocaleString()}</strong>
          </div>
          <div className="stat-chip">
            <span>Sentences:</span>
            <strong>{sentenceCount.toLocaleString()}</strong>
          </div>
          <div className="stat-chip">
            <span>Tok/Word:</span>
            <strong>{tokensPerWord}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
