import * as ts from 'typescript';
import * as path from 'path';
import * as chokidar from 'chokidar';
import { CompileOptions, CompilationResult } from '../types/index.js';
import { readFile, writeFile, findTsConfig, fileExists, getOutputPath } from '../utils/file.js';
import { formatDiagnostics } from '../utils/diagnostics.js';

export class TypeScriptCompiler {
  private watcherMap: Map<string, chokidar.FSWatcher> = new Map();

  async compileFile(options: CompileOptions): Promise<CompilationResult> {
    const startTime = Date.now();

    try {
      if (options.watch && options.filePath) {
        return this.setupWatchMode(options);
      }

      if (options.projectPath) {
        return this.compileProject(options);
      }

      if (options.filePath) {
        return this.compileSingleFile(options);
      }

      throw new Error('Either filePath or projectPath must be provided');
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            file: options.filePath || options.projectPath || 'unknown',
            line: 0,
            column: 0,
            message: error instanceof Error ? error.message : 'Unknown compilation error',
            code: 'COMPILE_ERROR',
            severity: 'error',
          },
        ],
        duration: Date.now() - startTime,
      };
    }
  }

  private async compileSingleFile(options: CompileOptions): Promise<CompilationResult> {
    const startTime = Date.now();
    const filePath = path.resolve(options.filePath!);

    if (!fileExists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const sourceCode = await readFile(filePath);
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      sourceMap: options.sourceMap || false,
      outDir: options.outputDir,
    };

    // Find and merge with tsconfig.json if available
    const tsConfigPath = findTsConfig(path.dirname(filePath));
    if (tsConfigPath) {
      const configFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
      if (!configFile.error) {
        const parsedConfig = ts.parseJsonConfigFileContent(
          configFile.config,
          ts.sys,
          path.dirname(tsConfigPath)
        );
        Object.assign(compilerOptions, parsedConfig.options);
      }
    }

    const result = ts.transpileModule(sourceCode, {
      compilerOptions,
      fileName: filePath,
    });

    const errors = result.diagnostics?.map(diagnostic => {
      const file = diagnostic.file?.fileName || filePath;
      let line = 0;
      let column = 0;

      if (diagnostic.file && diagnostic.start !== undefined) {
        const lineAndChar = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
        line = lineAndChar.line + 1;
        column = lineAndChar.character + 1;
      }

      return {
        file,
        line,
        column,
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        code: `TS${diagnostic.code}`,
        severity: diagnostic.category === ts.DiagnosticCategory.Error ? 'error' as const : 'warning' as const,
      };
    }) || [];

    const outputPath = getOutputPath(filePath, options.outputDir);
    const files = [
      {
        path: outputPath,
        content: result.outputText,
      },
    ];

    if (result.sourceMapText && options.sourceMap) {
      files.push({
        path: outputPath + '.map',
        content: result.sourceMapText,
      });
    }

    // Write output files
    for (const file of files) {
      await writeFile(file.path, file.content);
    }

    return {
      success: errors.filter(e => e.severity === 'error').length === 0,
      output: result.outputText,
      files,
      errors: errors.length > 0 ? errors : undefined,
      duration: Date.now() - startTime,
    };
  }

  private async compileProject(options: CompileOptions): Promise<CompilationResult> {
    const startTime = Date.now();
    const projectPath = path.resolve(options.projectPath!);
    const tsConfigPath = path.join(projectPath, 'tsconfig.json');

    if (!fileExists(tsConfigPath)) {
      throw new Error(`tsconfig.json not found in ${projectPath}`);
    }

    const configFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
    if (configFile.error) {
      throw new Error(`Error reading tsconfig.json: ${configFile.error.messageText}`);
    }

    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      projectPath
    );

    if (parsedConfig.errors.length > 0) {
      const errors = parsedConfig.errors.map(diagnostic => ({
        file: tsConfigPath,
        line: 0,
        column: 0,
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        code: `TS${diagnostic.code}`,
        severity: 'error' as const,
      }));

      return {
        success: false,
        errors,
        duration: Date.now() - startTime,
      };
    }

    // Override output directory if specified
    if (options.outputDir) {
      parsedConfig.options.outDir = path.resolve(options.outputDir);
    }

    // Override source map option if specified
    if (options.sourceMap !== undefined) {
      parsedConfig.options.sourceMap = options.sourceMap;
    }

    const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
    const emitResult = program.emit();

    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    const errors = allDiagnostics.map(diagnostic => {
      const file = diagnostic.file?.fileName || 'unknown';
      let line = 0;
      let column = 0;

      if (diagnostic.file && diagnostic.start !== undefined) {
        const lineAndChar = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
        line = lineAndChar.line + 1;
        column = lineAndChar.character + 1;
      }

      return {
        file,
        line,
        column,
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        code: `TS${diagnostic.code}`,
        severity: diagnostic.category === ts.DiagnosticCategory.Error ? 'error' as const : 'warning' as const,
      };
    });

    return {
      success: !emitResult.emitSkipped && errors.filter(e => e.severity === 'error').length === 0,
      errors: errors.length > 0 ? errors : undefined,
      duration: Date.now() - startTime,
    };
  }

  private setupWatchMode(options: CompileOptions): CompilationResult {
    const filePath = path.resolve(options.filePath!);
    const watchKey = filePath;

    if (this.watcherMap.has(watchKey)) {
      this.watcherMap.get(watchKey)?.close();
    }

    const watcher = chokidar.watch(filePath, {
      persistent: true,
      ignoreInitial: false,
    });

    watcher.on('change', async () => {
      console.error(`File changed: ${filePath}, recompiling...`);
      try {
        const result = await this.compileSingleFile({ ...options, watch: false });
        if (result.success) {
          console.error('✓ Compilation successful');
        } else {
          console.error('✖ Compilation failed:');
          if (result.errors) {
            result.errors.forEach(error => {
              console.error(`  ${error.file}:${error.line}:${error.column} - ${error.message}`);
            });
          }
        }
      } catch (error) {
        console.error('✖ Compilation error:', error);
      }
    });

    this.watcherMap.set(watchKey, watcher);

    return {
      success: true,
      output: `Watch mode started for ${filePath}. Press Ctrl+C to stop.`,
    };
  }

  stopWatching(filePath?: string): void {
    if (filePath) {
      const watchKey = path.resolve(filePath);
      const watcher = this.watcherMap.get(watchKey);
      if (watcher) {
        watcher.close();
        this.watcherMap.delete(watchKey);
      }
    } else {
      this.watcherMap.forEach(watcher => watcher.close());
      this.watcherMap.clear();
    }
  }
}