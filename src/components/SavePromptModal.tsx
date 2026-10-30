import React, { useState } from 'react';
import { Bookmark, X, Check } from 'lucide-react';
import type { Grade } from '../types/prompt';

interface SavePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, category: string) => void;
  currentPrompt: string;
  score: number;
  grade: Grade;
  tokenCount: number;
}

export const SavePromptModal: React.FC<SavePromptModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentPrompt,
  score,
  grade,
  tokenCount,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('System Prompts');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), category);
    setTitle('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content save-modal">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bookmark size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Save Prompt to Library
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Prompt Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Production Support Classifier"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="System Prompts">System Prompts</option>
                <option value="Coding & Engineering">Coding & Engineering</option>
                <option value="RAG & Retrieval">RAG & Retrieval</option>
                <option value="Security & Guardrails">Security & Guardrails</option>
                <option value="Agentic & Tool Calling">Agentic & Tool Calling</option>
                <option value="Creative & Writing">Creative & Writing</option>
              </select>
            </div>

            {/* Quick stats snapshot */}
            <div className="save-snapshot-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span>Quality Score: <strong style={{ color: 'var(--primary)' }}>{score}/100 ({grade})</strong></span>
                <span>Tokens: <strong style={{ color: 'var(--text-main)' }}>{tokenCount}</strong></span>
              </div>
              <div className="snippet-preview">
                {currentPrompt.slice(0, 120)}...
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={!title.trim()}>
              <Check size={14} />
              <span>Save Blueprint</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

