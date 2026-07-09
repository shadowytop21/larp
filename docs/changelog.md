# LARP Changelog

All notable changes to LARP will be documented in this file.

## [v0.2.0] - 2026-07-09

### Added
- **String Interpolation Fix:** `{` inside strings is now only treated as interpolation if it contains a valid identifier (e.g., `{name}`). This prevents JSON strings like `{"key": "value"}` from causing JavaScript template literal syntax errors.
- **`method` Keyword Support:** Added support for the `with method POST` syntax in route handlers (previously required `with POST`).
- **Complete Test Coverage:** Added definitive closure-in-loop tests and null-safety assertion tests.
- **Documentation Complete:** Added FAQ, Quickstarts for Python/JS developers, Video Scripts, and an Example Gallery.

### Fixed
- **Loop Scoping / Temporal Dead Zone Bug (CRITICAL):** 
  - Fixed a major scoping issue where `set` emitted `var`, causing variables in loops to be shared across all iterations and breaking closures.
  - The transpiler now tracks variable declarations per scope (functions, blueprints, loops).
  - First-time assignments use `let` (or `const` for `set fixed`), and subsequent re-assignments emit plain assignments (no keyword), completely avoiding both hoisting bugs and TDZ redeclaration errors.

## [v0.1.0] - Initial Release
- Basic transpiler architecture (AST -> JS).
- Syntax parsing for variables, conditionals, loops, and functions.
- CLI tool (`larp run`, `larp build`, `larp test`, `larp format`).
- Web playground support.
- Built-in AI (`ask ai`), Server (`create a server`), and HTTP (`get request to`) features.
- Initial standard library (`math`, `helpers`).
