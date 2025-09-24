import * as ts from 'typescript';
import * as path from 'path';
import { TypeCheckOptions, TypeCheckResult, DiagnosticOptions } from '../types/index.js';
import { fileExists, findTsConfig, readFile } from '../utils/file.js';
import { formatDiagnostics, formatDiagnostic, getDiagnosticSummary } from '../utils/diagnostics.js';

export class TypeScriptTypeChecker {
  async checkTypes(options: TypeCheckOptions): Promise<TypeCheckResult> {
    const filePath = path.resolve(options.filePath);

    if (!fileExists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const isFile = !filePath.endsWith('/') && fileExists(filePath);

    if (isFile) {
      return this.checkSingleFile(options);
    } else {
      return this.checkProject(options);
    }
  }

  private async checkSingleFile(options: TypeCheckOptions): Promise<TypeCheckResult> {
    const filePath = path.resolve(options.filePath);

    // Find tsconfig.json
    let compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      strict: options.strict || false,
      skipLibCheck: !options.includeDeclarations,
    };

    const tsConfigPath = findTsConfig(path.dirname(filePath));
    if (tsConfigPath) {
      const configFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
      if (!configFile.error) {
        const parsedConfig = ts.parseJsonConfigFileContent(
          configFile.config,
          ts.sys,
          path.dirname(tsConfigPath)
        );
        compilerOptions = { ...parsedConfig.options, ...compilerOptions };
      }
    }

    // Create program
    const program = ts.createProgram([filePath], compilerOptions);
    const diagnostics = ts.getPreEmitDiagnostics(program);

    const formattedDiagnostics = [...diagnostics].map(formatDiagnostic);
    const summary = getDiagnosticSummary([...diagnostics]);

    return {
      success: summary.errorCount === 0,
      diagnostics: formattedDiagnostics,
      summary,
    };
  }

  private async checkProject(options: TypeCheckOptions): Promise<TypeCheckResult> {
    const projectPath = path.resolve(options.filePath);
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
      const formattedDiagnostics = parsedConfig.errors.map(formatDiagnostic);
      const summary = getDiagnosticSummary(parsedConfig.errors);

      return {
        success: false,
        diagnostics: formattedDiagnostics,
        summary,
      };
    }

    // Override strict mode if specified
    if (options.strict !== undefined) {
      parsedConfig.options.strict = options.strict;
    }

    // Override skipLibCheck based on includeDeclarations
    if (options.includeDeclarations !== undefined) {
      parsedConfig.options.skipLibCheck = !options.includeDeclarations;
    }

    const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
    const diagnostics = ts.getPreEmitDiagnostics(program);

    const formattedDiagnostics = [...diagnostics].map(formatDiagnostic);
    const summary = getDiagnosticSummary([...diagnostics]);

    return {
      success: summary.errorCount === 0,
      diagnostics: formattedDiagnostics,
      summary,
    };
  }

  async getDiagnostics(options: DiagnosticOptions): Promise<string> {
    const filePath = path.resolve(options.filePath);

    if (!fileExists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Find tsconfig.json
    let compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
    };

    const tsConfigPath = findTsConfig(path.dirname(filePath));
    if (tsConfigPath) {
      const configFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
      if (!configFile.error) {
        const parsedConfig = ts.parseJsonConfigFileContent(
          configFile.config,
          ts.sys,
          path.dirname(tsConfigPath)
        );
        compilerOptions = { ...parsedConfig.options, ...compilerOptions };
      }
    }

    // Create program and get diagnostics
    const program = ts.createProgram([filePath], compilerOptions);
    const diagnostics = ts.getPreEmitDiagnostics(program);

    return formatDiagnostics([...diagnostics], options.formatOutput);
  }

  async validateSyntax(filePath: string): Promise<{
    isValid: boolean;
    errors: Array<{
      line: number;
      column: number;
      message: string;
    }>;
  }> {
    const resolvedPath = path.resolve(filePath);

    if (!fileExists(resolvedPath)) {
      throw new Error(`File not found: ${resolvedPath}`);
    }

    const sourceCode = await readFile(resolvedPath);

    // Parse the source file to check syntax
    const sourceFile = ts.createSourceFile(
      resolvedPath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const errors: Array<{ line: number; column: number; message: string }> = [];

    function visit(node: ts.Node): void {
      if (node.kind === ts.SyntaxKind.Unknown) {
        const { line, character } = ts.getLineAndCharacterOfPosition(sourceFile, node.pos);
        errors.push({
          line: line + 1,
          column: character + 1,
          message: 'Syntax error: Unknown token',
        });
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    // Also check for parser diagnostics
    const program = ts.createProgram([resolvedPath], {});
    const syntacticDiagnostics = program.getSyntacticDiagnostics(sourceFile);

    syntacticDiagnostics.forEach(diagnostic => {
      if (diagnostic.file && diagnostic.start !== undefined) {
        const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
        errors.push({
          line: line + 1,
          column: character + 1,
          message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}