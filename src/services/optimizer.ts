import type { ModelConfig, OptimizationResult } from '../types/prompt';
import { tokenizeText } from './tokenizer';
import { scorePrompt } from './scorer';

interface FillerRule {
  regex: RegExp;
  replacement: string;
  reason: string;
}

const FILLER_REPLACEMENTS: FillerRule[] = [
  // Greetings & Intros
  { regex: /\b(hello\s+there\s*,?|hello\s*,?|hi\s+there\s*,?|hey\s*,?)\s*/gi, replacement: '', reason: 'Removed conversational greeting' },
  { regex: /\b(good\s+(?:morning|afternoon|evening)\s*,?)\s*/gi, replacement: '', reason: 'Removed conversational greeting' },

  // Polite & Conversational Request Fillers
  { regex: /\b(please\s+(?:could|can)\s+you\s+(?:kindly\s+)?(?:help\s+me\s+to\s+)?)/gi, replacement: '', reason: 'Removed polite preamble' },
  { regex: /\b(can\s+you\s+please\s+(?:go\s+ahead\s+and\s+)?)/gi, replacement: '', reason: 'Converted conversational request into direct instruction' },
  { regex: /\b(could\s+you\s+(?:please\s+)?(?:kindly\s+)?)/gi, replacement: '', reason: 'Removed indirect request filler' },
  { regex: /\b(please\s+(?:go\s+ahead\s+and\s+)?)/gi, replacement: '', reason: 'Stripped polite "please" prefix' },
  { regex: /\b(i\s+would\s+(?:really\s+)?like\s+you\s+to\s+)/gi, replacement: '', reason: 'Converted indirect request into direct imperative command' },
  { regex: /\b(i\s+was\s+wondering\s+if\s+you\s+could\s+)/gi, replacement: '', reason: 'Removed hesitant conversational prefix' },
  { regex: /\b(i\s+(?:want|need)\s+you\s+to\s+)/gi, replacement: '', reason: 'Removed conversational subject/verb' },
  { regex: /\b(feel\s+free\s+to\s+)/gi, replacement: '', reason: 'Removed unnecessary conversational permission' },
  { regex: /\b(kindly\s+)/gi, replacement: '', reason: 'Removed polite filler "kindly"' },

  // Directives compression
  { regex: /\b(make\s+sure\s+(?:that\s+)?you\s+)/gi, replacement: 'Ensure to ', reason: 'Compressed directive phrase' },
  { regex: /\b(make\s+sure\s+to\s+)/gi, replacement: 'Ensure to ', reason: 'Compressed directive phrase' },
  { regex: /\b(in\s+order\s+to\s+)/gi, replacement: 'to ', reason: 'Shortened "in order to" to "to"' },
  { regex: /\b(due\s+to\s+the\s+fact\s+that\s+)/gi, replacement: 'because ', reason: 'Compressed phrase to "because"' },
  { regex: /\b(for\s+the\s+purpose\s+of\s+)/gi, replacement: 'for ', reason: 'Compressed phrase to "for"' },
  { regex: /\b(it\s+is\s+important\s+to\s+note\s+that\s+)/gi, replacement: 'Note: ', reason: 'Compressed verbose note declaration' },

  // Redundant Idioms & AI Disclaimers
  { regex: /\b(as\s+(?:you\s+know|we\s+all\s+know)\s*,?\s*)/gi, replacement: '', reason: 'Removed redundant idiom' },
  { regex: /\b(needless\s+to\s+say\s*,?\s*)/gi, replacement: '', reason: 'Removed redundant idiom' },
  { regex: /\b(at\s+the\s+end\s+of\s+the\s+day\s*,?\s*)/gi, replacement: '', reason: 'Removed verbal idiom' },
  { regex: /\b(basically\s*,?\s*)/gi, replacement: '', reason: 'Removed verbal crutch "basically"' },
  { regex: /\b(as\s+an\s+ai\s+(?:language\s+)?model\s*,?\s*)/gi, replacement: '', reason: 'Removed meta AI disclaimer' },

  // Vague phrase padding
  { regex: /\b(and\s+stuff(?:\s+like\s+that)?\b)/gi, replacement: '', reason: 'Removed ambiguous padding "and stuff"' },
  { regex: /\b(and\s+so\s+on(?:\s+and\s+so\s+forth)?\b)/gi, replacement: '', reason: 'Removed ambiguous padding "and so on"' },
  { regex: /\b(whatever\s+you\s+think(?:\s+is\s+best)?\b)/gi, replacement: '', reason: 'Removed vague instruction' },
  { regex: /\b(try\s+your\s+best|do\s+your\s+best)\b/gi, replacement: '', reason: 'Removed redundant plea' },
  { regex: /\b(make\s+it\s+(?:good|nice|cool|great)\s*,?\s*(?:and)?\s*)/gi, replacement: '', reason: 'Removed subjective instruction' },

  // Closings & Gratitude
  { regex: /\b(thanks\s+(?:a\s+lot|very\s+much|in\s+advance)?\s*!?)/gi, replacement: '', reason: 'Removed conversational sign-off' },
  { regex: /\b(thank\s+you\s+(?:so\s+much|very\s+much|in\s+advance)?\s*!?)/gi, replacement: '', reason: 'Removed conversational sign-off' },
];

export function optimizePrompt(original: string, model: ModelConfig): OptimizationResult {
  if (!original.trim()) {
    return {
      originalPrompt: original,
      optimizedPrompt: original,
      originalTokens: 0,
      optimizedTokens: 0,
      tokensSaved: 0,
      percentageSaved: 0,
      improvements: [],
    };
  }

  const origTokens = tokenizeText(original, model).length;
  const originalScore = scorePrompt(original, origTokens);
  const candidates = [
    { text: buildCandidate(original, FILLER_REPLACEMENTS), strategy: 'Balanced compression', risk: 0.08 },
    {
      text: buildCandidate(
        original,
        FILLER_REPLACEMENTS.filter((rule) => !/vague|subjective|plea|idiom|sign-off|disclaimer/.test(rule.reason.toLowerCase()))
      ),
      strategy: 'Conservative compression',
      risk: 0.03,
    },
    { text: normalizePrompt(original), strategy: 'Whitespace and syntax cleanup', risk: 0 },
  ]
    .map((candidate) => {
      const tokens = tokenizeText(candidate.text, model).length;
      const candidateScore = scorePrompt(candidate.text, tokens);
      const tokenGain = origTokens > 0 ? (origTokens - tokens) / origTokens : 0;
      const qualityGain = (candidateScore.overallScore - originalScore.overallScore) / 100;
      const wordLoss = Math.max(0, originalScore.wordCount - candidateScore.wordCount);
      const meaningRisk = originalScore.wordCount > 0 ? Math.min(1, wordLoss / originalScore.wordCount) : 0;
      const objective = tokenGain * 0.55 + qualityGain * 0.35 - (meaningRisk + candidate.risk) * 0.25;
      return { ...candidate, tokens, score: candidateScore, objective };
    })
    .filter((candidate) =>
      candidate.tokens < origTokens
      && candidate.score.overallScore >= originalScore.overallScore - 2
    )
    .sort((a, b) => b.objective - a.objective);

  const selected = candidates[0] ?? {
    text: original.trim(),
    strategy: 'No safe optimization',
    risk: 0,
    tokens: origTokens,
    score: originalScore,
    objective: 0,
  };
  const saved = Math.max(0, origTokens - selected.tokens);
  const percent = origTokens > 0 ? Math.round((saved / origTokens) * 100) : 0;
  const improvements: OptimizationResult['improvements'] = [];
  if (saved > 0) {
    improvements.push({
      type: 'filler_removed',
      description: `${selected.strategy} selected from ${candidates.length + 1} local candidates.`,
    });
  }
  if (selected.text !== original && saved === 0) {
    improvements.push({
      type: 'whitespace_cleaned',
      description: 'Text was normalized without claiming token savings.',
    });
  }

  return {
    originalPrompt: original,
    optimizedPrompt: selected.text,
    originalTokens: origTokens,
    optimizedTokens: selected.tokens,
    tokensSaved: saved,
    percentageSaved: percent,
    improvements,
    strategy: selected.strategy,
    qualityScore: selected.score.overallScore,
  };
}

function buildCandidate(original: string, rules: FillerRule[]): string {
  let text = original;
  for (const rule of rules) {
    const regex = new RegExp(rule.regex.source, 'gi');
    text = text.replace(regex, rule.replacement);
  }
  return normalizePrompt(text);
}

function normalizePrompt(text: string): string {
  return text
    .replace(/,\s*,+/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/^[.,!?;:\s]+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter((line, index, lines) => !(line === '' && lines[index - 1] === ''))
    .join('\n')
    .replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, prefix, char) => `${prefix}${char.toUpperCase()}`)
    .trim();
}

export function applySuggestion(prompt: string, suggestionId: string, model: ModelConfig): string {
  const trimmed = prompt.trim();
  switch (suggestionId) {
    case 'remove-filler':
      return optimizePrompt(trimmed, model).optimizedPrompt;
    case 'add-delimiters':
      return `${trimmed}\n\n<context>\nAdd relevant context here.\n</context>`;
    case 'add-role':
      return `You are an expert assistant for this task.\n\n${trimmed}`;
    case 'add-constraints':
      return `${trimmed}\n\nConstraints:\n- Be concise and direct.\n- Do not invent missing information.`;
    case 'add-output-spec':
      return `${trimmed}\n\nOutput format:\n- Use clear headings and concise bullet points.`;
    default:
      return prompt;
  }
}
