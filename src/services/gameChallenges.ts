import type { GameChallenge } from '../types/prompt';

export const GAME_CHALLENGES: GameChallenge[] = [
  {
    id: 'level-1-fluff-slayer',
    level: 1,
    title: 'Fluff Slayer',
    badge: '🗡️ Level 1',
    tagline: 'Eliminate conversational noise and polite bloat.',
    description: 'LLMs are statistical engines, not humans. Clean out all filler words like "please could you kindly", "help me to", and achieve a crisp prompt score of at least 75.',
    starterPrompt:
      'Hello there! Please could you kindly help me to write a short polite email to a client? I would really like you to make sure that you tell them the project is on track. As an AI language model, feel free to do your best and basically keep it nice.',
    targetScore: 75,
    hint: 'Remove conversational filler phrases ("Please could you kindly", "As an AI language model", "feel free to"), and specify concrete points to include in the email.',
    objectives: [
      {
        id: 'no-filler',
        label: 'Zero Conversational Filler Words Detected',
        check: (score) => score.detectedFillerWords.length === 0,
      },
      {
        id: 'score-75',
        label: 'Overall Quality Score ≥ 75',
        check: (score) => score.overallScore >= 75,
      },
      {
        id: 'min-length',
        label: 'Has at least 15 words of substantial instructions',
        check: (score) => score.wordCount >= 15,
      },
    ],
  },
  {
    id: 'level-2-architect',
    level: 2,
    title: 'The Delimiter Architect',
    badge: '🏛️ Level 2',
    tagline: 'Structure instructions using XML tags or markdown delimiters.',
    description: 'Production prompts rely on strict delimiters (e.g. <context>, <instructions>, <rules>) and explicit output formats so code parsers never break.',
    starterPrompt:
      'Extract the customer name and total dollar amount from customer feedback messages and give it back to me.',
    targetScore: 82,
    hint: 'Add XML tags (e.g., <input_data> or <rules>), markdown headings, and define an explicit output format like "Return a strict JSON object with fields: { customer: string, amount: number }".',
    objectives: [
      {
        id: 'delimiters',
        label: 'Use XML tags (<tag>) or Markdown headings (###)',
        check: (_score, prompt) =>
          /(<{1,3}[\w-]+>{1,3}|"""|```|###|---)/.test(prompt),
      },
      {
        id: 'output-format',
        label: 'Explicit Output Format specified (JSON, Markdown, Table)',
        check: (_score, prompt) =>
          /\b(json|markdown|table|bullet\s+points?|yaml|csv|code\s+block|schema)\b/i.test(prompt),
      },
      {
        id: 'score-80',
        label: 'Overall Quality Score ≥ 80',
        check: (score) => score.overallScore >= 80,
      },
    ],
  },
  {
    id: 'level-3-hallucination-ward',
    level: 3,
    title: 'Hallucination Shield',
    badge: '🛡️ Level 3',
    tagline: 'Erect boundary walls and negative constraints.',
    description: 'Prevent hallucinations by telling the model what NOT to do. Combine an explicit persona with at least two strict boundary constraints.',
    starterPrompt:
      'Summarize the quarterly financial report and tell me if there are any risks in the operations.',
    targetScore: 86,
    hint: 'Define an expert persona (e.g. "You are a Senior Financial Risk Auditor") and use explicit guardrails: "Do not extrapolate beyond facts", "Never fabricate metrics", "Only cite verified figures".',
    objectives: [
      {
        id: 'persona',
        label: 'Define a specific Persona or Role ("You are an expert...")',
        check: (_score, prompt) =>
          /\b(you\s+are\s+(?:an?|the)\s+[\w\s]{3,30}|act\s+as\s+(?:an?|the)\s+[\w\s]{3,30}|role\s*:)/i.test(prompt),
      },
      {
        id: 'constraints',
        label: 'Include 2+ negative guardrails ("Do not", "Never", "Avoid", "Only")',
        check: (_score, prompt) => {
          const matches = prompt.match(/\b(do\s+not|don't|never|avoid|must\s+not|without|exclude|only|strictly)\b/gi) || [];
          return matches.length >= 2;
        },
      },
      {
        id: 'score-85',
        label: 'Overall Quality Score ≥ 85',
        check: (score) => score.overallScore >= 85,
      },
    ],
  },
  {
    id: 'level-4-token-miser',
    level: 4,
    title: 'The Token Miser',
    badge: '💎 Level 4',
    tagline: 'Maximum semantic payload under a strict 70-token budget.',
    description: 'At 10,000,000 API calls, every token costs real money. Craft a high-performing prompt scoring 88+ while staying strictly under 70 tokens.',
    starterPrompt:
      'You are an expert security engineer. Review the provided SQL query for injection risks. <rules> - Only report OWASP Top 10 vulnerabilities. - Do not speculate. </rules> Output format: JSON { "vulnerable": boolean, "fix": string }',
    targetScore: 88,
    maxTokens: 70,
    hint: 'Cut every redundant preposition. Keep the XML tag structure, persona, constraints, and JSON format intact while staying under 70 tokens.',
    objectives: [
      {
        id: 'token-budget',
        label: 'Token Count ≤ 70 tokens',
        check: (_score, _prompt, tokens) => tokens <= 70 && tokens > 15,
      },
      {
        id: 'score-88',
        label: 'Overall Quality Score ≥ 88',
        check: (score) => score.overallScore >= 88,
      },
      {
        id: 'no-fluff',
        label: 'Zero conversational fluff',
        check: (score) => score.detectedFillerWords.length === 0,
      },
    ],
  },
  {
    id: 'level-5-grandmaster',
    level: 5,
    title: 'Grandmaster S-Tier',
    badge: '👑 Level 5',
    tagline: 'Craft an S-Tier master prompt with pristine structure.',
    description: 'The pinnacle of prompt engineering: achieve a 95+ score (Grade S) by harmonizing persona, XML delimiters, negative constraints, output schema, and maximum token efficiency.',
    starterPrompt:
      `# ROLE: Lead DevOps & Reliability Architect

## OBJECTIVE
Validate Kubernetes pod configurations against strict production hardening standards.

## INPUT
<pod_spec>
Provide manifest YAML here
</pod_spec>

## CONSTRAINTS & RULES
- Strictly verify against CIS Kubernetes Benchmark v1.8.
- Do not approve containers running as root.
- Never output speculative suggestions without citing line numbers.
- Only flag High and Critical severities.

## OUTPUT SPECIFICATION
Respond exclusively in valid JSON matching this schema:
{
  "compliant": boolean,
  "violations": Array<{ "line": number, "rule": string, "remediation": string }>
}`,
    targetScore: 95,
    hint: 'Maintain full structure: markdown headers, explicit role, XML tags, multiple negative constraints, and strict JSON output specification without any filler words.',
    objectives: [
      {
        id: 'score-95',
        label: 'Achieve Grandmaster S-Tier Score ≥ 95',
        check: (score) => score.overallScore >= 95,
      },
      {
        id: 'all-criteria-good',
        label: 'Zero detected filler words & zero vague phrasing',
        check: (score) => score.detectedFillerWords.length === 0,
      },
      {
        id: 'structure-mastery',
        label: 'Structure & Formatting Criterion Score ≥ 90',
        check: (score) => (score.criteria['structure']?.score ?? 0) >= 90,
      },
    ],
  },
];

export interface BattlePreset {
  id: string;
  name: string;
  description: string;
  promptA: { title: string; prompt: string };
  promptB: { title: string; prompt: string };
}

export const BATTLE_PRESETS: BattlePreset[] = [
  {
    id: 'polite-vs-engineered',
    name: 'Polite Conversationalist vs Lean Engineer',
    description: 'Compare an everyday polite conversational prompt with high token fluff against a disciplined engineering prompt.',
    promptA: {
      title: 'Polite Conversationalist',
      prompt:
        'Hello there! Please could you kindly help me to write a short polite email to a client? I would really like you to make sure that you tell them the project is on track. As an AI language model, feel free to do your best and basically keep it nice and clean, etc.',
    },
    promptB: {
      title: 'Lean AI Engineer',
      prompt:
        'You are a Client Communications Director.\n\nDraft a concise 3-paragraph project status email confirming on-time delivery for Milestone 2.\n\n### Constraints:\n- Maintain a confident, professional tone.\n- Do not include technical jargon.\n- Limit response to under 120 words.',
    },
  },
  {
    id: 'vague-vs-guarded',
    name: 'Vague Summarizer vs Hallucination-Proof',
    description: 'Compare an unconstrained, ambiguous prompt against an auditor prompt with negative guardrails.',
    promptA: {
      title: 'Vague Summarizer',
      prompt:
        'Can you summarize this financial report for me and make it good? Tell me whatever you think is best and and stuff like that.',
    },
    promptB: {
      title: 'Hallucination-Proof Auditor',
      prompt:
        '# ROLE: Senior Financial Auditor\n\n## TASK\nExtract key revenue metrics from <quarterly_report>.\n\n## CONSTRAINTS\n- Strictly extract explicit numbers. Do not extrapolate.\n- Never speculate on future earnings.\n- Format as a Markdown comparison table with columns: [Metric, Q2 Actual, Q3 Actual, YoY Change%].',
    },
  },
  {
    id: 'blob-vs-xml-schema',
    name: 'Wall of Text vs Structured XML Spec',
    description: 'Compare an unstructured blob of instructions with an XML-delimited schema prompt.',
    promptA: {
      title: 'Unstructured Blob',
      prompt:
        'I have a bunch of customer support transcripts and I want you to pull out sentiment whether positive or negative and also find if they mentioned any bugs or pricing complaints and give me a list of all of them and make sure you do a great job.',
    },
    promptB: {
      title: 'Structured XML Spec',
      prompt:
        'You are an Automated Support Analytics Engine.\n\n<task>\nAnalyze incoming customer dialogue in <transcript> tags.\n</task>\n\n<constraints>\n- Only classify sentiment as POSITIVE, NEUTRAL, or NEGATIVE.\n- Do not summarize general pleasantries.\n</constraints>\n\n<output_format>\nReturn valid JSON:\n{\n  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",\n  "bug_reports": string[],\n  "pricing_objections": string[]\n}\n</output_format>',
    },
  },
];

