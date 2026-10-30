import type { ModelConfig, ModelId, NamingStyle } from '../types/prompt';

export const SUPPORTED_MODELS: ModelConfig[] = [
  {
    id: 'aurora-prime',
    name: 'Aurora Prime',
    genericName: 'Frontier Omni (Aurora Core)',
    provider: 'AURORA',
    genericProvider: 'Northstar Lab',
    family: 'aurora_core',
    contextWindow: 128000,
    inputPricePerMillion: 2.50,
    outputPricePerMillion: 10.00,
    description: 'Flagship multimodal profile using the Aurora Core tokenizer.',
    badgeColor: '#10a37f'
  },
  {
    id: 'aurora-spark',
    name: 'Aurora Spark',
    genericName: 'Compact Omni (Aurora Core)',
    provider: 'AURORA',
    genericProvider: 'Northstar Lab',
    family: 'aurora_core',
    contextWindow: 128000,
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.60,
    description: 'Fast, lightweight, and cost-effective Aurora Core profile.',
    badgeColor: '#10a37f'
  },
  {
    id: 'ember-crown',
    name: 'Ember Crown',
    genericName: 'Frontier Reasoning (200k)',
    provider: 'EMBER',
    genericProvider: 'Emberworks',
    family: 'ember_bpe',
    contextWindow: 200000,
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    description: 'High-depth reasoning profile with BPE encoding.',
    badgeColor: '#d97706'
  },
  {
    id: 'ember-breeze',
    name: 'Ember Breeze',
    genericName: 'High-Speed BPE (200k)',
    provider: 'EMBER',
    genericProvider: 'Emberworks',
    family: 'ember_bpe',
    contextWindow: 200000,
    inputPricePerMillion: 0.80,
    outputPricePerMillion: 4.00,
    description: 'High-speed model for real-time prompt pipelines.',
    badgeColor: '#f59e0b'
  },
  {
    id: 'orbit-flare',
    name: 'Orbit Flare',
    genericName: 'Ultra-Fast Multimodal (1M)',
    provider: 'ORBIT',
    genericProvider: 'Orbit Foundry',
    family: 'orbit_sp',
    contextWindow: 1000000,
    inputPricePerMillion: 0.10,
    outputPricePerMillion: 0.40,
    description: '1M context window with Orbit SentencePiece-style tokenization.',
    badgeColor: '#3b82f6'
  },
  {
    id: 'orbit-depth',
    name: 'Orbit Depth',
    genericName: 'Deep Context (2M)',
    provider: 'ORBIT',
    genericProvider: 'Orbit Foundry',
    family: 'orbit_sp',
    contextWindow: 2000000,
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.00,
    description: 'Massive 2M token context window for heavy document analysis.',
    badgeColor: '#6366f1'
  },
  {
    id: 'quill-70',
    name: 'Quill 70',
    genericName: 'Open Weights 70B (128k)',
    provider: 'QUILL',
    genericProvider: 'Quill Collective',
    family: 'quill_bpe',
    contextWindow: 128000,
    inputPricePerMillion: 0.59,
    outputPricePerMillion: 0.79,
    description: 'Open-weights-style 128k BPE profile.',
    badgeColor: '#0ea5e9'
  },
  {
    id: 'nexus-v3',
    name: 'Nexus V3',
    genericName: 'High-Efficiency MoE (128k)',
    provider: 'NEXUS',
    genericProvider: 'Nexus Forge',
    family: 'quill_bpe',
    contextWindow: 128000,
    inputPricePerMillion: 0.14,
    outputPricePerMillion: 0.28,
    description: 'High-efficiency open-architecture mixture profile.',
    badgeColor: '#8b5cf6'
  },
  {
    id: 'aurora-legacy',
    name: 'Aurora Legacy',
    genericName: 'Legacy BPE (Aurora Core)',
    provider: 'AURORA',
    genericProvider: 'Northstar Lab',
    family: 'aurora_core',
    contextWindow: 128000,
    inputPricePerMillion: 10.00,
    outputPricePerMillion: 30.00,
    description: 'Previous-generation profile using the Aurora Core tokenizer.',
    badgeColor: '#64748b'
  }
];

export const DEFAULT_MODEL_ID: ModelId = 'aurora-prime';

export function getModelConfig(id: ModelId): ModelConfig {
  return SUPPORTED_MODELS.find(m => m.id === id) || SUPPORTED_MODELS[0];
}

export function getModelDisplayName(model: ModelConfig, style: NamingStyle = 'standard'): string {
  return style === 'neutral' ? model.genericName : model.name;
}

export function getModelProviderName(model: ModelConfig, style: NamingStyle = 'standard'): string {
  return style === 'neutral' ? model.genericProvider : model.provider;
}
