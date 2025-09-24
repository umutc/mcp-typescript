# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

### Added
- Initial release of MCP TypeScript Server
- TypeScript compilation with single file and project support
- Watch mode for continuous compilation
- Comprehensive type checking
- Detailed diagnostic reporting with colored output
- TypeScript configuration management (create/update tsconfig.json)
- Syntax validation
- Source map generation
- Support for all TypeScript compiler options
- Beautiful error formatting with icons and colors
- MCP protocol integration for AI assistants like Claude

### Features
- `compile_typescript` - Compile TypeScript files to JavaScript
- `check_types` - Perform type checking on files or projects
- `get_diagnostics` - Get detailed error and warning information
- `update_tsconfig` - Update TypeScript configuration files
- `create_tsconfig` - Create new TypeScript configurations
- `validate_syntax` - Quick syntax validation

### Technical
- Built with TypeScript 5.3+
- Node.js 16+ support
- Zero configuration setup
- Production-ready error handling
- Graceful shutdown handling