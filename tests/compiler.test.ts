import { TypeScriptCompiler } from '../src/handlers/compiler';
import * as path from 'path';
import * as fs from 'fs';

describe('TypeScriptCompiler', () => {
  let compiler: TypeScriptCompiler;
  const fixturesDir = path.join(__dirname, 'fixtures');

  beforeEach(() => {
    compiler = new TypeScriptCompiler();
  });

  afterEach(() => {
    // Clean up any generated files
    compiler.stopWatching();
  });

  describe('compileFile', () => {
    it('should compile a simple TypeScript file', async () => {
      const result = await compiler.compileFile({
        filePath: path.join(fixturesDir, 'simple.ts')
      });

      expect(result.success).toBe(true);
      expect(result.output).toContain('function hello(name)');
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should handle compilation errors', async () => {
      const result = await compiler.compileFile({
        filePath: path.join(fixturesDir, 'with-errors.ts')
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0].code).toMatch(/TS\d+/);
    });

    it('should handle non-existent files', async () => {
      const result = await compiler.compileFile({
        filePath: path.join(fixturesDir, 'non-existent.ts')
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toContain('File not found');
    });

    it('should generate source maps when requested', async () => {
      const outputDir = path.join(__dirname, 'temp-output');

      const result = await compiler.compileFile({
        filePath: path.join(fixturesDir, 'simple.ts'),
        outputDir,
        sourceMap: true
      });

      expect(result.success).toBe(true);
      expect(result.files).toBeDefined();
      expect(result.files!.some(f => f.path.endsWith('.map'))).toBe(true);

      // Clean up
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true });
      }
    });
  });
});