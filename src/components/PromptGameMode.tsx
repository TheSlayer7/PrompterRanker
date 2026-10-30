import React, { useState, useMemo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Swords,
  Trophy,
  CheckCircle2,
  Circle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Award,
  Flame,
  ArrowRight,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import type { ModelConfig } from '../types/prompt';
import { scorePrompt } from '../services/scorer';
import { tokenizeText } from '../services/tokenizer';
import { GAME_CHALLENGES, BATTLE_PRESETS, type BattlePreset } from '../services/gameChallenges';

interface PromptGameModeProps {
  currentModel: ModelConfig;
  onSendToStudio: (prompt: string) => void;
}

export const PromptGameMode: React.FC<PromptGameModeProps> = ({
  currentModel,
  onSendToStudio,
}) => {
  const [gameTab, setGameTab] = useState<'duel' | 'quests'>('duel');

  // --- DUEL STATE ---
  const [promptA, setPromptA] = useState<string>(BATTLE_PRESETS[0].promptA.prompt);
  const [promptB, setPromptB] = useState<string>(BATTLE_PRESETS[0].promptB.prompt);
  const [nameA, setNameA] = useState<string>('Player Alpha');
  const [nameB, setNameB] = useState<string>('Player Beta');
  const [copiedWinner, setCopiedWinner] = useState(false);
  const prevWinnerRef = useRef<string | null>(null);

  // Scores for Duel
  const tokensA = useMemo(() => tokenizeText(promptA, currentModel).length, [promptA, currentModel]);
  const tokensB = useMemo(() => tokenizeText(promptB, currentModel).length, [promptB, currentModel]);

  const scoreA = useMemo(() => scorePrompt(promptA, tokensA), [promptA, tokensA]);
  const scoreB = useMemo(() => scorePrompt(promptB, tokensB), [promptB, tokensB]);

  // Determine winner
  const duelWinner = useMemo(() => {
    if (!promptA.trim() && !promptB.trim()) return null;
    if (!promptA.trim()) return 'B';
    if (!promptB.trim()) return 'A';
    if (scoreA.overallScore > scoreB.overallScore) return 'A';
    if (scoreB.overallScore > scoreA.overallScore) return 'B';
    // If scores are equal, lower tokens wins
    if (tokensA < tokensB) return 'A';
    if (tokensB < tokensA) return 'B';
    return 'TIE';
  }, [promptA, promptB, scoreA.overallScore, scoreB.overallScore, tokensA, tokensB]);

  // Trigger confetti when a strong winner emerges
  useEffect(() => {
    if (duelWinner && duelWinner !== 'TIE' && duelWinner !== prevWinnerRef.current) {
      const topScore = duelWinner === 'A' ? scoreA.overallScore : scoreB.overallScore;
      if (topScore >= 80) {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'],
          });
        } catch {
          // ignore if canvas not supported
        }
      }
    }
    prevWinnerRef.current = duelWinner;
  }, [duelWinner, scoreA.overallScore, scoreB.overallScore]);

  const handleLoadBattlePreset = (preset: BattlePreset) => {
    setPromptA(preset.promptA.prompt);
    setPromptB(preset.promptB.prompt);
    setNameA(preset.promptA.title);
    setNameB(preset.promptB.title);
  };

  const handleCopyWinner = async () => {
    const winnerText = duelWinner === 'A' ? promptA : promptB;
    if (!winnerText) return;
    await navigator.clipboard.writeText(winnerText);
    setCopiedWinner(true);
    setTimeout(() => setCopiedWinner(false), 2000);
  };

  // --- QUESTS STATE ---
  const [activeLevelIndex, setActiveLevelIndex] = useState(0);
  const [questPrompt, setQuestPrompt] = useState(GAME_CHALLENGES[0].starterPrompt);
  const [showHint, setShowHint] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('prompt_game_completed_levels');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const currentChallenge = GAME_CHALLENGES[activeLevelIndex];
  const questTokens = useMemo(() => tokenizeText(questPrompt, currentModel).length, [questPrompt, currentModel]);
  const questScore = useMemo(() => scorePrompt(questPrompt, questTokens), [questPrompt, questTokens]);

  // Check objectives
  const objectivesStatus = useMemo(() => {
    return currentChallenge.objectives.map((obj) => ({
      id: obj.id,
      label: obj.label,
      met: obj.check(questScore, questPrompt, questTokens),
    }));
  }, [currentChallenge, questScore, questPrompt, questTokens]);

  const allObjectivesMet = objectivesStatus.every((o) => o.met);

  const handleClaimVictory = () => {
    if (!completedLevels.includes(currentChallenge.level)) {
      const updated = [...completedLevels, currentChallenge.level];
      setCompletedLevels(updated);
      try {
        localStorage.setItem('prompt_game_completed_levels', JSON.stringify(updated));
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#10b981', '#06b6d4', '#f59e0b'],
        });
      } catch {
        // Safe fallback
      }
    }
  };

  const handleSelectLevel = (idx: number) => {
    setActiveLevelIndex(idx);
    setQuestPrompt(GAME_CHALLENGES[idx].starterPrompt);
    setShowHint(false);
  };

  const handleResetQuestPrompt = () => {
    setQuestPrompt(currentChallenge.starterPrompt);
  };

  return (
    <div className="game-mode-page">
      {/* Top Banner & Sub-mode switch */}
      <div className="mode-hero-header">
        <div>
          <h2 className="mode-title">
            <Swords size={20} color="var(--amber)" />
            Prompt Arena & Battle Game
          </h2>
          <p className="mode-subtitle">
            Compete in 1v1 head-to-head prompt duels or level up your prompting engineering skills with progressive quest challenges.
          </p>
        </div>

        {/* Sub-tab Pill Switch */}
        <div className="segmented-control">
          <button
            className={`segmented-item ${gameTab === 'duel' ? 'active' : ''}`}
            onClick={() => setGameTab('duel')}
          >
            <Swords size={14} />
            <span>1v1 Prompt Duel</span>
          </button>
          <button
            className={`segmented-item ${gameTab === 'quests' ? 'active' : ''}`}
            onClick={() => setGameTab('quests')}
          >
            <Trophy size={14} />
            <span>Level Challenges ({completedLevels.length}/5)</span>
          </button>
        </div>
      </div>

      {/* SUB-MODE 1: 1v1 DUEL */}
      {gameTab === 'duel' && (
        <div className="duel-container">
          {/* Preset Matchups */}
          <div className="battle-presets-bar">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Load Matchup:
            </span>
            <div className="battle-preset-pills">
              {BATTLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  className="preset-pill-btn"
                  onClick={() => handleLoadBattlePreset(preset)}
                >
                  <Flame size={12} color="var(--amber)" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Winner Announcement Banner */}
          <div className={`duel-banner ${duelWinner ? `winner-${duelWinner.toLowerCase()}` : ''}`}>
            {duelWinner === 'A' && (
              <div className="banner-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Award size={22} color="var(--cyan)" />
                  <div>
                    <h3 className="banner-title">
                      🏆 {nameA} Leads! ({scoreA.overallScore} vs {scoreB.overallScore})
                    </h3>
                    <p className="banner-sub">
                      +{Math.abs(scoreA.overallScore - scoreB.overallScore)} points higher efficiency
                      {tokensA < tokensB && ` · Saves ${tokensB - tokensA} tokens`}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={handleCopyWinner}>
                    {copiedWinner ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
                    <span>{copiedWinner ? 'Copied Winner' : 'Copy Winning Prompt'}</span>
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => onSendToStudio(promptA)}>
                    <Sparkles size={13} />
                    <span>Send to Studio</span>
                  </button>
                </div>
              </div>
            )}

            {duelWinner === 'B' && (
              <div className="banner-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Award size={22} color="var(--purple)" />
                  <div>
                    <h3 className="banner-title">
                      🏆 {nameB} Leads! ({scoreB.overallScore} vs {scoreA.overallScore})
                    </h3>
                    <p className="banner-sub">
                      +{Math.abs(scoreB.overallScore - scoreA.overallScore)} points higher efficiency
                      {tokensB < tokensA && ` · Saves ${tokensA - tokensB} tokens`}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={handleCopyWinner}>
                    {copiedWinner ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
                    <span>{copiedWinner ? 'Copied Winner' : 'Copy Winning Prompt'}</span>
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => onSendToStudio(promptB)}>
                    <Sparkles size={13} />
                    <span>Send to Studio</span>
                  </button>
                </div>
              </div>
            )}

            {duelWinner === 'TIE' && (
              <div className="banner-content" style={{ justifyContent: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--amber)' }}>
                  🤝 Dead Heat! Both prompts share identical efficiency ratings ({scoreA.overallScore}/100).
                </span>
              </div>
            )}
          </div>

          {/* Side-by-side Dual Arenas */}
          <div className="duel-grid">
            {/* Fighter A */}
            <div className={`glass-card duel-card ${duelWinner === 'A' ? 'is-winning' : ''}`}>
              <div className="duel-card-header">
                <input
                  type="text"
                  value={nameA}
                  onChange={(e) => setNameA(e.target.value)}
                  className="duel-player-input"
                  title="Edit challenger title"
                />
                <div className="duel-score-badge" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
                  <span className="badge-grade">{scoreA.letterGrade}</span>
                  <span className="badge-num">{scoreA.overallScore}/100</span>
                </div>
              </div>

              <textarea
                className="prompt-textarea duel-textarea"
                rows={9}
                value={promptA}
                onChange={(e) => setPromptA(e.target.value)}
                placeholder="Enter Prompt Alpha here..."
                spellCheck="false"
              />

              <div className="duel-stats-grid">
                <div className="duel-stat-cell">
                  <span className="duel-stat-label">Tokens</span>
                  <span className="duel-stat-val">{tokensA}</span>
                </div>
                <div className="duel-stat-cell">
                  <span className="duel-stat-label">Structure</span>
                  <span className="duel-stat-val">{scoreA.criteria['structure']?.score ?? 0}%</span>
                </div>
                <div className="duel-stat-cell">
                  <span className="duel-stat-label">Fluff Words</span>
                  <span
                    className="duel-stat-val"
                    style={{ color: scoreA.detectedFillerWords.length > 0 ? 'var(--rose)' : 'var(--emerald)' }}
                  >
                    {scoreA.detectedFillerWords.length}
                  </span>
                </div>
                <div className="duel-stat-cell">
                  <span className="duel-stat-label">Clarity</span>
                  <span className="duel-stat-val">{scoreA.criteria['clarity']?.score ?? 0}%</span>
                </div>
              </div>
            </div>

            {/* Fighter B */}
            <div className={`glass-card duel-card ${duelWinner === 'B' ? 'is-winning' : ''}`}>
              <div className="duel-card-header">
                <input
                  type="text"
                  value={nameB}
                  onChange={(e) => setNameB(e.target.value)}
                  className="duel-player-input"
                  title="Edit challenger title"
                />
                <div className="duel-score-badge" style={{ borderColor: 'var(--purple)', color: 'var(--purple)' }}>
                  <span className="badge-grade">{scoreB.letterGrade}</span>
                  <span className="badge-num">{scoreB.overallScore}/100</span>
                </div>
              </div>

              <textarea
                className="prompt-textarea duel-textarea"
                rows={9}
                value={promptB}
                onChange={(e) => setPromptB(e.target.value)}
                placeholder="Enter Prompt Beta here..."
                spellCheck="false"
              />

              <div className="duel-stats-grid">
                <div className="duel-stat-cell">
                  <span className="duel-stat-label">Tokens</span>
                  <span className="duel-stat-val">{tokensB}</span>
                </div>
                <div className="duel-stat-cell">
                  <span className="duel-stat-label">Structure</span>
                  <span className="duel-stat-val">{scoreB.criteria['structure']?.score ?? 0}%</span>
                </div>
                <div className="duel-stat-cell">
                  <span className="duel-stat-label">Fluff Words</span>
                  <span
                    className="duel-stat-val"
                    style={{ color: scoreB.detectedFillerWords.length > 0 ? 'var(--rose)' : 'var(--emerald)' }}
                  >
                    {scoreB.detectedFillerWords.length}
                  </span>
                </div>
                <div className="duel-stat-cell">
                  <span className="duel-stat-label">Clarity</span>
                  <span className="duel-stat-val">{scoreB.criteria['clarity']?.score ?? 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODE 2: LEVEL CHALLENGES */}
      {gameTab === 'quests' && (
        <div className="quests-container">
          {/* Level Progress Bar & Selector */}
          <div className="levels-nav-bar">
            {GAME_CHALLENGES.map((ch, idx) => {
              const isDone = completedLevels.includes(ch.level);
              const isActive = activeLevelIndex === idx;
              return (
                <button
                  key={ch.id}
                  className={`level-pill-btn ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                  onClick={() => handleSelectLevel(idx)}
                >
                  <span className="level-badge">{ch.badge}</span>
                  <span className="level-title">{ch.title}</span>
                  {isDone && <CheckCircle2 size={14} color="var(--emerald)" className="check-icon" />}
                </button>
              );
            })}
          </div>

          {/* Active Level Quest Card */}
          <div className="quest-main-grid">
            {/* Editor Area */}
            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="level-tag">{currentChallenge.badge}</span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {currentChallenge.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    {currentChallenge.tagline}
                  </p>
                </div>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleResetQuestPrompt}
                  title="Reset to starter prompt"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>

              <textarea
                className="prompt-textarea"
                rows={9}
                value={questPrompt}
                onChange={(e) => setQuestPrompt(e.target.value)}
                placeholder="Optimize this prompt to meet all level objectives..."
                spellCheck="false"
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowHint(!showHint)}
                  style={{ color: 'var(--amber)' }}
                >
                  <HelpCircle size={14} />
                  <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onSendToStudio(questPrompt)}
                  >
                    <Sparkles size={13} />
                    <span>Open in Studio</span>
                  </button>
                </div>
              </div>

              {showHint && (
                <div className="hint-card">
                  <Zap size={15} color="var(--amber)" />
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                    <strong>Hint:</strong> {currentChallenge.hint}
                  </p>
                </div>
              )}
            </div>

            {/* Objectives & Live Score Card */}
            <div className="glass-card quest-sidebar" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Objectives Checklist
                </span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: allObjectivesMet ? 'var(--emerald)' : 'var(--amber)',
                  }}
                >
                  {allObjectivesMet ? 'ALL COMPLETE! 🎉' : `${objectivesStatus.filter((o) => o.met).length}/${objectivesStatus.length} Done`}
                </span>
              </div>

              {/* Objectives List */}
              <div className="objectives-list">
                {objectivesStatus.map((obj) => (
                  <div
                    key={obj.id}
                    className={`objective-item ${obj.met ? 'met' : 'unmet'}`}
                  >
                    {obj.met ? (
                      <CheckCircle2 size={16} color="var(--emerald)" />
                    ) : (
                      <Circle size={16} color="var(--text-muted)" />
                    )}
                    <span className="objective-label">{obj.label}</span>
                  </div>
                ))}
              </div>

              {/* Live Score Display */}
              <div className="quest-live-score">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Current Score:</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: questScore.overallScore >= currentChallenge.targetScore ? 'var(--emerald)' : 'var(--rose)' }}>
                    {questScore.overallScore} / {currentChallenge.targetScore} Required
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, (questScore.overallScore / currentChallenge.targetScore) * 100)}%`,
                      background: questScore.overallScore >= currentChallenge.targetScore ? 'var(--emerald)' : 'var(--amber)',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 12 }}>
                <span>Tokens: <strong style={{ color: 'var(--text-main)' }}>{questTokens}</strong></span>
                <span>Fluff Words: <strong style={{ color: questScore.detectedFillerWords.length === 0 ? 'var(--emerald)' : 'var(--rose)' }}>{questScore.detectedFillerWords.length}</strong></span>
                <span>Grade: <strong style={{ color: 'var(--cyan)' }}>{questScore.letterGrade}</strong></span>
              </div>

              {allObjectivesMet && !completedLevels.includes(currentChallenge.level) && (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 18, background: 'var(--emerald)' }}
                  onClick={handleClaimVictory}
                >
                  <Trophy size={14} />
                  <span>Claim Level Victory!</span>
                </button>
              )}

              {allObjectivesMet && completedLevels.includes(currentChallenge.level) && activeLevelIndex < GAME_CHALLENGES.length - 1 && (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 18 }}
                  onClick={() => handleSelectLevel(activeLevelIndex + 1)}
                >
                  <span>Next Level ({activeLevelIndex + 2})</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
