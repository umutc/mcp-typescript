import * as ts from 'typescript';

export interface CompileOptions {
  filePath?: string;
  projectPath?: string;
  outputDir?: string;
  sourceMap?: boolean;
  watch?: boolean;
}

export interface TypeCheckOptions {
  filePath: string;
  strict?: boolean;
  includeDeclarations?: boolean;
}

export interface DiagnosticOptions {
  filePath: string;
  formatOutput?: 'json' | 'text' | 'formatted';
}

export interface TsConfigUpdateOptions {
  configPath: string;
  options: ts.CompilerOptions;
}

export interface CompilationResult {
  success: boolean;
  output?: string;
  files?: Array<{
    path: string;
    content: string;
  }>;
  errors?: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
    code: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  duration?: number;
}

export interface TypeCheckResult {
  success: boolean;
  diagnostics: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
    code: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  summary: {
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
}

export interface CacheEntry {
  filePath: string;
  lastModified: number;
  compiledOutput?: string;
  diagnostics?: ts.Diagnostic[];
}