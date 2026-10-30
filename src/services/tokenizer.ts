import { encode as encodeAuroraCore, decode as decodeAuroraCore } from 'gpt-tokenizer/esm/encoding/o200k_base';
import { encode as encodeAuroraLegacy, decode as decodeAuroraLegacy } from 'gpt-tokenizer/esm/encoding/cl100k_base';
import type { TokenChunk, ModelConfig } from '../types/prompt';

const COLOR_CLASSES = [
  'token-color-0',
  'token-color-1',
  'token-color-2',
  'token-color-3',
  'token-color-4',
  'token-color-5',
  'token-color-6',
  'token-color-7',
];

/**
 * Tokenizes text according to the selected model's tokenizer family.
 * Produces an array of TokenChunks with token IDs, text pieces, byte lengths, and color indices.
 */
export function tokenizeText(text: string, model: ModelConfig): TokenChunk[] {
  if (!text) return [];

  try {
    switch (model.family) {
      case 'aurora_core':
        return tokenizeAurora(text);
      case 'ember_bpe':
        return tokenizeEmber(text);
      case 'quill_bpe':
        return tokenizeQuill(text);
      case 'orbit_sp':
        return tokenizeOrbit(text);
      default:
        return tokenizeAurora(text);
    }
  } catch (error) {
    console.error('Tokenization fallback due to error:', error);
    return fallbackRegexTokenizer(text);
  }
}

/**
 * Aurora Core tokenization used by the Aurora profiles.
 */
function tokenizeAurora(text: string): TokenChunk[] {
  const tokenIds = encodeAuroraCore(text);
  const chunks: TokenChunk[] = [];
  let currentOffset = 0;

  for (let i = 0; i < tokenIds.length; i++) {
    const id = tokenIds[i];
    const piece = decodeAuroraCore([id]);
    const byteLength = new TextEncoder().encode(piece).length;

    // Locate char offset
    const charStart = currentOffset;
    const charEnd = currentOffset + piece.length;
    currentOffset = charEnd;

    chunks.push({
      id,
      text: piece,
      index: i,
      byteLength,
      charStart,
      charEnd,
      isWhitespaceOnly: /^\s+$/.test(piece),
      colorClass: COLOR_CLASSES[i % COLOR_CLASSES.length],
    });
  }

  return chunks;
}

/**
 * Aurora Legacy tokenization.
 */
function tokenizeAuroraLegacy(text: string): TokenChunk[] {
  const tokenIds = encodeAuroraLegacy(text);
  const chunks: TokenChunk[] = [];
  let currentOffset = 0;

  for (let i = 0; i < tokenIds.length; i++) {
    const id = tokenIds[i];
    const piece = decodeAuroraLegacy([id]);
    const byteLength = new TextEncoder().encode(piece).length;

    const charStart = currentOffset;
    const charEnd = currentOffset + piece.length;
    currentOffset = charEnd;

    chunks.push({
      id,
      text: piece,
      index: i,
      byteLength,
      charStart,
      charEnd,
      isWhitespaceOnly: /^\s+$/.test(piece),
      colorClass: COLOR_CLASSES[i % COLOR_CLASSES.length],
    });
  }

  return chunks;
}

/**
 * Ember BPE tokenizer approximation.
 */
function tokenizeEmber(text: string): TokenChunk[] {
  const baseTokens = tokenizeAuroraLegacy(text);
  return baseTokens.map((chunk, idx) => ({
    ...chunk,
    id: 100000 + (chunk.id % 65000),
    colorClass: COLOR_CLASSES[idx % COLOR_CLASSES.length],
  }));
}

/**
 * Quill BPE tokenizer (128k vocabulary format).
 */
function tokenizeQuill(text: string): TokenChunk[] {
  const baseTokens = tokenizeAurora(text);
  return baseTokens.map((chunk, idx) => ({
    ...chunk,
    id: 128000 + (chunk.id % 128000),
    colorClass: COLOR_CLASSES[idx % COLOR_CLASSES.length],
  }));
}

/**
 * Orbit SentencePiece-style tokenizer simulation.
 */
function tokenizeOrbit(text: string): TokenChunk[] {
  const spRegex = /(?:\s+[a-zA-Z0-9]+|[a-zA-Z0-9]+|[^\s\w]+|\s+)/g;
  const matches = text.match(spRegex) || [text];
  const chunks: TokenChunk[] = [];
  let currentOffset = 0;

  matches.forEach((piece) => {
    if (piece.length > 12 && !/^\s+$/.test(piece)) {
      const subParts = piece.match(/.{1,6}/g) || [piece];
      subParts.forEach(sub => {
        const byteLength = new TextEncoder().encode(sub).length;
        const charStart = currentOffset;
        const charEnd = currentOffset + sub.length;
        currentOffset = charEnd;
        const hashId = hashStringToTokenId(sub, 256000);
        chunks.push({
          id: hashId,
          text: sub,
          index: chunks.length,
          byteLength,
          charStart,
          charEnd,
          isWhitespaceOnly: /^\s+$/.test(sub),
          colorClass: COLOR_CLASSES[chunks.length % COLOR_CLASSES.length],
        });
      });
    } else {
      const byteLength = new TextEncoder().encode(piece).length;
      const charStart = currentOffset;
      const charEnd = currentOffset + piece.length;
      currentOffset = charEnd;
      const hashId = hashStringToTokenId(piece, 256000);

      chunks.push({
        id: hashId,
        text: piece,
        index: chunks.length,
        byteLength,
        charStart,
        charEnd,
        isWhitespaceOnly: /^\s+$/.test(piece),
        colorClass: COLOR_CLASSES[chunks.length % COLOR_CLASSES.length],
      });
    }
  });

  return chunks;
}

/**
 * Fallback regex tokenizer in case of encoding errors
 */
function fallbackRegexTokenizer(text: string): TokenChunk[] {
  const parts = text.match(/\w+|[^\w\s]|\s+/g) || [text];
  let offset = 0;
  return parts.map((part, idx) => {
    const charStart = offset;
    const charEnd = offset + part.length;
    offset = charEnd;
    return {
      id: 50000 + idx,
      text: part,
      index: idx,
      byteLength: new TextEncoder().encode(part).length,
      charStart,
      charEnd,
      isWhitespaceOnly: /^\s+$/.test(part),
      colorClass: COLOR_CLASSES[idx % COLOR_CLASSES.length],
    };
  });
}

function hashStringToTokenId(str: string, maxVocab: number): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash) % maxVocab;
}
