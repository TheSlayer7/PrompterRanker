import { useState, useMemo, useEffect } from 'react';
import type {
  ModelId,
  AppPage,
  ThemeMode,
  NamingStyle,
  SavedPrompt,
  HistoryEntry,
} from './types/prompt';
import { getModelConfig, getModelDisplayName, getModelProviderName } from './services/models';
import { tokenizeText } from './services/tokenizer';
import { scorePrompt } from './services/scorer';
import { optimizePrompt, applySuggestion } from './services/optimizer';
import { PROMPT_PRESETS } from './services/presets';
import {
  getSavedPrompts,
  savePromptToStorage,
  deleteSavedPrompt,
  getPromptHistory,
  addHistoryEntry,
  clearPromptHistory,
  getStoredTheme,
  setStoredTheme,
  getStoredNamingStyle,
  setStoredNamingStyle,
  getStoredActivePage,
  setStoredActivePage,
  exportSavedPrompts,
  importSavedPrompts,
} from './services/storage';

import { TopNav } from './components/TopNav';
import { StudioPage } from './components/StudioPage';
import { TokenInspectorMode } from './components/TokenInspectorMode';
import { PromptGameMode } from './components/PromptGameMode';
import { PromptLibraryPage } from './components/PromptLibraryPage';
import { CostMatrixPage } from './components/CostMatrixPage';
import { AuditHistoryPage } from './components/AuditHistoryPage';
import { SavePromptModal } from './components/SavePromptModal';

import { ShieldAlert } from 'lucide-react';

function getSharedPrompt(): string | null {
  if (!window.location.hash.startsWith('#prompt=')) return null;
  try {
    const decoded = decodeURIComponent(window.location.hash.slice('#prompt='.length));
    return decoded.trim() ? decoded : null;
  } catch (error) {
    console.error('Failed to restore shared prompt:', error);
    return null;
  }
}

export function App() {
  const [activePage, setActivePage] = useState<AppPage>(() => getStoredActivePage());
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [namingStyle, setNamingStyle] = useState<NamingStyle>(() => getStoredNamingStyle());

  // Prompt & Model state
  const [prompt, setPrompt] = useState<string>(() => getSharedPrompt() ?? PROMPT_PRESETS[0].prompt);
  const [selectedModelId, setSelectedModelId] = useState<ModelId>('aurora-prime');

  // Stored items
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>(() => getSavedPrompts());
  const [history, setHistory] = useState<HistoryEntry[]>(() => getPromptHistory());

  // Modals
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareNotice, setShareNotice] = useState(false);

  // Sync theme attribute to HTML element for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setStoredTheme(theme);
  }, [theme]);

  // Model configuration
  const currentModel = useMemo(() => getModelConfig(selectedModelId), [selectedModelId]);

  // Tokenization chunks & stats
  const tokenChunks = useMemo(() => {
    return tokenizeText(prompt, currentModel);
  }, [prompt, currentModel]);

  const tokenCount = tokenChunks.length;

  // Prompt scoring
  const score = useMemo(() => {
    return scorePrompt(prompt, tokenCount);
  }, [prompt, tokenCount]);

  // Prompt optimization
  const optimization = useMemo(() => {
    return optimizePrompt(prompt, currentModel);
  }, [prompt, currentModel]);

  const optimizedScore = useMemo(() => {
    return scorePrompt(optimization.optimizedPrompt, optimization.optimizedTokens).overallScore;
  }, [optimization.optimizedPrompt, optimization.optimizedTokens]);

  // Auto-log to history (debounced)
  useEffect(() => {
    if (!prompt.trim() || prompt.length < 20) return;
    const timer = setTimeout(() => {
      addHistoryEntry({
        prompt: prompt.trim(),
        score: score.overallScore,
        letterGrade: score.letterGrade,
        tokenCount,
        modelName: getModelDisplayName(currentModel, namingStyle),
      });
      setHistory(getPromptHistory());
    }, 2500);
    return () => clearTimeout(timer);
  }, [prompt, score.overallScore, score.letterGrade, tokenCount, currentModel, namingStyle]);

  // Switch pages
  const handleSelectPage = (page: AppPage) => {
    setActivePage(page);
    setStoredActivePage(page);
  };

  // Toggle theme (dark / light)
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toggle naming style
  const handleToggleNamingStyle = () => {
    const nextStyle: NamingStyle = namingStyle === 'standard' ? 'neutral' : 'standard';
    setNamingStyle(nextStyle);
    setStoredNamingStyle(nextStyle);
  };

  // Handle applying optimization
  const handleApplyOptimization = (optimizedText: string) => {
    setPrompt(optimizedText);
  };

  const handleApplySuggestion = (suggestionId: string) => {
    setPrompt((currentPrompt) => applySuggestion(currentPrompt, suggestionId, currentModel));
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#prompt=${encodeURIComponent(prompt)}`;
    window.history.replaceState(null, '', shareUrl);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareNotice(true);
      window.setTimeout(() => setShareNotice(false), 2500);
    } catch (error) {
      console.error('Failed to copy share link:', error);
    }
  };

  const handleExportBackup = () => {
    const blob = new Blob([exportSavedPrompts()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompterranker-library-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (file: File) => {
    try {
      const result = importSavedPrompts(await file.text());
      setSavedPrompts(getSavedPrompts());
      window.alert(`Restored ${result.imported} prompt${result.imported === 1 ? '' : 's'}${result.skipped ? `; skipped ${result.skipped} invalid entr${result.skipped === 1 ? 'y' : 'ies'}.` : '.'}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The backup could not be restored.';
      window.alert(message);
    }
  };

  // Switch to Studio with specific prompt
  const handleSendToStudio = (newPrompt: string) => {
    setPrompt(newPrompt);
    handleSelectPage('studio');
  };

  // Save prompt to library
  const handleSavePrompt = (title: string, category: string) => {
    savePromptToStorage({
      title,
      category,
      prompt,
      score: score.overallScore,
      letterGrade: score.letterGrade,
      tokenCount,
    });
    setSavedPrompts(getSavedPrompts());
  };

  const handleDeleteSavedPrompt = (id: string) => {
    if (!window.confirm('Delete this saved prompt? This cannot be undone.')) return;
    deleteSavedPrompt(id);
    setSavedPrompts(getSavedPrompts());
  };

  const handleClearHistory = () => {
    if (!window.confirm('Clear all prompt history? This cannot be undone.')) return;
    clearPromptHistory();
    setHistory([]);
  };

  // Export report as Markdown or JSON
  const handleExport = (format: 'markdown' | 'json') => {
    const modelDisplayName = getModelDisplayName(currentModel, namingStyle);
    const modelDisplayProvider = getModelProviderName(currentModel, namingStyle);

    if (format === 'markdown') {
      const mdContent = `# PrompterRanker Efficiency & Token Report
Generated: ${new Date().toLocaleString()}
Target Model: ${modelDisplayName} (${modelDisplayProvider})

## Summary Metrics
- **Overall Score**: ${score.overallScore}/100 (Grade: ${score.letterGrade})
- **Token Count**: ${tokenCount} tokens
- **Word Count**: ${score.wordCount} words
- **Character Count**: ${score.charCount} characters
- **Tokens/Word**: ${score.tokensPerWord}

## Criteria Breakdown
${Object.values(score.criteria)
  .map(
    (c) => `- **${c.name}**: ${c.score}/100 (${c.status.toUpperCase()}) — ${c.feedback}`
  )
  .join('\n')}

## Recommendations
${score.suggestions
  .map((s) => `### ${s.title}\n${s.description}${s.tokenSavingsEstimate ? ` *(Saves ~${s.tokenSavingsEstimate} tokens)*` : ''}`)
  .join('\n\n')}

## Original Prompt
\`\`\`
${prompt}
\`\`\`

## Optimized Prompt (Saves ${optimization.tokensSaved} tokens)
\`\`\`
${optimization.optimizedPrompt}
\`\`\`
`;
      const blob = new Blob([mdContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-score-report-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonData = {
        timestamp: new Date().toISOString(),
        model: currentModel,
        metrics: {
          tokenCount,
          wordCount: score.wordCount,
          charCount: score.charCount,
          sentenceCount: score.sentenceCount,
          tokensPerWord: score.tokensPerWord,
        },
        score: {
          overallScore: score.overallScore,
          letterGrade: score.letterGrade,
          criteria: score.criteria,
          suggestions: score.suggestions,
          strengths: score.strengths,
        },
        optimization,
        tokensSample: tokenChunks.slice(0, 100),
      };
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-score-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`app-shell theme-${theme}`}>
      {/* Sleek Top Navigation Bar */}
      <TopNav
        activePage={activePage}
        onSelectPage={handleSelectPage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        namingStyle={namingStyle}
        onToggleNamingStyle={handleToggleNamingStyle}
        currentModel={currentModel}
        onSelectModel={setSelectedModelId}
        historyCount={history.length}
        savedCount={savedPrompts.length}
        wordCount={score.wordCount}
        onSavePrompt={() => setIsSaveModalOpen(true)}
        onExport={handleExport}
        onShare={handleShare}
      />

      {shareNotice && <div className="share-notice" role="status">Share link copied to clipboard.</div>}

      {/* Main Dynamic View Area */}
      <main className="app-page-content">
        {activePage === 'studio' && (
          <StudioPage
            prompt={prompt}
            onChangePrompt={setPrompt}
            tokenCount={tokenCount}
            score={score}
            optimization={optimization}
            optimizedScore={optimizedScore}
            tokenChunks={tokenChunks}
            currentModel={currentModel}
            onApplyOptimization={handleApplyOptimization}
            onApplySuggestion={handleApplySuggestion}
          />
        )}

        {activePage === 'tokens' && (
          <TokenInspectorMode
            initialPrompt={prompt}
            currentModel={currentModel}
            onSelectModel={setSelectedModelId}
            namingStyle={namingStyle}
            onSendToStudio={handleSendToStudio}
          />
        )}

        {activePage === 'arena' && (
          <PromptGameMode
            currentModel={currentModel}
            onSendToStudio={handleSendToStudio}
          />
        )}

        {activePage === 'library' && (
          <PromptLibraryPage
            savedPrompts={savedPrompts}
            onLoadPrompt={handleSendToStudio}
            onDeleteSavedPrompt={handleDeleteSavedPrompt}
            onOpenSaveModal={() => setIsSaveModalOpen(true)}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
          />
        )}

        {activePage === 'cost' && (
          <CostMatrixPage
            tokenCount={tokenCount}
            currentModel={currentModel}
            namingStyle={namingStyle}
            onSelectModel={setSelectedModelId}
          />
        )}

        {activePage === 'history' && (
          <AuditHistoryPage
            history={history}
            onLoadPrompt={handleSendToStudio}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Minimalist Professional Footer */}
      <footer className="app-footer">
        <div className="footer-top">
          <div className="disclaimer-note">
            <ShieldAlert size={14} color="var(--text-muted)" />
            <span>
              <strong>Fictional Names Notice:</strong> All model and provider names shown here (AURORA, EMBER, ORBIT, QUILL, NEXUS) are fictional aliases created for educational purposes. PrompterRanker is a fun, independent, 100% client-side open-source project and does not represent or guarantee compatibility with any external model.
            </span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>PrompterRanker · MIT License · 100% Client-Side Engine</span>
          <div className="footer-links">
            <button className="footer-link-btn" onClick={() => handleSelectPage('library')}>Library</button>
            <span className="dot-sep">·</span>
            <button className="footer-link-btn" onClick={() => handleSelectPage('arena')}>Arena</button>
            <span className="dot-sep">·</span>
            <button className="footer-link-btn" onClick={() => handleSelectPage('tokens')}>Token Lab</button>
            <span className="dot-sep">·</span>
            <button className="footer-link-btn" onClick={() => handleSelectPage('cost')}>Cost Matrix</button>
          </div>
        </div>
      </footer>

      {/* Save Prompt Modal */}
      <SavePromptModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSavePrompt}
        currentPrompt={prompt}
        score={score.overallScore}
        grade={score.letterGrade}
        tokenCount={tokenCount}
      />

    </div>
  );
}

export default App;
