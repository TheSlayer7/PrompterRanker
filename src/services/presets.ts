import type { PromptPreset } from '../types/prompt';

export const PROMPT_PRESETS: PromptPreset[] = [
  {
    id: 'fluffy-unstructured',
    title: '⚠️ High-Fluff Word Salad (Try 1-Click Optimize)',
    category: 'Optimization Demos',
    description: 'A conversational, wordy prompt full of polite filler, vague constraints, and severe token waste.',
    prompt: `Hello there! Please could you kindly help me to write a nice blog post about artificial intelligence? 

I was wondering if you could make sure that you cover how AI is basically changing everything nowadays. In order to make it good, feel free to write whatever you think is best and make it cool and engaging, etc. 

As an AI language model, it is important to note that you should try your best. Needless to say, at the end of the day, I would really like you to make it relatively short and stuff. Thanks a lot!`,
  },
  {
    id: 'verbose-email-generator',
    title: '⚠️ Polite Client Email Bloat (Try 1-Click Optimize)',
    category: 'Optimization Demos',
    description: 'Polite corporate assistant prompt with conversational prefixes that waste tokens on every run.',
    prompt: `Good morning! Can you please go ahead and kindly draft a polite email to my client?

I would really like you to make sure that you apologize for the slight delay in the delivery of milestone 2. Due to the fact that our team was waiting for vendor approval, we couldn't finish it sooner. Needless to say, feel free to keep the tone friendly, polite, and basically reassuring. Thank you very much in advance!`,
  },
  {
    id: 'vague-summarizer',
    title: '⚠️ Vague & Ambiguous Prompt (Try 1-Click Optimize)',
    category: 'Optimization Demos',
    description: 'Ambiguous prompt with no role, no constraints, and filler words like "make it good and stuff".',
    prompt: `Can you please summarize this financial report for me and make it good? Tell me whatever you think is best, and stuff like that. Try your best to make it cool and clean. Thanks!`,
  },
  {
    id: 'rambling-code-prompt',
    title: '⚠️ Wordy Code Review (Try 1-Click Optimize)',
    category: 'Optimization Demos',
    description: 'Rambling developer request with hesitant phrasing and filler words.',
    prompt: `Hey there! I was wondering if you could help me to review this Python function. 

Please make sure to check if there are any SQL injection risks. In order to do this properly, basically look at the queries. As an AI model, please do your best and feel free to explain things simply and stuff. Thanks!`,
  },
  {
    id: 'production-system-prompt',
    title: '⭐ Production AI System Prompt (S-Tier)',
    category: 'System Prompts',
    description: 'High-scoring prompt featuring explicit role persona, XML delimiters, strict boundaries, and JSON output.',
    prompt: `You are an expert Senior Security Engineer auditing cloud application infrastructure.

### Role & Objective
Analyze the provided cloud configuration snippet for security vulnerabilities, misconfigurations, and non-compliance with CIS Benchmarks.

### Operating Rules
- Strictly evaluate for OWASP Top 10 and cloud IAM privilege escalation vectors.
- Do NOT include generic security introductions or polite conversational commentary.
- If no critical risks are found, explicitly declare "STATUS: SECURE".
- Avoid hypothetical conjecture; only cite concrete misconfigurations present in the input.

### Output Format
Provide your findings in a strict JSON array matching this schema:
[
  {
    "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
    "resource": "string",
    "cve_or_rule": "string",
    "description": "string",
    "remediation": "string"
  }
]`,
  },
  {
    id: 'rag-context-qa',
    title: '📄 RAG Document Q&A with Delimiters',
    category: 'RAG & Retrieval',
    description: 'Clean retrieval prompt utilizing XML tags to strictly isolate ground-truth context from user questions.',
    prompt: `You are a factual Question-Answering assistant. Answer the user query using ONLY the provided context documents.

<guidelines>
1. Ground every claim directly in the context provided between <context> tags.
2. If the context does not contain sufficient facts to answer, respond with: "The provided documents do not contain information regarding [topic]."
3. Do not invent citations or extrapolate beyond explicit facts.
</guidelines>

<context>
The Quantum X1 accelerator chip operates at a base clock frequency of 3.2 GHz and consumes 180W TDP. It includes 64GB of HBM3 memory with a peak memory bandwidth of 2.4 TB/s. The unit interface uses PCIe Gen 5.0 x16.
</context>

<user_query>
What is the memory bandwidth and TDP of the Quantum X1?
</user_query>`,
  },
  {
    id: 'code-refactor',
    title: '💻 TypeScript Refactoring & Unit Test',
    category: 'Coding & Engineering',
    description: 'Precise coding prompt with functional constraints, test coverage rules, and diff-only response requirements.',
    prompt: `You are a Principal TypeScript Engineer specialized in high-performance web applications.

### Task
Refactor the provided TypeScript function to achieve O(n) time complexity and eliminate nested loops.

### Constraints
- Retain complete type safety; avoid using 'any' or 'unknown' casting.
- Do NOT add external third-party dependencies.
- Return ONLY the updated code block with comprehensive Vitest unit test cases.
- Exclude introductory prose and conversational wrap-up.`,
  },
];
