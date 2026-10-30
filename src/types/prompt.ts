export type ModelId =
  | 'aurora-prime'
  | 'aurora-spark'
  | 'aurora-legacy'
  | 'ember-crown'
  | 'ember-breeze'
  | 'orbit-flare'
  | 'orbit-depth'
  | 'quill-70'
  | 'nexus-v3';

export type TokenizerFamily =
  | 'aurora_core'
  | 'ember_bpe'
  | 'orbit_sp'
  | 'quill_bpe';

export type AppMode = 'studio' | 'tokens' | 'game';

export type AppPage = 'studio' | 'tokens' | 'arena' | 'library' | 'cost' | 'history';

export type ThemeMode = 'light' | 'dark';

export type NamingStyle = 'standard' | 'neutral';

export interface SavedPrompt {
  id: string;
  title: string;
  prompt: string;
  category: string;
  score: number;
  letterGrade: Grade;
  tokenCount: number;
  createdAt: string;
  version?: number;
}

export interface HistoryEntry {
  id: string;
  prompt: string;
  score: number;
  letterGrade: Grade;
  tokenCount: number;
  modelName: string;
  timestamp: string;
}

export interface ModelConfig {
  id: ModelId;
  name: string;
  genericName: string;
  provider: 'AURORA' | 'EMBER' | 'ORBIT' | 'QUILL' | 'NEXUS' | string;
  genericProvider: string;
  family: TokenizerFamily;
  contextWindow: number;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  description: string;
  badgeColor: string;
}

export interface TokenChunk {
  id: number;
  text: string;
  index: number;
  byteLength: number;
  charStart: number;
  charEnd: number;
  isWhitespaceOnly: boolean;
  colorClass: string;
}

export interface ModelTokenStats {
  modelId: ModelId;
  modelName: string;
  tokenCount: number;
  costPer1k: number;
  costPer100k: number;
  costPer1m: number;
  contextUsagePercent: number;
}

export type Grade = 'S' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface ScoringCriterion {
  id: string;
  name: string;
  score: number;
  weight: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  feedback: string;
  details: string[];
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  tokenSavingsEstimate?: number;
}

export interface FillerMatch {
  phrase: string;
  count: number;
  tokenImpact: number;
}

export interface PromptScore {
  overallScore: number;
  letterGrade: Grade;
  criteria: Record<string, ScoringCriterion>;
  suggestions: Suggestion[];
  detectedFillerWords: FillerMatch[];
  strengths: string[];
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  tokensPerWord: number;
}

export interface OptimizationResult {
  originalPrompt: string;
  optimizedPrompt: string;
  originalTokens: number;
  optimizedTokens: number;
  tokensSaved: number;
  percentageSaved: number;
  improvements: Array<{
    type: 'filler_removed' | 'delimiters_added' | 'whitespace_cleaned' | 'structure_organized';
    description: string;
  }>;
  strategy?: string;
  qualityScore?: number;
}

export interface PromptPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
}

export interface GameChallengeObjective {
  id: string;
  label: string;
  targetDescription: string;
  met: boolean;
}

export interface GameChallenge {
  id: string;
  level: number;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  starterPrompt: string;
  targetScore: number;
  maxTokens?: number;
  hint: string;
  objectives: Array<{
    id: string;
    label: string;
    check: (score: PromptScore, prompt: string, tokens: number) => boolean;
  }>;
}
