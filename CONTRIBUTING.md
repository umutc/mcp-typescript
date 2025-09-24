# Contributing to MCP TypeScript Server

Thank you for your interest in contributing to the MCP TypeScript Server! We welcome contributions from the community and are pleased to have you join us.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mcp-typescript.git
   cd mcp-typescript
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Setup

### Prerequisites
- Node.js 16.0.0 or higher
- npm 7.0.0 or higher
- TypeScript knowledge

### Local Development
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Testing Your Changes
```bash
# Build and link locally
npm run build
npm link

# Test with Claude Desktop by updating your config
# Then test the MCP server functionality
```

## 📝 Contribution Guidelines

### Code Style
- We use **ESLint** and **Prettier** for code formatting
- Run `npm run lint:fix` before committing
- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Commit Messages
We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
type(scope): description

feat(compiler): add incremental compilation support
fix(diagnostics): resolve formatting issue with colors
docs(readme): update installation instructions
test(typechecker): add tests for strict mode
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test changes
- `refactor`: Code refactoring
- `chore`: Maintenance tasks
- `style`: Code style changes

### Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following our guidelines
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Run tests** and ensure they pass
6. **Submit a pull request** with:
   - Clear title and description
   - Reference any related issues
   - Screenshots/examples if applicable

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Tests pass locally
- [ ] Added/updated tests for changes
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or marked as such)
```

## 🐛 Bug Reports

When filing a bug report, please include:

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g., macOS 12.0]
- Node.js version: [e.g., 18.0.0]
- TypeScript version: [e.g., 5.3.0]
- MCP TypeScript version: [e.g., 1.0.0]

## Additional Context
Any additional information, logs, screenshots, etc.
```

## ✨ Feature Requests

We welcome feature requests! Please include:

### Feature Request Template
```markdown
## Feature Description
Clear description of the proposed feature

## Use Case
Why is this feature needed? What problem does it solve?

## Proposed Solution
How should this feature work?

## Alternative Solutions
Other solutions you've considered

## Additional Context
Any additional information or examples
```

## 🧪 Testing

### Test Structure
```
tests/
├── unit/           # Unit tests for individual components
├── integration/    # Integration tests for complete flows
├── fixtures/       # Test data and sample TypeScript files
└── helpers/        # Test utilities and helpers
```

### Writing Tests
- Use **Jest** for testing
- Aim for **>80% code coverage**
- Test both success and error cases
- Use descriptive test names
- Group related tests with `describe` blocks

### Example Test
```typescript
describe('TypeScriptCompiler', () => {
  describe('compileFile', () => {
    it('should compile a simple TypeScript file', async () => {
      const compiler = new TypeScriptCompiler();
      const result = await compiler.compileFile({
        filePath: './fixtures/simple.ts'
      });

      expect(result.success).toBe(true);
      expect(result.output).toContain('function hello()');
    });

    it('should handle compilation errors gracefully', async () => {
      const compiler = new TypeScriptCompiler();
      const result = await compiler.compileFile({
        filePath: './fixtures/error.ts'
      });

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('TS2322');
    });
  });
});
```

## 📚 Documentation

### Documentation Guidelines
- Update the README for user-facing changes
- Add JSDoc comments to public APIs
- Include code examples in documentation
- Keep documentation up-to-date with code changes

### JSDoc Example
```typescript
/**
 * Compiles a TypeScript file to JavaScript
 * @param options - Compilation options
 * @param options.filePath - Path to the TypeScript file
 * @param options.outputDir - Output directory for compiled files
 * @param options.sourceMap - Whether to generate source maps
 * @returns Promise resolving to compilation result
 * @throws {Error} When file is not found or compilation fails
 * @example
 * ```typescript
 * const result = await compiler.compileFile({
 *   filePath: './src/app.ts',
 *   outputDir: './dist',
 *   sourceMap: true
 * });
 * ```
 */
```

## 🎯 Areas Where We Need Help

### High Priority
- **Performance optimization** - Incremental compilation improvements
- **Error handling** - Better error messages and recovery
- **Test coverage** - More comprehensive test suites
- **Documentation** - Examples and tutorials

### Medium Priority
- **IDE integration** - LSP support
- **Caching improvements** - Smart dependency caching
- **Configuration validation** - Better tsconfig validation
- **Platform support** - Windows-specific improvements

### Good First Issues
- **Documentation improvements**
- **Error message enhancements**
- **Additional test cases**
- **Code style improvements**

Look for issues labeled `good first issue`, `help wanted`, or `documentation`.

## 🏆 Recognition

Contributors are recognized in:
- **GitHub contributors** graph
- **CHANGELOG.md** for significant contributions
- **README.md** acknowledgments section
- **Release notes** for major features

## 📞 Getting Help

- **GitHub Discussions** - General questions and ideas
- **GitHub Issues** - Bug reports and feature requests
- **Discord** - Real-time chat (coming soon)

## 📋 Development Workflow

### Branch Strategy
- `main` - Stable, production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development
- `bugfix/*` - Bug fixes
- `release/*` - Release preparation

### Release Process
1. Features merged to `develop`
2. `develop` tested and stabilized
3. Release branch created from `develop`
4. Final testing and bug fixes
5. Merge to `main` and tag release
6. Publish to npm

## 🔐 Security

Please report security vulnerabilities privately to the maintainers. See [SECURITY.md](SECURITY.md) for details.

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MCP TypeScript Server! 🎉