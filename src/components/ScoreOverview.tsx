import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { PromptScore, Grade } from '../types/prompt';
import { Award, Zap } from 'lucide-react';

interface ScoreOverviewProps {
  score: PromptScore;
  onOptimizeClick: () => void;
  onViewBreakdown: () => void;
}

export const ScoreOverview: React.FC<ScoreOverviewProps> = ({ score, onOptimizeClick, onViewBreakdown }) => {
  const prevScoreRef = useRef(score.overallScore);

  useEffect(() => {
    // Fire confetti when reaching an S or A+ grade (90+)
    if (score.overallScore >= 90 && prevScoreRef.current < 90) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'],
        });
      } catch {
        // Safe fallback if canvas is not ready
      }
    }
    prevScoreRef.current = score.overallScore;
  }, [score.overallScore]);

  const { overallScore, letterGrade } = score;

  // Colors based on score range
  const getThemeColor = (s: number) => {
    if (s >= 88) return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: '#34d399' };
    if (s >= 75) return { stroke: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', text: '#22d3ee' };
    if (s >= 60) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24' };
    if (s >= 40) return { stroke: '#f97316', glow: 'rgba(249, 115, 22, 0.4)', text: '#fb923c' };
    return { stroke: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)', text: '#fb7185' };
  };

  const theme = getThemeColor(overallScore);
  const weakestCriteria = Object.values(score.criteria)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);

  // Radial SVG math: radius 64 -> circumference = 2 * PI * 64 ~= 402.12
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const getGradeTitle = (grade: Grade) => {
    switch (grade) {
      case 'S':
        return 'Exceptional (Master Prompt)';
      case 'A+':
      case 'A':
        return 'Production Grade (High Efficiency)';
      case 'B':
        return 'Solid (Minor Optimization Potential)';
      case 'C':
        return 'Moderate (High Token Waste / Fluff)';
      case 'D':
      case 'F':
        return 'Suboptimal (Unstructured / Vague)';
    }
  };

  return (
    <div className="glass-card score-overview-card" id="score-overview-card">
      <div className="editor-header">
        <div className="editor-title-wrap">
          <Award size={18} color="var(--purple)" />
          <div>
            <h2 className="section-title">Your score</h2>
            <p className="section-helper">A quick estimate of clarity, structure, and efficiency.</p>
          </div>
        </div>
      </div>

      <div className="score-hero-section">
        {/* Animated Radial Gauge */}
        <div className="gauge-wrapper" title={`Overall Efficiency Score: ${overallScore}/100`}>
          <svg className="gauge-svg" viewBox="0 0 160 160">
            <circle
              className="gauge-bg"
              cx="80"
              cy="80"
              r={radius}
            />
            <circle
              className="gauge-progress"
              cx="80"
              cy="80"
              r={radius}
              stroke={theme.stroke}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ filter: `drop-shadow(0 0 10px ${theme.glow})` }}
            />
          </svg>
          <div className="gauge-center">
            <span className="gauge-score" style={{ color: theme.text }}>
              {overallScore}
            </span>
            <span className="gauge-score-sub">Out of 100</span>
          </div>
        </div>

        {/* Letter Grade Pill */}
        <div className="grade-badge-wrap">
          <div
            className="grade-pill"
            style={{
              borderColor: theme.stroke,
              background: `radial-gradient(circle, ${theme.glow} 0%, rgba(13, 18, 29, 0.9) 70%)`,
              color: theme.text,
              boxShadow: `0 0 25px ${theme.glow}`,
            }}
          >
            {letterGrade}
          </div>
          <span className="grade-label">{getGradeTitle(letterGrade)}</span>
          {overallScore < 85 && (
            <button
              className="btn btn-secondary"
              onClick={onOptimizeClick}
              style={{ marginTop: 8, fontSize: '0.75rem', padding: '4px 10px' }}
            >
              <Zap size={12} color="var(--cyan)" />
              <span>Boost Score</span>
            </button>
          )}
        </div>
      </div>

      <div className="score-explanation">
        <div className="score-explanation-header">
          <div>
            <strong>What is affecting this score?</strong>
            <span>Weighted heuristics for clarity, structure, and token efficiency.</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onViewBreakdown}>
            View breakdown
          </button>
        </div>
        <div className="score-weak-criteria">
          {weakestCriteria.map((criterion) => (
            <div key={criterion.id} className="score-weak-criterion">
              <span>{criterion.name}</span>
              <strong>{criterion.score}/100</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
