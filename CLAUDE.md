# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **MCP (Model Context Protocol) TypeScript Server** that provides TypeScript compilation, type checking, and project management capabilities to AI assistants. It's built as an npm package that can be installed globally or used locally.

## Common Development Commands

### Building and Development
```bash
# Build the project (compiles TypeScript to JavaScript)
npm run build

# Build and watch for changes
npm run build:watch

# Development mode (runs directly with ts-node)
npm run dev

# Start the compiled server
npm start

# Clean build artifacts
npm run clean
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Code Quality
```bash
# Lint TypeScript files
npm run lint

# Lint and auto-fix issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without making changes
npm run format:check
```

### Package Management
```bash
# Prepare for publishing (builds automatically)
npm run prepare

# Full pre-publish check (tests, lints, and builds)
npm run prepublishOnly
```

## Architecture

The codebase follows a modular handler-based architecture:

### Core Structure
- **`src/index.ts`**: Main MCP server entry point, defines all available tools and routes requests
- **`src/handlers/`**: Core functionality modules
  - `compiler.ts`: TypeScript compilation logic with watch mode and source map support
  - `typechecker.ts`: Type checking and diagnostic reporting
  - `config.ts`: TypeScript configuration management (tsconfig.json operations)
- **`src/types/`**: TypeScript type definitions and interfaces
- **`src/utils/`**: Utility functions for file operations and diagnostics formatting

### MCP Server Architecture
The server implements the Model Context Protocol and provides these tools:
- `compile_typescript`: Compiles single files or entire projects
- `check_types`: Performs type checking with configurable strictness
- `get_diagnostics`: Returns detailed error/warning information
- `update_tsconfig`: Modifies TypeScript configuration
- `create_tsconfig`: Creates new TypeScript configurations
- `validate_syntax`: Quick syntax validation

### Key Design Patterns
- **Handler Pattern**: Each major functionality is encapsulated in its own handler class
- **Options Interfaces**: Strongly typed configuration objects for all operations
- **Result Interfaces**: Consistent return types with success/error states and detailed information
- **Caching**: File-based caching for improved performance during development

## Testing Strategy

- **Jest** as the test runner with TypeScript support via `ts-jest`
- Tests located in `tests/` directory with `.test.ts` files
- Test fixtures in `tests/fixtures/` for sample TypeScript code
- Coverage reporting configured for all source files except type definitions

### Running Specific Tests
```bash
# Run a specific test file
npm test -- compiler.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="compilation"
```

## TypeScript Configuration

The project uses strict TypeScript settings:
- **Target**: ES2020
- **Module**: CommonJS with Node.js resolution
- **Strict mode enabled** with comprehensive type checking
- **Declaration files** generated for npm distribution
- **Source maps** enabled for debugging
- **Incremental compilation** for faster builds

## Development Workflow

1. **Make changes** to source files in `src/`
2. **Run tests** to ensure functionality: `npm test`
3. **Check types and linting**: `npm run lint`
4. **Build the project**: `npm run build`
5. **Test the built server**: `npm start`

## MCP Server Usage

After building, the server can be used with Claude Desktop by adding to the configuration:

```json
{
  "mcpServers": {
    "typescript": {
      "command": "npx",
      "args": ["@mcp/typescript"]
    }
  }
}
```

## File Watching and Hot Reload

The TypeScript compiler handler supports watch mode for continuous compilation during development. This is particularly useful when working on projects that need real-time TypeScript compilation feedback.

## Dependencies

- **@modelcontextprotocol/sdk**: Core MCP protocol implementation
- **typescript**: TypeScript compiler API for all compilation operations
- **chokidar**: File watching for development workflows

The project maintains compatibility with Node.js 16+ and uses modern TypeScript features throughout.