import React, { useState } from 'react';
import {
  Sparkles,
  Hash,
  Swords,
  BookOpen,
  DollarSign,
  History,
  Sun,
  Moon,
  Layers,
  ShieldCheck,
  BookmarkPlus,
  Download,
  Share2,
  Menu,
  X,
} from 'lucide-react';
import type { AppPage, ThemeMode, NamingStyle, ModelConfig, ModelId } from '../types/prompt';
import { SUPPORTED_MODELS, getModelDisplayName } from '../services/models';

interface TopNavProps {
  activePage: AppPage;
  onSelectPage: (page: AppPage) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  namingStyle: NamingStyle;
  onToggleNamingStyle: () => void;
  currentModel: ModelConfig;
  onSelectModel: (modelId: ModelId) => void;
  historyCount: number;
  savedCount: number;
  wordCount: number;
  onSavePrompt: () => void;
  onExport: (format: 'markdown' | 'json') => void;
  onShare: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activePage,
  onSelectPage,
  theme,
  onToggleTheme,
  namingStyle,
  onToggleNamingStyle,
  currentModel,
  onSelectModel,
  historyCount,
  savedCount,
  wordCount,
  onSavePrompt,
  onExport,
  onShare,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSelectPage = (page: AppPage) => {
    onSelectPage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="app-topnav" aria-label="Main Navigation">
      {/* Brand & Title */}
      <div className="brand-group">
        <div className="brand-logo">
          <Sparkles size={16} />
        </div>
        <div className="brand-text">
          <span className="brand-title">PrompterRanker</span>
        </div>
      </div>

      {/* Primary Section Switcher Tabs */}
      <nav className="topnav-nav-tabs" aria-label="App Sections">
        <button
          className={`topnav-tab-btn ${activePage === 'studio' ? 'active' : ''}`}
          onClick={() => handleSelectPage('studio')}
        >
          <Sparkles size={14} />
          <span>Studio</span>
        </button>

        <button
          className={`topnav-tab-btn ${activePage === 'tokens' ? 'active' : ''}`}
          onClick={() => handleSelectPage('tokens')}
        >
          <Hash size={14} />
          <span>Tokens</span>
        </button>

        <button
          className={`topnav-tab-btn ${activePage === 'arena' ? 'active' : ''}`}
          onClick={() => handleSelectPage('arena')}
        >
          <Swords size={14} />
          <span>Arena</span>
        </button>

        <button
          className={`topnav-tab-btn ${activePage === 'library' ? 'active' : ''}`}
          onClick={() => handleSelectPage('library')}
        >
          <BookOpen size={14} />
          <span>Library</span>
          {savedCount > 0 && <span className="tab-pill-badge">{savedCount}</span>}
        </button>

        <button
          className={`topnav-tab-btn ${activePage === 'cost' ? 'active' : ''}`}
          onClick={() => handleSelectPage('cost')}
        >
          <DollarSign size={14} />
          <span>Costs</span>
        </button>

        <button
          className={`topnav-tab-btn ${activePage === 'history' ? 'active' : ''}`}
          onClick={() => handleSelectPage('history')}
        >
          <History size={14} />
          <span>History</span>
          {historyCount > 0 && <span className="tab-pill-badge">{historyCount}</span>}
        </button>
      </nav>

      {/* Right Controls */}
      <div className="topnav-actions-group">
        {/* Model Selector */}
        <div className="model-select-wrapper" title="Target Model & Tokenizer">
          <Layers size={13} color={currentModel.badgeColor} />
          <select
            className="model-select-input"
            value={currentModel.id}
            onChange={(e) => onSelectModel(e.target.value as ModelId)}
          >
            {SUPPORTED_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {getModelDisplayName(model, namingStyle)} ({model.provider})
              </option>
            ))}
          </select>
        </div>

        {/* Naming Style Toggle */}
        <button
          className={`icon-toggle-btn ${namingStyle === 'neutral' ? 'active' : ''}`}
          onClick={onToggleNamingStyle}
          title={namingStyle === 'standard' ? 'Using Fictional Aliases (AURORA, EMBER, ORBIT, QUILL, NEXUS)' : 'Using Neutral Descriptors'}
        >
          <ShieldCheck size={14} />
          <span>{namingStyle === 'standard' ? 'Fictional' : 'Neutral'}</span>
        </button>

        {/* Theme Switcher Toggle */}
        <button
          className="icon-toggle-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* Save to Library */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onSavePrompt}
          disabled={wordCount === 0}
          title="Save prompt to template library"
        >
          <BookmarkPlus size={14} />
          <span>Save</span>
        </button>

        {/* Export */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onExport('markdown')}
          title="Export evaluation report"
        >
          <Download size={14} />
          <span>Export</span>
        </button>

        <button className="btn btn-secondary btn-sm share-action" onClick={onShare} title="Copy a shareable prompt link">
          <Share2 size={14} />
          <span>Share</span>
        </button>
      </div>

      <button
        className="mobile-menu-toggle"
        type="button"
        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen((open) => !open)}
      >
        {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {isMobileMenuOpen && (
        <div className="mobile-nav-menu">
          <div className="mobile-nav-pages">
            {[
              ['studio', 'Studio'],
              ['tokens', 'Token Lab'],
              ['arena', 'Arena'],
              ['library', `Templates${savedCount > 0 ? ` (${savedCount})` : ''}`],
              ['cost', 'Cost Matrix'],
              ['history', `History${historyCount > 0 ? ` (${historyCount})` : ''}`],
            ].map(([page, label]) => (
              <button
                key={page}
                type="button"
                className={`mobile-nav-item ${activePage === page ? 'active' : ''}`}
                onClick={() => handleSelectPage(page as AppPage)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mobile-nav-actions">
            <label className="mobile-model-label" htmlFor="mobile-model-select">Target model</label>
            <select
              id="mobile-model-select"
              className="model-select-input mobile-model-select"
              value={currentModel.id}
              onChange={(e) => onSelectModel(e.target.value as ModelId)}
            >
              {SUPPORTED_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {getModelDisplayName(model, namingStyle)} ({model.provider})
                </option>
              ))}
            </select>
            <div className="mobile-action-row">
              <button className="btn btn-secondary btn-sm" onClick={onToggleTheme}>
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={onSavePrompt} disabled={wordCount === 0}>
                <BookmarkPlus size={14} />
                <span>Save</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => onExport('markdown')}>
                <Download size={14} />
                <span>Export</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={onShare}>
                <Share2 size={14} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
