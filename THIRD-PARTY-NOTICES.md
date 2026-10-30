# Third-Party Notices

PrompterRanker includes or depends on the open-source packages listed below. These packages remain the property of their respective authors and are distributed under their own licenses. This file is an attribution summary; the exact dependency versions and license metadata are recorded in [`package-lock.json`](./package-lock.json).

## Direct dependencies

| Package | Version range | License |
| --- | --- | --- |
| `@types/canvas-confetti` | `^1.9.0` | MIT |
| `canvas-confetti` | `^1.9.4` | ISC |
| `gpt-tokenizer` | `^4.1.0` | MIT |
| `lucide-react` | `^1.64.0` | ISC |
| `react` | `^19.3.1` | MIT |
| `react-dom` | `^19.3.1` | MIT |
| `@types/react` | `^19.3.0` | MIT |

## Development dependencies

| Package | Version range | License |
| --- | --- | --- |
| `@types/node` | `^24.19.2` | MIT |
| `@types/react-dom` | `^19.3.0` | MIT |
| `@vitejs/plugin-react` | `^6.1.2` | MIT |
| `oxlint` | `^1.89.0` | MIT |
| `typescript` | `~7.0.2` | Apache-2.0 |
| `vite` | `^8.3.5` | MIT |

## Transitive dependencies

The build and development toolchain also installs transitive packages. Their exact names, versions, integrity hashes, and declared licenses are tracked in [`package-lock.json`](./package-lock.json).

The dependency tree currently includes these license families:

- MIT
- Apache-2.0
- ISC
- BSD-3-Clause
- BSD-2-Clause
- CC0-1.0
- MPL-2.0

Notable transitive packages include:

- `lightningcss` (MPL-2.0), pulled in by Vite for build-time CSS processing
- `source-map-js` (BSD-3-Clause)
- `detect-libc` (Apache-2.0)
- Platform-specific optional bindings used by the build tools

Vite also distributes a bundled artifact notice in [`node_modules/vite/LICENSE.md`](./node_modules/vite/LICENSE.md). That notice includes BSD-2-Clause and CC0-1.0 material from components bundled with the Vite toolchain. These licenses are not separate root npm dependencies in this project; they are included in Vite's own attribution notice.

`lightningcss` is a development/build dependency. It is not imported by the application source and is not required by the deployed browser bundle.

## License texts and attribution

The project does not replace or relicense third-party packages. Each dependency's license applies to that dependency. When installing the project with npm, the corresponding package license files are available under `node_modules/<package>/`.

The project author license is separate:

- PrompterRanker source code: [MIT License](./LICENSE)
- Dependency metadata: [`package.json`](./package.json) and [`package-lock.json`](./package-lock.json)

For redistribution that copies dependency source files or ships a complete dependency bundle, retain the applicable copyright and license notices from those packages. Do not edit a dependency's declared license in `package-lock.json`; that metadata belongs to the dependency author.
