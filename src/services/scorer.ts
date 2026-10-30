import type { Grade, PromptScore, ScoringCriterion, Suggestion, FillerMatch } from '../types/prompt';

// List of conversational filler phrases and redundancy patterns commonly found in prompts
const FILLER_PATTERNS: Array<{ regex: RegExp; phrase: string; replacement: string; tokenImpact: number }> = [
  { regex: /\b(please\s+(?:could|can)\s+you\s+(?:kindly\s+)?(?:help\s+me\s+to\s+)?)/gi, phrase: 'please could you kindly help me to', replacement: '', tokenImpact: 7 },
  { regex: /\b(can\s+you\s+please\s+(?:go\s+ahead\s+and\s+)?)/gi, phrase: 'can you please go ahead and', replacement: '', tokenImpact: 6 },
  { regex: /\b(i\s+would\s+(?:really\s+)?like\s+you\s+to\s+)/gi, phrase: 'I would really like you to', replacement: '', tokenImpact: 5 },
  { regex: /\b(i\s+was\s+wondering\s+if\s+you\s+could\s+)/gi, phrase: 'I was wondering if you could', replacement: '', tokenImpact: 6 },
  { regex: /\b(make\s+sure\s+(?:that\s+)?you\s+)/gi, phrase: 'make sure that you', replacement: 'Ensure to', tokenImpact: 3 },
  { regex: /\b(in\s+order\s+to\s+)/gi, phrase: 'in order to', replacement: 'to', tokenImpact: 2 },
  { regex: /\b(as\s+(?:you\s+know|we\s+all\s+know)\s*,?\s*)/gi, phrase: 'as you know,', replacement: '', tokenImpact: 4 },
  { regex: /\b(needless\s+to\s+say\s*,?\s*)/gi, phrase: 'needless to say,', replacement: '', tokenImpact: 4 },
  { regex: /\b(at\s+the\s+end\s+of\s+the\s+day\s*,?\s*)/gi, phrase: 'at the end of the day,', replacement: '', tokenImpact: 6 },
  { regex: /\b(it\s+is\s+important\s+to\s+note\s+that\s+)/gi, phrase: 'it is important to note that', replacement: 'Note:', tokenImpact: 5 },
  { regex: /\b(feel\s+free\s+to\s+)/gi, phrase: 'feel free to', replacement: '', tokenImpact: 3 },
  { regex: /\b(as\s+an\s+ai\s+(?:language\s+)?model\s*,?\s*)/gi, phrase: 'as an AI language model,', replacement: '', tokenImpact: 5 },
  { regex: /\b(due\s+to\s+the\s+fact\s+that\s+)/gi, phrase: 'due to the fact that', replacement: 'because', tokenImpact: 4 },
  { regex: /\b(for\s+the\s+purpose\s+of\s+)/gi, phrase: 'for the purpose of', replacement: 'for', tokenImpact: 3 },
  { regex: /\b(basically\s*,?\s*)/gi, phrase: 'basically', replacement: '', tokenImpact: 2 },
];

const VAGUE_PATTERNS = [
  /\b(make\s+it\s+(?:good|nice|cool|great))\b/i,
  /\b(etc\.?|and\s+so\s+on|and\s+stuff)\b/i,
  /\b(whatever\s+you\s+think(?:\s+is\s+best)?)\b/i,
  /\b(do\s+your\s+best)\b/i,
  /\b(something\s+like\s+that)\b/i,
];

const ROLE_PATTERNS = [
  /\b(you\s+are\s+(?:an?|the)\s+[\w\s]{3,30})/i,
  /\b(act\s+as\s+(?:an?|the)\s+[\w\s]{3,30})/i,
  /\b(role\s*:\s*[\w\s]{3,30})/i,
  /\b(persona\s*:\s*[\w\s]{3,30})/i,
];

const OUTPUT_PATTERNS = [
  /\b(json|markdown|table|bullet\s+points?|list|step-by-step|yaml|csv|code\s+block|summary)\b/i,
  /\b(output\s+(?:format|as|in|should\s+be))\b/i,
  /\b(respond\s+(?:with|in|only\s+with))\b/i,
  /\b(return\s+(?:only|a|an))\b/i,
];

const CONSTRAINT_PATTERNS = [
  /\b(do\s+not|don't|never|avoid|must\s+not|without|exclude|only|strictly)\b/i,
  /\b(limit\s+to|maximum\s+of|under\s+\d+\s+words|concise)\b/i,
  /\b(constraints?|rules?|guidelines?)\s*:/i,
];

export function scorePrompt(prompt: string, tokenCount: number): PromptScore {
  const trimmed = prompt.trim();

  // Basic stats
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const charCount = trimmed.length;
  const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0) : [];
  const sentenceCount = sentences.length || 1;
  const tokensPerWord = wordCount > 0 ? parseFloat((tokenCount / wordCount).toFixed(2)) : 0;

  if (!trimmed || wordCount === 0) {
    return createEmptyScore();
  }

  // 1. Structure & Formatting (weight: 25%)
  const hasMarkdownHeaders = /^#{1,4}\s+/m.test(trimmed);
  const hasBulletPoints = /^[\s]*[-*•]\s+/m.test(trimmed) || /^[\s]*\d+\.\s+/m.test(trimmed);
  const hasDelimiters = /(<{2,3}[\w-]+>{2,3}|<{1}[\w-]+>{1}|"""|'''|```|---|===|###)/.test(trimmed);
  const hasSections = (trimmed.match(/\n{2,}/g) || []).length >= 1;

  let structureScore = 20; // baseline
  const structureDetails: string[] = [];
  if (hasMarkdownHeaders) {
    structureScore += 30;
    structureDetails.push('Uses markdown headings to organize instructions');
  }
  if (hasDelimiters) {
    structureScore += 25;
    structureDetails.push('Uses clear delimiters (XML/markdown tags) to isolate data & context');
  }
  if (hasBulletPoints) {
    structureScore += 15;
    structureDetails.push('Includes bullet or numbered list hierarchy');
  }
  if (hasSections) {
    structureScore += 10;
    structureDetails.push('Structured into distinct logical paragraphs/sections');
  }
  structureScore = Math.min(100, structureScore);

  // 2. Clarity & Persona (weight: 20%)
  const hasRole = ROLE_PATTERNS.some(p => p.test(trimmed));
  const hasVagueness = VAGUE_PATTERNS.filter(p => p.test(trimmed));
  const hasReasonableLength = wordCount >= 15;

  let clarityScore = 40;
  const clarityDetails: string[] = [];
  if (hasRole) {
    clarityScore += 35;
    clarityDetails.push('Defines a clear AI persona or professional role');
  }
  if (hasReasonableLength) {
    clarityScore += 15;
    clarityDetails.push('Sufficient context and instructions provided');
  }
  if (hasVagueness.length === 0) {
    clarityScore += 15;
    clarityDetails.push('Free of ambiguous terms (e.g., "etc.", "make it good")');
  } else {
    clarityScore -= hasVagueness.length * 15;
    clarityDetails.push(`Contains ${hasVagueness.length} vague or ambiguous phrase(s)`);
  }
  clarityScore = Math.max(10, Math.min(100, clarityScore));

  // 3. Token Economy & Density (weight: 25%)
  const detectedFiller: FillerMatch[] = [];
  let totalFillerTokens = 0;

  FILLER_PATTERNS.forEach(fp => {
    const matches = trimmed.match(fp.regex);
    if (matches && matches.length > 0) {
      const impact = matches.length * fp.tokenImpact;
      totalFillerTokens += impact;
      detectedFiller.push({
        phrase: fp.phrase,
        count: matches.length,
        tokenImpact: impact,
      });
    }
  });

  let economyScore = 95;
  const economyDetails: string[] = [];
  if (detectedFiller.length > 0) {
    const penalty = Math.min(60, totalFillerTokens * 2.5);
    economyScore -= penalty;
    economyDetails.push(`${detectedFiller.length} filler phrase types detected (~${totalFillerTokens} tokens wasted)`);
  } else {
    economyDetails.push('Zero conversational filler phrases detected');
  }

  // Check for excessive whitespace or repetitive lines
  const hasExcessiveWhitespace = /\s{3,}/.test(trimmed);
  if (hasExcessiveWhitespace) {
    economyScore -= 10;
    economyDetails.push('Redundant whitespace gaps found');
  }
  economyScore = Math.max(15, Math.min(100, Math.round(economyScore)));

  // 4. Constraints & Rules (weight: 15%)
  const hasConstraints = CONSTRAINT_PATTERNS.some(p => p.test(trimmed));
  let constraintScore = 30;
  const constraintDetails: string[] = [];
  if (hasConstraints) {
    constraintScore += 60;
    constraintDetails.push('Specifies explicit negative constraints or operational rules');
  } else {
    constraintDetails.push('No explicit boundaries, limits, or negative constraints defined');
  }
  constraintScore = Math.min(100, constraintScore);

  // 5. Output Specification (weight: 15%)
  const hasOutputSpec = OUTPUT_PATTERNS.some(p => p.test(trimmed));
  let outputScore = 25;
  const outputDetails: string[] = [];
  if (hasOutputSpec) {
    outputScore += 70;
    outputDetails.push('Defines target output schema, format, or structure');
  } else {
    outputDetails.push('Output format not explicitly specified (defaults to model choice)');
  }
  outputScore = Math.min(100, outputScore);

  // Weighted overall score
  const overall = Math.round(
    structureScore * 0.25 +
    clarityScore * 0.20 +
    economyScore * 0.25 +
    constraintScore * 0.15 +
    outputScore * 0.15
  );

  const criteria: Record<string, ScoringCriterion> = {
    structure: {
      id: 'structure',
      name: 'Structure & Delimiters',
      score: structureScore,
      weight: 25,
      status: getStatus(structureScore),
      feedback: structureScore >= 80 ? 'Well organized with headings and clean delimiters' : 'Needs headings, lists, or XML delimiters',
      details: structureDetails,
    },
    clarity: {
      id: 'clarity',
      name: 'Clarity & Persona',
      score: clarityScore,
      weight: 20,
      status: getStatus(clarityScore),
      feedback: clarityScore >= 80 ? 'Clear persona and concise intent' : 'Clarify the target role and remove ambiguous phrases',
      details: clarityDetails,
    },
    economy: {
      id: 'economy',
      name: 'Token Economy & Fluff',
      score: economyScore,
      weight: 25,
      status: getStatus(economyScore),
      feedback: economyScore >= 80 ? 'High density, minimal filler tokens' : 'Wasting tokens on conversational pleasantries',
      details: economyDetails,
    },
    constraints: {
      id: 'constraints',
      name: 'Constraints & Boundaries',
      score: constraintScore,
      weight: 15,
      status: getStatus(constraintScore),
      feedback: constraintScore >= 70 ? 'Strong negative rules and guardrails' : 'Add negative constraints ("Do not...", "Only...")',
      details: constraintDetails,
    },
    output: {
      id: 'output',
      name: 'Output Specification',
      score: outputScore,
      weight: 15,
      status: getStatus(outputScore),
      feedback: outputScore >= 70 ? 'Target output format clearly defined' : 'Specify output format (e.g. JSON, Markdown table, bullets)',
      details: outputDetails,
    },
  };

  // Compile Suggestions
  const suggestions: Suggestion[] = [];

  if (detectedFiller.length > 0) {
    suggestions.push({
      id: 'remove-filler',
      title: `Eliminate ${detectedFiller.length} filler phrases`,
      description: `Conversational phrases like "${detectedFiller[0].phrase}" add no value to LLM reasoning. Stripping them saves ~${totalFillerTokens} tokens per run.`,
      severity: totalFillerTokens > 15 ? 'high' : 'medium',
      category: 'Token Economy',
      tokenSavingsEstimate: totalFillerTokens,
    });
  }

  if (!hasDelimiters) {
    suggestions.push({
      id: 'add-delimiters',
      title: 'Wrap input data with XML tags or triple quotes',
      description: 'Use tags like <input_text>...</input_text> or ### Context to separate instructions from user content. This prevents prompt confusion.',
      severity: 'high',
      category: 'Prompt Structure',
    });
  }

  if (!hasRole) {
    suggestions.push({
      id: 'add-role',
      title: 'Specify an expert persona',
      description: 'Prefix the prompt with a role definition (e.g. "You are a Senior Systems Architect specialized in...") to tune model priors.',
      severity: 'medium',
      category: 'Clarity',
    });
  }

  if (!hasConstraints) {
    suggestions.push({
      id: 'add-constraints',
      title: 'Define explicit negative constraints',
      description: 'Tell the model what NOT to do (e.g. "Do not explain the code", "Avoid preamble"). This reduces output token bloat by up to 40%.',
      severity: 'medium',
      category: 'Guardrails',
    });
  }

  if (!hasOutputSpec) {
    suggestions.push({
      id: 'add-output-spec',
      title: 'Specify exact output format',
      description: 'Request a specific format such as "Respond in strict JSON with keys: { ... }" or "Provide a markdown comparison table".',
      severity: 'low',
      category: 'Output Format',
    });
  }

  // Compile strengths
  const strengths: string[] = [];
  if (hasRole) strengths.push('Explicit role definition guides model behavior effectively');
  if (hasMarkdownHeaders) strengths.push('Clear markdown headings improve instruction following');
  if (hasDelimiters) strengths.push('Delimiters cleanly isolate context from commands');
  if (hasConstraints) strengths.push('Explicit boundary constraints reduce hallucinations');
  if (hasOutputSpec) strengths.push('Exact response format reduces formatting ambiguity');
  if (detectedFiller.length === 0 && wordCount >= 10) strengths.push('Crisp, direct language with zero conversational filler');

  return {
    overallScore: overall,
    letterGrade: getLetterGrade(overall),
    criteria,
    suggestions,
    detectedFillerWords: detectedFiller,
    strengths,
    wordCount,
    charCount,
    sentenceCount,
    tokensPerWord,
  };
}

function getStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

function getLetterGrade(score: number): Grade {
  if (score >= 92) return 'S';
  if (score >= 85) return 'A+';
  if (score >= 75) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}

function createEmptyScore(): PromptScore {
  return {
    overallScore: 0,
    letterGrade: 'F',
    criteria: {},
    suggestions: [],
    detectedFillerWords: [],
    strengths: [],
    wordCount: 0,
    charCount: 0,
    sentenceCount: 0,
    tokensPerWord: 0,
  };
}
