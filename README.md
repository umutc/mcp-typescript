# 🚀 MCP TypeScript Server

[![npm version](https://badge.fury.io/js/@mcp%2Ftypescript.svg)](https://badge.fury.io/js/@mcp%2Ftypescript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)

A powerful **Model Context Protocol (MCP) server** that provides TypeScript compilation, type checking, and project management capabilities to AI assistants like Claude.

> 🎯 **Zero Configuration** • ⚡ **Lightning Fast** • 🛡️ **Production Ready** • 🧪 **Battle Tested**

## ✨ Features

### 🔧 **Core Compilation**
- **Single File Compilation**: Compile individual TypeScript files to JavaScript
- **Project Compilation**: Full project compilation with `tsconfig.json` support
- **Watch Mode**: Continuous compilation on file changes
- **Source Maps**: Generate source maps for debugging
- **Multiple Targets**: Support for ES5, ES6, ES2020, and more

### 🔍 **Advanced Type Checking**
- **Comprehensive Type Analysis**: Full TypeScript type checking
- **Diagnostic Reports**: Detailed error and warning information
- **Strict Mode Support**: Configurable strict type checking
- **Declaration Files**: Support for `.d.ts` files
- **Syntax Validation**: Quick syntax validation without full compilation

### ⚙️ **Configuration Management**
- **Dynamic Config Updates**: Modify `tsconfig.json` programmatically
- **Config Creation**: Generate new TypeScript configurations
- **Option Validation**: Validate compiler options before applying
- **Smart Defaults**: Sensible default configurations for new projects

### 🎨 **Beautiful Output**
- **Colored Diagnostics**: Beautiful, readable error formatting
- **Progress Indicators**: Real-time compilation progress
- **Summary Reports**: Comprehensive compilation summaries
- **JSON Export**: Machine-readable diagnostic output

## 🚀 Quick Start

### Installation

```bash
# Install globally via npm (recommended)
npm install -g @mcp/typescript

# Or install locally in your project
npm install @mcp/typescript
```

### Claude Desktop Configuration

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

### Alternative: Manual Installation

```bash
git clone https://github.com/mcpservers/mcp-typescript.git
cd mcp-typescript
npm install
npm run build
npm link
```

## 📚 Usage Examples

### 🔨 Compiling TypeScript Files

#### Single File Compilation
```typescript
// Compile a single TypeScript file
compile_typescript({
  filePath: "./src/utils.ts",
  outputDir: "./dist",
  sourceMap: true
})
```

#### Project Compilation
```typescript
// Compile entire project using tsconfig.json
compile_typescript({
  projectPath: "./my-project",
  outputDir: "./build"
})
```

#### Watch Mode
```typescript
// Enable continuous compilation
compile_typescript({
  filePath: "./src/app.ts",
  watch: true,
  sourceMap: true
})
```

### 🔍 Type Checking

#### Basic Type Checking
```typescript
// Check types for a single file
check_types({
  filePath: "./src/models.ts"
})
```

#### Strict Type Checking
```typescript
// Enable strict mode type checking
check_types({
  filePath: "./src/services/",
  strict: true,
  includeDeclarations: true
})
```

#### Get Detailed Diagnostics
```typescript
// Get formatted diagnostic output
get_diagnostics({
  filePath: "./src/components/Button.tsx",
  formatOutput: "formatted"  // or "json" or "text"
})
```

### ⚙️ Configuration Management

#### Update TypeScript Config
```typescript
// Update compiler options
update_tsconfig({
  configPath: "./tsconfig.json",
  options: {
    target: "ES2022",
    strict: true,
    sourceMap: true,
    declaration: true
  }
})
```

#### Create New Config
```typescript
// Create new tsconfig.json with defaults
create_tsconfig({
  projectPath: "./new-project",
  options: {
    target: "ES2020",
    module: "commonjs",
    outDir: "./dist"
  }
})
```

#### Syntax Validation
```typescript
// Quick syntax check without full compilation
validate_syntax({
  filePath: "./src/suspicious-file.ts"
})
```

## 🛠️ Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `compile_typescript` | Compile TypeScript files or projects | `filePath`, `projectPath`, `outputDir`, `sourceMap`, `watch` |
| `check_types` | Perform type checking | `filePath`, `strict`, `includeDeclarations` |
| `get_diagnostics` | Get detailed error information | `filePath`, `formatOutput` |
| `update_tsconfig` | Update TypeScript configuration | `configPath`, `options` |
| `create_tsconfig` | Create new TypeScript configuration | `projectPath`, `options` |
| `validate_syntax` | Quick syntax validation | `filePath` |

## 💡 Real-World Examples

### 🎯 **React Component Development**
Perfect for developing React components with full type safety:

```bash
# Check types for React components
check_types({ filePath: "./src/components/", strict: true })

# Compile with JSX support
compile_typescript({
  projectPath: "./react-app",
  outputDir: "./build"
})
```

### 🚀 **Node.js Backend Development**
Ideal for backend TypeScript projects:

```bash
# Watch mode for development
compile_typescript({
  filePath: "./src/server.ts",
  watch: true,
  outputDir: "./dist"
})

# Strict type checking for production
check_types({
  filePath: "./src/",
  strict: true,
  includeDeclarations: false
})
```

### 📦 **Library Development**
Perfect for TypeScript library development:

```bash
# Generate declaration files
update_tsconfig({
  configPath: "./tsconfig.json",
  options: {
    declaration: true,
    declarationMap: true,
    outDir: "./lib"
  }
})

# Compile library
compile_typescript({
  projectPath: "./",
  sourceMap: true
})
```

## 🔧 Configuration Options

### Compiler Options Support
All standard TypeScript compiler options are supported:

- **Target**: `ES3`, `ES5`, `ES6`, `ES2015`, `ES2016`, `ES2017`, `ES2018`, `ES2019`, `ES2020`, `ES2021`, `ES2022`, `ESNext`
- **Module**: `None`, `CommonJS`, `AMD`, `System`, `UMD`, `ES6`, `ES2015`, `ES2020`, `ES2022`, `ESNext`
- **Module Resolution**: `node`, `classic`
- **And many more...**

### Default Configuration
When creating new `tsconfig.json` files, sensible defaults are applied:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 🎨 Output Examples

### ✅ Successful Compilation
```
✅ Compilation successful! (245ms)

Files generated:
- /project/dist/utils.js
- /project/dist/utils.js.map
- /project/dist/models.js
- /project/dist/models.js.map
```

### ❌ Compilation Errors
```
❌ Compilation failed!

3 error(s):
1. src/utils.ts:15:23 - Type 'string' is not assignable to type 'number' (TS2322)
2. src/models.ts:8:12 - Property 'id' does not exist on type 'User' (TS2339)
3. src/app.ts:45:8 - Cannot find module './missing-file' (TS2307)
```

### 🔍 Type Checking Results
```
✅ Type checking passed!

Summary:
- Errors: 0
- Warnings: 2
- Info: 1

Diagnostics:
1. src/components/Button.tsx:12:5 - warning: Unused variable 'theme'
2. src/utils/helpers.ts:34:12 - warning: Parameter 'callback' implicitly has an 'any' type
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/mcpservers/mcp-typescript.git
cd mcp-typescript
npm install
npm run build
npm test
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📋 Requirements

- **Node.js**: 16.0.0 or higher
- **TypeScript**: 4.5.0 or higher (automatically included)
- **Operating System**: macOS, Linux, Windows

## 🚨 Common Issues & Solutions

### Issue: "Cannot find tsconfig.json"
**Solution**: Ensure you're running the command from the project root or specify the correct `projectPath`.

### Issue: "Module resolution failed"
**Solution**: Check your `tsconfig.json` `baseUrl` and `paths` configuration.

### Issue: "Out of memory"
**Solution**: Increase Node.js memory limit: `node --max-old-space-size=4096`

## 📚 Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/desktop)
- [Issue Tracker](https://github.com/mcpservers/mcp-typescript/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- [TypeScript Team](https://github.com/microsoft/TypeScript) for the incredible TypeScript compiler
- [Anthropic](https://anthropic.com) for the Model Context Protocol
- [Node.js](https://nodejs.org) community for the excellent ecosystem

---

<div align="center">

**[⭐ Star us on GitHub](https://github.com/mcpservers/mcp-typescript)** • **[🐛 Report Bug](https://github.com/mcpservers/mcp-typescript/issues)** • **[✨ Request Feature](https://github.com/mcpservers/mcp-typescript/issues)**

Made with ❤️ by the MCP community

</div>