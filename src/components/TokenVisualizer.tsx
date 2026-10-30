import React, { useState, useMemo } from 'react';
import { Eye, Search, Copy, Check, List, LayoutGrid, Info } from 'lucide-react';
import type { TokenChunk, ModelConfig } from '../types/prompt';

interface TokenVisualizerProps {
  tokens: TokenChunk[];
  currentModel: ModelConfig;
}

export const TokenVisualizer: React.FC<TokenVisualizerProps> = ({ tokens, currentModel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenChunk | null>(null);
  const [showWhitespaceSymbols, setShowWhitespaceSymbols] = useState(true);
  const [viewMode, setViewMode] = useState<'pills' | 'table'>('pills');
  const [copiedTokens, setCopiedTokens] = useState(false);

  // Filtered tokens based on search
  const filteredTokens = useMemo(() => {
    if (!searchTerm.trim()) return tokens;
    const term = searchTerm.toLowerCase();
    return tokens.filter(
      (t) =>
        t.text.toLowerCase().includes(term) ||
        t.id.toString().includes(term) ||
        t.index.toString() === term
    );
  }, [tokens, searchTerm]);

  // Unique tokens count
  const uniqueTokenIds = useMemo(() => {
    return new Set(tokens.map((t) => t.id)).size;
  }, [tokens]);

  const avgBytesPerToken = useMemo(() => {
    if (tokens.length === 0) return 0;
    const totalBytes = tokens.reduce((acc, t) => acc + t.byteLength, 0);
    return (totalBytes / tokens.length).toFixed(2);
  }, [tokens]);

  const handleCopyTokenIds = async () => {
    if (tokens.length === 0) return;
    const idsString = JSON.stringify(tokens.map((t) => t.id));
    await navigator.clipboard.writeText(idsString);
    setCopiedTokens(true);
    setTimeout(() => setCopiedTokens(false), 2000);
  };

  // Render friendly visual token text
  const renderTokenText = (chunk: TokenChunk) => {
    const { text } = chunk;
    if (showWhitespaceSymbols) {
      // Replace leading spaces, newlines with visual indicators
      const parts = text.split(/(\r\n|\n|\r| )/);
      return parts.map((part, idx) => {
        if (part === ' ') {
          return <span key={idx} className="token-space-glyph" title="Space">·</span>;
        }
        if (part === '\n' || part === '\r\n') {
          return <span key={idx} className="token-newline-glyph" title="Newline">↵<br /></span>;
        }
        return part;
      });
    }
    return text;
  };

  return (
    <div className="glass-card token-visualizer-container" id="token-visualizer-card">
      <div className="editor-header">
        <div className="editor-title-wrap">
          <Eye size={18} color="var(--cyan)" />
          <h2 className="section-title">Visual Tokenizer & Chunk Inspector</h2>
        </div>

        <div className="editor-actions">
          <button
            className={`btn ${viewMode === 'pills' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
            onClick={() => setViewMode('pills')}
            title="Visual Pill Chunks"
          >
            <LayoutGrid size={14} />
            <span>Pills</span>
          </button>
          <button
            className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
            onClick={() => setViewMode('table')}
            title="Token Stream Table"
          >
            <List size={14} />
            <span>Table</span>
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
            onClick={handleCopyTokenIds}
            disabled={tokens.length === 0}
            title="Copy token IDs as JSON array"
          >
            {copiedTokens ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copiedTokens ? 'IDs Copied' : 'Copy Token IDs'}</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="visualizer-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="token-search-input"
              style={{ paddingLeft: 30 }}
              placeholder="Search token text or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showWhitespaceSymbols}
              onChange={(e) => setShowWhitespaceSymbols(e.target.checked)}
            />
            Show space symbols (· / ↵)
          </label>
        </div>

        <div className="stats-chips">
          <div className="stat-chip">
            <span>Vocabulary:</span>
            <strong>{currentModel.family}</strong>
          </div>
          <div className="stat-chip">
            <span>Total Tokens:</span>
            <strong>{tokens.length}</strong>
          </div>
          <div className="stat-chip">
            <span>Unique:</span>
            <strong>{uniqueTokenIds}</strong>
          </div>
          <div className="stat-chip">
            <span>Avg Bytes/Token:</span>
            <strong>{avgBytesPerToken}B</strong>
          </div>
        </div>
      </div>

      {/* Selected Token Inspector */}
      {selectedToken && (
        <div className="token-inspector-panel">
          <div className="inspector-field">
            <label>Token Index</label>
            <span>#{selectedToken.index}</span>
          </div>
          <div className="inspector-field">
            <label>Token ID</label>
            <span>{selectedToken.id}</span>
          </div>
          <div className="inspector-field">
            <label>Decoded String</label>
            <span style={{ color: '#ffffff' }}>"{selectedToken.text}"</span>
          </div>
          <div className="inspector-field">
            <label>Byte Length</label>
            <span>{selectedToken.byteLength} byte(s)</span>
          </div>
          <div className="inspector-field">
            <label>Character Range</label>
            <span>{selectedToken.charStart} – {selectedToken.charEnd}</span>
          </div>
          <div className="inspector-field">
            <label>Hex UTF-8</label>
            <span>
              {Array.from(new TextEncoder().encode(selectedToken.text))
                .map((b) => '0x' + b.toString(16).padStart(2, '0'))
                .join(' ')}
            </span>
          </div>
          <button
            className="btn btn-ghost"
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
            onClick={() => setSelectedToken(null)}
          >
            Close
          </button>
        </div>
      )}

      {/* Visual Token Stream */}
      {tokens.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <Info size={28} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
          <p>No prompt entered yet. Type or paste your prompt above to see color-coded visual token chunks.</p>
        </div>
      ) : viewMode === 'pills' ? (
        <div className="token-pills-stream" id="token-pills-container">
          {filteredTokens.map((chunk) => {
            const isSelected = selectedToken?.index === chunk.index;
            return (
              <span
                key={chunk.index}
                className={`token-pill ${chunk.colorClass} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedToken(chunk)}
                title={`Token #${chunk.index} | ID: ${chunk.id} | Bytes: ${chunk.byteLength}\nClick to inspect`}
              >
                {renderTokenText(chunk)}
              </span>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          <table className="cost-table">
            <thead>
              <tr>
                <th>Index</th>
                <th>Token ID</th>
                <th>Token Text</th>
                <th>Bytes</th>
                <th>Char Range</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens.map((chunk) => (
                <tr key={chunk.index}>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>#{chunk.index}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>{chunk.id}</td>
                  <td>
                    <span className={`token-pill ${chunk.colorClass}`} style={{ fontSize: '0.82rem' }}>
                      {renderTokenText(chunk)}
                    </span>
                  </td>
                  <td>{chunk.byteLength}B</td>
                  <td style={{ color: 'var(--text-muted)' }}>{chunk.charStart}..{chunk.charEnd}</td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                      onClick={() => setSelectedToken(chunk)}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
