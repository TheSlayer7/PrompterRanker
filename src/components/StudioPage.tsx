import React, { useState } from 'react';
import type { ModelConfig, PromptScore, OptimizationResult, TokenChunk } from '../types/prompt';
import { PromptInput } from './PromptInput';
import { ScoreOverview } from './ScoreOverview';
import { TokenVisualizer } from './TokenVisualizer';
import { ScoreBreakdown } from './ScoreBreakdown';
import { PromptOptimizer } from './PromptOptimizer';
import { PROMPT_PRESETS } from '../services/presets';
import { Eye, Sliders, Wand2, Sparkles, RotateCcw, Flame } from 'lucide-react';

interface StudioPageProps {
  prompt: string;
  onChangePrompt: (value: string) => void;
  tokenCount: number;
  score: PromptScore;
  optimization: OptimizationResult;
  optimizedScore: number;
  tokenChunks: TokenChunk[];
  currentModel: ModelConfig;
  onApplyOptimization: (optimizedText: string) => void;
  onApplySuggestion: (suggestionId: string) => void;
}

export const StudioPage: React.FC<StudioPageProps> = ({
  prompt,
  onChangePrompt,
  tokenCount,
  score,
  optimization,
  optimizedScore,
  tokenChunks,
  currentModel,
  onApplyOptimization,
  onApplySuggestion,
}) => {
  const [activeTab, setActiveTab] = useState<'optimizer' | 'breakdown' | 'visualizer'>('optimizer');
  const [previousPrompt, setPreviousPrompt] = useState<string | null>(null);
  const [justOptimized, setJustOptimized] = useState(false);
  const [appliedSavings, setAppliedSavings] = useState({ tokens: 0, percentage: 0 });

  // Directly optimize into the editor
  const handleDirectOptimize = () => {
    if (!optimization.optimizedPrompt || optimization.tokensSaved === 0) return;
    setActiveTab('optimizer');
  };

  const handleUndo = () => {
    if (previousPrompt !== null) {
      onChangePrompt(previousPrompt);
      setPreviousPrompt(null);
      setJustOptimized(false);
      setAppliedSavings({ tokens: 0, percentage: 0 });
    }
  };

  return (
    <div className="studio-page-container">
      {/* Quick Test Templates Row */}
      <div className="template-demos-bar">
        <div className="demos-label">
          <Flame size={13} color="var(--amber)" />
          <span>Try Optimization Demos:</span>
        </div>
        <div className="demos-pills">
          {PROMPT_PRESETS.slice(0, 5).map((preset) => (
            <button
              key={preset.id}
              className="demo-pill-btn"
              onClick={() => {
                onChangePrompt(preset.prompt);
                setPreviousPrompt(null);
                setJustOptimized(false);
                setAppliedSavings({ tokens: 0, percentage: 0 });
              }}
              title={preset.description}
            >
              <span>{preset.title.split('(')[0].trim()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Optimization Applied Banner (with Undo) */}
      {justOptimized && (
        <div className="optimization-toast-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="var(--emerald)" />
            <span>
              <strong>Prompt Optimized!</strong> Saved <strong>{appliedSavings.tokens} tokens</strong> ({appliedSavings.percentage}% reduction) by stripping filler phrases.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleUndo}>
              <RotateCcw size={13} />
              <span>Undo</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('optimizer')}
            >
              <span>View Diff</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary 2-Column Grid */}
      <div className="main-grid">
        <PromptInput
          prompt={prompt}
          onChange={onChangePrompt}
          tokenCount={tokenCount}
          wordCount={score.wordCount}
          charCount={score.charCount}
          sentenceCount={score.sentenceCount}
          tokensPerWord={score.tokensPerWord}
          currentModel={currentModel}
          tokensSaved={optimization.tokensSaved}
          onOptimizeClick={handleDirectOptimize}
          onClear={() => {
            onChangePrompt('');
            setPreviousPrompt(null);
            setJustOptimized(false);
            setAppliedSavings({ tokens: 0, percentage: 0 });
          }}
        />

        <ScoreOverview
          score={score}
          onOptimizeClick={handleDirectOptimize}
          onViewBreakdown={() => setActiveTab('breakdown')}
        />
      </div>

      {/* Secondary Tabs */}
      <div className="studio-secondary-section">
        <nav className="tabs-nav" id="studio-sub-tabs">
          <button
            className={`tab-btn ${activeTab === 'optimizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('optimizer')}
          >
            <Wand2 size={15} />
            <span>1-Click Diff & Savings (-{optimization.tokensSaved} tokens)</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'breakdown' ? 'active' : ''}`}
            onClick={() => setActiveTab('breakdown')}
          >
            <Sliders size={15} />
            <span>Criteria Breakdown & Suggestions ({score.suggestions.length})</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'visualizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('visualizer')}
          >
            <Eye size={15} />
            <span>Visual Token Chunks ({tokenCount})</span>
          </button>
        </nav>

        {/* Tab Contents */}
        {activeTab === 'optimizer' && (
          <PromptOptimizer
            optimization={optimization}
            originalScore={score.overallScore}
            optimizedScore={optimizedScore}
            onApply={(text) => {
              setPreviousPrompt(prompt);
              setAppliedSavings({
                tokens: optimization.tokensSaved,
                percentage: optimization.percentageSaved,
              });
              onApplyOptimization(text);
              setJustOptimized(true);
            }}
          />
        )}

        {activeTab === 'breakdown' && (
          <ScoreBreakdown score={score} onApplySuggestion={onApplySuggestion} />
        )}

        {activeTab === 'visualizer' && (
          <TokenVisualizer tokens={tokenChunks} currentModel={currentModel} />
        )}
      </div>
    </div>
  );
};
