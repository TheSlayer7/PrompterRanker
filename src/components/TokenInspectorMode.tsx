import React, { useState, useMemo } from 'react';
import {
  Search,
  Copy,
  Check,
  Hash,
  Eye,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  Trash2,
} from 'lucide-react';
import type { ModelConfig, ModelId, NamingStyle, TokenChunk } from '../types/prompt';
import { SUPPORTED_MODELS, getModelDisplayName } from '../services/models';
import { tokenizeText } from '../services/tokenizer';

interface TokenInspectorModeProps {
  initialPrompt: string;
  currentModel: ModelConfig;
  onSelectModel: (modelId: ModelId) => void;
  namingStyle: NamingStyle;
  onSendToStudio: (prompt: string) => void;
}

export const TokenInspectorMode: React.FC<TokenInspectorModeProps> = ({
  initialPrompt,
  currentModel,
  onSelectModel,
  namingStyle,
  onSendToStudio,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenChunk | null>(null);
  const [showWhitespaceSymbols, setShowWhitespaceSymbols] = useState(true);
  const [copiedTokens, setCopiedTokens] = useState(false);
  const [isCompactPills, setIsCompactPills] = useState(false);

  // Active tokenization for currently selected model
  const tokenChunks = useMemo(() => {
    return tokenizeText(prompt, currentModel);
  }, [prompt, currentModel]);

  // Real-time token counts across all supported models
  const crossModelStats = useMemo(() => {
    if (!prompt.trim()) return [];
    return SUPPORTED_MODELS.map((m) => {
      const chunks = tokenizeText(prompt, m);
      const count = chunks.length;
      const costPer10k = ((count / 1_000_000) * m.inputPricePerMillion * 10_000).toFixed(4);
      return {
        model: m,
        count,
        costPer10k,
        isCurrent: m.id === currentModel.id,
      };
    });
  }, [prompt, currentModel.id]);

  // Filtered tokens
  const filteredTokens = useMemo(() => {
    if (!searchTerm.trim()) return tokenChunks;
    const term = searchTerm.toLowerCase();
    return tokenChunks.filter(
      (t) =>
        t.text.toLowerCase().includes(term) ||
        t.id.toString().includes(term) ||
        t.index.toString() === term
    );
  }, [tokenChunks, searchTerm]);

  // Aggregate metrics
  const uniqueTokenIds = useMemo(() => {
    return new Set(tokenChunks.map((t) => t.id)).size;
  }, [tokenChunks]);

  const totalBytes = useMemo(() => {
    return tokenChunks.reduce((acc, t) => acc + t.byteLength, 0);
  }, [tokenChunks]);

  const avgBytesPerToken = tokenChunks.length > 0 ? (totalBytes / tokenChunks.length).toFixed(2) : '0';

  const wordCount = useMemo(() => {
    return prompt.trim() ? prompt.trim().split(/\s+/).filter(Boolean).length : 0;
  }, [prompt]);

  const tokensPerWord = wordCount > 0 ? (tokenChunks.length / wordCount).toFixed(2) : '0';

  const handleCopyTokenIds = async () => {
    if (tokenChunks.length === 0) return;
    const idsString = JSON.stringify(tokenChunks.map((t) => t.id));
    await navigator.clipboard.writeText(idsString);
    setCopiedTokens(true);
    setTimeout(() => setCopiedTokens(false), 2000);
  };

  // Convert string piece to UTF-8 hex
  const getHexRepresentation = (str: string) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    return Array.from(bytes)
      .map((b) => '0x' + b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
  };

  const renderTokenText = (chunk: TokenChunk) => {
    const { text } = chunk;
    if (showWhitespaceSymbols) {
      const parts = text.split(/(\r\n|\n|\r| )/);
      return parts.map((part, idx) => {
        if (part === ' ') {
          return <span key={idx} className="token-space-glyph" title="Space">·</span>;
        }
        if (part === '\n' || part === '\r\n') {
          return <span key={idx} className="token-newline-glyph" title="Newline">↵<br /></span>;
        }
        return <span key={idx}>{part}</span>;
      });
    }
    return <span>{text}</span>;
  };

  return (
    <div className="token-inspector-page">
      {/* Top Banner / Mode Intro */}
      <div className="mode-hero-header">
        <div>
          <h2 className="mode-title">
            <Hash size={20} color="var(--cyan)" />
            Token Inspector & Multi-Model Engine
          </h2>
          <p className="mode-subtitle">
            Inspect exact token boundaries, byte representations, and compare multi-tokenizer counts across frontier architectures.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onSendToStudio(prompt)}
            disabled={!prompt.trim()}
            title="Send this prompt to Studio for scoring and optimization"
          >
            <Sparkles size={14} />
            <span>Open in Studio</span>
          </button>
        </div>
      </div>

      {/* Editor & Primary Input */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Prompt Input</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ({wordCount.toLocaleString()} words · {prompt.length.toLocaleString()} chars · {tokensPerWord} tokens/word)
            </span>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setPrompt('');
              setSelectedToken(null);
            }}
            disabled={!prompt}
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>

        <textarea
          className="prompt-textarea"
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste or type any text to immediately inspect token chunks, multi-model counts, and byte details..."
          spellCheck="false"
        />

        {/* Aggregate Quick Stats Row */}
        <div className="inspector-stats-row">
          <div className="stat-chip">
            <span>Current Model:</span>
            <strong style={{ color: currentModel.badgeColor }}>
              {getModelDisplayName(currentModel, namingStyle)}
            </strong>
          </div>
          <div className="stat-chip">
            <span>Tokens:</span>
            <strong style={{ color: 'var(--cyan)' }}>{tokenChunks.length.toLocaleString()}</strong>
          </div>
          <div className="stat-chip">
            <span>Unique IDs:</span>
            <strong>{uniqueTokenIds.toLocaleString()}</strong>
          </div>
          <div className="stat-chip">
            <span>Total Bytes:</span>
            <strong>{totalBytes.toLocaleString()} B</strong>
          </div>
          <div className="stat-chip">
            <span>Avg Bytes/Token:</span>
            <strong>{avgBytesPerToken}</strong>
          </div>
        </div>
      </div>

      {/* Cross-Model Token Matrix */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={16} color="var(--purple)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Cross-Model Tokenizer Matrix
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Comparing real token counts and cost per 10k runs
          </span>
        </div>

        <div className="matrix-grid">
          {crossModelStats.map(({ model, count, costPer10k, isCurrent }) => {
            const diffPct =
              tokenChunks.length > 0
                ? (((count - tokenChunks.length) / tokenChunks.length) * 100).toFixed(1)
                : '0.0';
            const isMore = Number(diffPct) > 0;
            const isLess = Number(diffPct) < 0;

            return (
              <div
                key={model.id}
                className={`matrix-card ${isCurrent ? 'active-model-card' : ''}`}
                onClick={() => onSelectModel(model.id)}
                title="Click to set as active tokenizer"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span className="matrix-model-name" style={{ color: model.badgeColor }}>
                    {getModelDisplayName(model, namingStyle)}
                  </span>
                  {isCurrent && <span className="active-badge">Active</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <span className="matrix-token-count">{count.toLocaleString()}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>tokens</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  <span>Cost (10k runs):</span>
                  <strong style={{ color: 'var(--text-main)' }}>${costPer10k}</strong>
                </div>

                {!isCurrent && tokenChunks.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: '0.7rem' }}>
                    <span
                      style={{
                        color: isLess ? 'var(--emerald)' : isMore ? 'var(--rose)' : 'var(--text-muted)',
                      }}
                    >
                      {isLess ? `▼ ${diffPct}% fewer` : isMore ? `▲ +${diffPct}% more` : 'Identical count'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Token Stream & Inspector */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div className="token-stream-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 360 }}>
            <div className="search-input-wrap" style={{ width: '100%' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search token text, ID, or index..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className={`btn btn-secondary btn-sm ${showWhitespaceSymbols ? 'active' : ''}`}
              onClick={() => setShowWhitespaceSymbols(!showWhitespaceSymbols)}
              title="Toggle visual whitespace characters (· for space, ↵ for newline)"
            >
              <span>{showWhitespaceSymbols ? 'Glyphs: ON' : 'Glyphs: OFF'}</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsCompactPills(!isCompactPills)}
              title="Toggle compact pills"
            >
              {isCompactPills ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              <span>{isCompactPills ? 'Spacious' : 'Compact'}</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCopyTokenIds}
              disabled={tokenChunks.length === 0}
              title="Copy token IDs as a JSON array"
            >
              {copiedTokens ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
              <span>{copiedTokens ? 'Copied Array' : 'Copy IDs'}</span>
            </button>
          </div>
        </div>

        {/* Pill Stream */}
        <div className={`token-pills-stream ${isCompactPills ? 'compact' : ''}`}>
          {tokenChunks.length === 0 ? (
            <div className="empty-state-notice">
              <Eye size={24} color="var(--text-muted)" />
              <p>Type or paste text above to see visual token chunks.</p>
            </div>
          ) : (
            filteredTokens.map((chunk) => {
              const isSelected = selectedToken?.index === chunk.index;
              return (
                <button
                  key={`${chunk.index}-${chunk.id}`}
                  className={`token-pill ${chunk.colorClass} ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedToken(chunk)}
                  title={`Token #${chunk.index} | ID: ${chunk.id} | Bytes: ${chunk.byteLength}`}
                >
                  <span className="token-index-label">#{chunk.index}</span>
                  {renderTokenText(chunk)}
                </button>
              );
            })
          )}
        </div>

        {/* Selected Token Inspector Drawer */}
        {selectedToken && (
          <div className="token-detail-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Info size={16} color="var(--cyan)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Token Inspector (Chunk #{selectedToken.index})
                </span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedToken(null)}
              >
                Close
              </button>
            </div>

            <div className="token-detail-grid">
              <div className="token-detail-cell">
                <span className="detail-label">Text Representation</span>
                <span className="detail-value mono-preview">
                  {selectedToken.text === ' ' ? '· (Space)' : selectedToken.text === '\n' ? '↵ (Newline)' : `"${selectedToken.text}"`}
                </span>
              </div>
              <div className="token-detail-cell">
                <span className="detail-label">Token ID</span>
                <span className="detail-value" style={{ color: 'var(--cyan)' }}>
                  {selectedToken.id}
                </span>
              </div>
              <div className="token-detail-cell">
                <span className="detail-label">Byte Length</span>
                <span className="detail-value">{selectedToken.byteLength} bytes</span>
              </div>
              <div className="token-detail-cell">
                <span className="detail-label">Character Bounds</span>
                <span className="detail-value">
                  [{selectedToken.charStart} → {selectedToken.charEnd}] ({selectedToken.text.length} chars)
                </span>
              </div>
              <div className="token-detail-cell" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">UTF-8 Hex Representation</span>
                <span className="detail-value mono-preview" style={{ fontSize: '0.75rem' }}>
                  {getHexRepresentation(selectedToken.text)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

