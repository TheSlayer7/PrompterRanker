# PrompterRanker

<div align="center">

### A sleek prompt quality and token-efficiency workbench

Measure prompt quality, inspect token structure, compare estimated usage, and apply conservative local optimizations.

[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vite.dev/)

</div>

---

## Overview

PrompterRanker is a client-side React application for evaluating and refining prompts before they are used in an AI workflow. All scoring, tokenization, and optimization run locally in the browser; the app does not call an external API or LLM.

> **A fun educational project:** PrompterRanker is built for learning, experimentation, and exploring prompt quality and tokenization concepts. Its scores, estimates, and optimization suggestions are practical heuristics rather than authoritative measurements.

It provides:

- Five-dimension prompt quality scoring
- Token counting and visual token inspection
- Candidate-based prompt optimization
- Before-and-after optimization comparisons
- Estimated usage and context-window calculations
- Prompt templates and saved prompt versions
- Prompt comparison and challenge modes
- Exportable reports and prompt libraries
- Dark and light themes with a responsive interface

All model, provider, and tokenizer names shown in the application are **fictional internal aliases**. They are used only to organize profiles, display labels, context sizes, and estimates. They do not identify, represent, or guarantee compatibility with an external model.

The fictional model names are used for educational purposes. PrompterRanker is a fun project for experimenting with prompt quality, tokenization, and local estimation workflows; it is not affiliated with or an official tool for any model provider.

## Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                    React interface                       │
│ Studio · Token Lab · Arena · Library · Cost · History    │
└──────────────────────────┬───────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────┐
│                         App.tsx                          │
│ state · page navigation · sharing · exports · callbacks  │
└───────────────┬──────────────┬──────────────┬─────────────┘
                │              │              │
       ┌────────▼───────┐ ┌────▼────────┐ ┌───▼────────────┐
       │ tokenizer.ts   │ │ scorer.ts   │ │ optimizer.ts  │
       │ token chunks   │ │ quality     │ │ candidates    │
       │ and counts     │ │ score       │ │ and selection │
       └────────┬───────┘ └────┬────────┘ └───┬────────────┘
                └──────────────┴──────────────┘
                               │
                    ┌──────────▼──────────┐
                    │     models.ts       │
                    │ aliases and metrics │
                    └─────────────────────┘
```

### Main layers

| Layer | Location | Responsibility |
| --- | --- | --- |
| Interface | `src/components/` | Pages, panels, controls, and visualizations |
| Application state | `src/App.tsx` | Prompt state, selected alias, navigation, and actions |
| Scoring | `src/services/scorer.ts` | Deterministic quality scoring from 0 to 100 |
| Tokenization | `src/services/tokenizer.ts` | Token counts and visual token metadata |
| Optimization | `src/services/optimizer.ts` | Candidate generation, evaluation, and selection |
| Alias configuration | `src/services/models.ts` | Internal labels, families, context values, and estimates |
| Styling | `src/index.css` | Themes, layout, responsive behavior, and visual system |

### Optimization flow

```text
Prompt
  │
  ├── Balanced compression
  ├── Conservative compression
  └── Whitespace and syntax cleanup
          │
          ▼
  Tokenize and score every candidate
          │
          ▼
  Reject token increases or meaningful score regressions
          │
          ▼
  Select the best measurable candidate
```

The optimizer combines token savings, quality gain, and an estimated meaning-risk penalty. It is intentionally transparent and conservative. It does not perform semantic reasoning, so the generated diff should be reviewed before applying it.

## Fictional model names

The following fictional names are defined by the project. They are not references to specific external models:

| Alias | Family label | Purpose |
| --- | --- | --- |
| `Aurora Prime` | `aurora_core` | Primary high-vocabulary tokenizer profile |
| `Aurora Spark` | `aurora_core` | Compact tokenizer profile |
| `Aurora Legacy` | `aurora_core` | Legacy tokenizer profile |
| `Ember Crown` | `ember_bpe` | BPE comparison profile |
| `Ember Breeze` | `ember_bpe` | Compact BPE comparison profile |
| `Orbit Flare` | `orbit_sp` | SentencePiece-style comparison profile |
| `Orbit Depth` | `orbit_sp` | Extended SentencePiece-style profile |
| `Quill 70` | `quill_bpe` | Open-weights-style BPE comparison profile |
| `Nexus V3` | `quill_bpe` | Mixture-style BPE comparison profile |

The family labels `aurora_core`, `ember_bpe`, `orbit_sp`, and `quill_bpe` are fictional project aliases. They should not be interpreted as guarantees about any external tokenizer or model.

## Run locally

### Requirements

- Node.js 20.19+ or Node.js 22.12+
- npm

### Install

```bash
git clone https://github.com/<your-username>/PrompterRanker.git
cd PrompterRanker
npm install
```

### Start development

```bash
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

On Windows PowerShell, use `npm.cmd` if PowerShell blocks npm scripts:

```powershell
npm.cmd install
npm.cmd run dev
```

### Build and validate

```bash
npm run lint
npm run build
npm run preview
```

The production build is written to `dist/`.

## Using the application

1. Open **Studio** and enter or paste a prompt.
2. Select an internal alias from the model selector.
3. Review the quality score and criterion breakdown.
4. Open the optimization preview to compare the original and selected candidate.
5. Apply the candidate only after reviewing the diff.
6. Use **Token Lab** to inspect token chunks and metadata.
7. Save useful versions to the prompt library.
8. Use **Cost Matrix** for local estimates based on the configured alias values.

## Repository layout

```text
src/
├── components/       Interface pages and reusable UI
├── services/
│   ├── models.ts      Internal aliases and configuration
│   ├── optimizer.ts   Candidate-based optimizer
│   ├── presets.ts     Example prompts and templates
│   ├── scorer.ts      Prompt quality scoring
│   └── tokenizer.ts   Token counting and visualization data
├── types/             Shared TypeScript types
├── App.tsx            Application state and page composition
├── index.css          Theme and responsive styles
└── main.tsx           React entry point
```

## Contributing

1. Create a branch for your change.
2. Keep changes focused and consistent with the existing UI.
3. Run `npm run lint` and `npm run build`.
4. Include before-and-after examples when changing scoring or optimization behavior.
5. Open a pull request describing the change and its validation.

## License

PrompterRanker is released under the [MIT License](./LICENSE).

You may use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the software, subject to the conditions in the license. The software is provided without warranty. See [LICENSE](./LICENSE) for the complete terms.

Third-party dependency attribution is summarized in [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md). Dependencies retain their own licenses.

The build toolchain includes `lightningcss` under MPL-2.0 as a transitive, build-time dependency of Vite. It is not application code.
