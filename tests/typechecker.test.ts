import { TypeScriptTypeChecker } from '../src/handlers/typechecker';
import * as path from 'path';

describe('TypeScriptTypeChecker', () => {
  let typeChecker: TypeScriptTypeChecker;
  const fixturesDir = path.join(__dirname, 'fixtures');

  beforeEach(() => {
    typeChecker = new TypeScriptTypeChecker();
  });

  describe('checkTypes', () => {
    it('should pass type checking for valid TypeScript', async () => {
      const result = await typeChecker.checkTypes({
        filePath: path.join(fixturesDir, 'simple.ts')
      });

      expect(result.success).toBe(true);
      expect(result.summary.errorCount).toBe(0);
    });

    it('should detect type errors', async () => {
      const result = await typeChecker.checkTypes({
        filePath: path.join(fixturesDir, 'with-errors.ts')
      });

      expect(result.success).toBe(false);
      expect(result.summary.errorCount).toBeGreaterThan(0);
      expect(result.diagnostics.length).toBeGreaterThan(0);
      expect(result.diagnostics[0].severity).toBe('error');
    });
  });

  describe('validateSyntax', () => {
    it('should validate correct syntax', async () => {
      const result = await typeChecker.validateSyntax(
        path.join(fixturesDir, 'simple.ts')
      );

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('getDiagnostics', () => {
    it('should return formatted diagnostics', async () => {
      const diagnostics = await typeChecker.getDiagnostics({
        filePath: path.join(fixturesDir, 'with-errors.ts'),
        formatOutput: 'text'
      });

      expect(typeof diagnostics).toBe('string');
      expect(diagnostics.length).toBeGreaterThan(0);
    });
  });
});