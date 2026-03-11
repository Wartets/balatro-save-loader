# Balatro Save Loader (fork)

This repository contains a browser-based save file viewer and editor for Balatro. It provides a clean web UI to load, inspect, edit and re-export the game's save, profile and settings files (.jkr). A live deployment of the site is available at:

https://wartets.github.io/balatro-save-loader/static/

This repository is a fork. The original project was created by https://github.com/WilsontheWolf.

License: See the project license file at https://github.com/Wartets/balatro-save-loader/blob/master/LICENSE

## Overview

The application runs entirely in the browser and focuses on safe, reversible editing of Balatro save data. It:

- Loads `.jkr` save files (save, profile, settings, meta) using client-side JavaScript.
- Parses the compressed save format into JSON for inspection and manipulation.
- Provides specialized UI tabs for save data, cards, profile and settings where applicable.
- Offers a raw editor fallback for modded / non-standard files and a way to re-compress raw content back into a `.jkr` file.
- Preserves array/object distinctions where possible and applies heuristics to correct empty-object/empty-array ambiguities.

## When to use

- To inspect the contents of a Balatro save file (cards, deck, hand, discard, jokers, consumables).
- To make deterministic edits to JSON-backed save portions and download a valid `.jkr` to load back into the game.
- To recover or inspect modded save files that include additional Lua code via the raw editor.

## How to use (site)

1. Open the site in your browser (hosted link above or run locally).
2. Use the "Choose save file" control to select a `.jkr` file from your computer (typical names: `save.jkr`, `profile.jkr`, `settings.jkr`, `meta.jkr`).
3. After loading, the UI displays file metadata: name, type, size, and quick counts (jokers, consumables, hand, deck, discard, total cards).
4. The editor displays context-sensitive tabs depending on the file type:
   - `save` files expose save-specific tabs and the cards UI.
   - `profile` and `settings` files expose profile/settings specific panels.
   - Fallback "unknown" UI is provided for files that do not match known heuristics.
5. Make edits via the provided UI controls. Many edits are applied directly to the in-memory JSON representation.
6. Click the Download / Save button to re-serialize and download a `.jkr` file containing your changes.

### Raw editor fallback

If the loader cannot parse a file (for example: heavily modded saves, extra Lua code), the application will attempt to decompress and present a raw text editor. In this mode you can:

- Inspect the decompressed raw text.
- Load the full content into the editor progressively (non-blocking chunked load for large files).
- Edit the raw and either:
  - Click "Try Parse Edited Raw" to attempt to convert it into the structured editor (when the raw represents Lua table(s)/return value), or
  - Click "Save Raw (.jkr)" to compress and download a `.jkr` from the raw text.

The UI also warns when a modded heuristic detects likely Lua code or multiple `return` statements.

## Implementation notes

- The client-side entry point is `static/index.html` and `static/js/main.js`.
- Key modules include:
  - `balatro-save-loader.js` — core parsing, compress/decompress, and conversion helpers.
  - `saveLogic.js` — heuristics for guess file type and helpers for array/object adjustments.
  - UI modules under `static/js/` provide tabbed editors (`saveUI.js`, `profileUI.js`, `cardsUI.js`, `unknownUI.js`, etc.).
- Known-array handling: some fields in saves may be empty objects when the game expects arrays; the loader normalizes specific paths (e.g. `cardAreas.*.cards`) to empty arrays to avoid editor errors.

## Development and local testing

Prerequisites: a POSIX shell is used by the included helper scripts. On Windows you can use WSL, Git Bash, or other bash-compatible environment.

To run a local instance (simple static hosting):

- Using the provided script (requires bash):

```bash
bash launch.sh
```

Alternatively, host the `static/` directory using any static file server (for example using `npx serve`, `python -m http.server`, or similar).

Developer notes:
- JavaScript modules are loaded as ES modules in the browser (`type="module"`).
- Large or compressed saves are processed entirely in the browser; no server-side processing is required.

## Project structure (selected)

- `static/` – front-end application and assets
  - `index.html` – single page HTML
  - `css/` – styles
  - `js/` – application JS modules (editor, UI tabs, logic)
- `src/` – build tooling source (original bundling input)
- `scripts/` – helper scripts and tests
- `test-files/` – example `.jkr` files for testing

## Contributing

This repository is a fork. If you intend to contribute:

- First decide whether to open changes against this fork or upstream (original author). If you are upstreaming changes, check the original project's contribution guidelines.
- Open an issue describing the change or submit a pull request with a clear description and rationale.
- Keep edits to UI and parsing conservative: accidental data corruption is easy if the save structure is misunderstood. Prefer adding reversible UI features and clear warnings when the loader cannot guarantee correctness.

## Credits and attribution

- Original author: https://github.com/WilsontheWolf
- Current fork and hosted live demo: https://wartets.github.io/balatro-save-loader/static/

## License

This project is covered by the repository license. See the LICENSE file here:

https://github.com/Wartets/balatro-save-loader/blob/master/LICENSE

If you intend to redistribute modified builds, please respect the license terms specified in that file.

## Support / Contact

If you find bugs or need help using the editor, please open an issue in this repository describing the file you attempted to load and any relevant observations (whether the file is modded, file size, and game version if known).