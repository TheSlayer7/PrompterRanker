import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Bookmark,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Plus,
  ArrowRight,
  Filter,
  Upload,
  Download,
} from 'lucide-react';
import type { PromptPreset, SavedPrompt } from '../types/prompt';
import { PROMPT_PRESETS } from '../services/presets';

interface PromptLibraryPageProps {
  savedPrompts: SavedPrompt[];
  onLoadPrompt: (promptText: string) => void;
  onDeleteSavedPrompt: (id: string) => void;
  onOpenSaveModal: () => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
}

export const PromptLibraryPage: React.FC<PromptLibraryPageProps> = ({
  savedPrompts,
  onLoadPrompt,
  onDeleteSavedPrompt,
  onOpenSaveModal,
  onExportBackup,
  onImportBackup,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'saved'>('presets');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Extract all categories
  const categories = useMemo(() => {
    const list = activeTab === 'presets' ? PROMPT_PRESETS : savedPrompts;
    const cats = Array.from(new Set(list.map((p) => p.category)));
    return ['All', ...cats];
  }, [activeTab, savedPrompts]);

  // Filtered lists
  const filteredPresets = useMemo(() => {
    return PROMPT_PRESETS.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prompt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const filteredSaved = useMemo(() => {
    return savedPrompts.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prompt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [savedPrompts, searchTerm, selectedCategory]);

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="library-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-section-title">Prompt Library & Production Blueprints</h2>
          <p className="page-section-subtitle">
            Curated battle-tested prompt templates and your personal saved prompt library.
          </p>
        </div>

        <div className="library-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={onExportBackup} disabled={savedPrompts.length === 0}>
            <Download size={14} />
            <span>Backup</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} />
            <span>Restore</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImportBackup(file);
              event.target.value = '';
            }}
          />
          <button className="btn btn-primary btn-sm" onClick={onOpenSaveModal}>
            <Plus size={14} />
            <span>Save Current Prompt</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter Toolbar */}
      <div className="library-toolbar">
        {/* Tab switch */}
        <div className="segmented-control">
          <button
            className={`segmented-item ${activeTab === 'presets' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('presets');
              setSelectedCategory('All');
            }}
          >
            <BookOpen size={14} />
            <span>Curated Blueprints ({PROMPT_PRESETS.length})</span>
          </button>

          <button
            className={`segmented-item ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('saved');
              setSelectedCategory('All');
            }}
          >
            <Bookmark size={14} />
            <span>My Saved Prompts ({savedPrompts.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="library-search-wrap">
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            className="search-input"
            placeholder="Search prompts by keyword, tag, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="library-category-pills">
        <Filter size={13} color="var(--text-muted)" />
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Presets View */}
      {activeTab === 'presets' && (
        <div className="prompts-grid">
          {filteredPresets.map((preset: PromptPreset) => (
            <div key={preset.id} className="prompt-card">
              <div className="prompt-card-top">
                <span className="prompt-cat-badge">{preset.category}</span>
                <button
                  className="btn-icon"
                  onClick={() => handleCopy(preset.id, preset.prompt)}
                  title="Copy Prompt"
                >
                  {copiedId === preset.id ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
                </button>
              </div>

              <h3 className="prompt-card-title">{preset.title}</h3>
              <p className="prompt-card-desc">{preset.description}</p>

              <div className="prompt-preview-snippet">
                <code>{preset.prompt.slice(0, 160)}...</code>
              </div>

              <div className="prompt-card-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onLoadPrompt(preset.prompt)}
                >
                  <Sparkles size={13} />
                  <span>Load in Studio</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Saved Prompts View */}
      {activeTab === 'saved' && (
        <div>
          {filteredSaved.length === 0 ? (
            <div className="empty-state-card">
              <Bookmark size={32} color="var(--text-muted)" />
              <h3>No saved prompts found</h3>
              <p>Save prompts from Prompt Studio to organize your personal engineering templates.</p>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={onOpenSaveModal}>
                <Plus size={14} />
                <span>Save a Prompt Now</span>
              </button>
            </div>
          ) : (
            <div className="prompts-grid">
              {filteredSaved.map((item: SavedPrompt) => (
                <div key={item.id} className="prompt-card">
                  <div className="prompt-card-top">
                    <span className="prompt-cat-badge">{item.category}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn-icon"
                        onClick={() => handleCopy(item.id, item.prompt)}
                        title="Copy Prompt"
                      >
                        {copiedId === item.id ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => onDeleteSavedPrompt(item.id)}
                        title="Delete Prompt"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="prompt-card-title">{item.title}</h3>

                  <div className="saved-meta-row">
                    <span className="saved-grade-pill">{item.letterGrade} ({item.score}/100)</span>
                    <span className="saved-token-count">{item.tokenCount} tokens</span>
                    <span className="saved-date">
                      v{item.version ?? 1} · {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="prompt-preview-snippet">
                    <code>{item.prompt.slice(0, 160)}...</code>
                  </div>

                  <div className="prompt-card-footer">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onLoadPrompt(item.prompt)}
                    >
                      <Sparkles size={13} />
                      <span>Load in Studio</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
