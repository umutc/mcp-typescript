import * as ts from 'typescript';

export function formatDiagnostic(diagnostic: ts.Diagnostic): {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
} {
  const file = diagnostic.file?.fileName || 'unknown';
  let line = 0;
  let column = 0;

  if (diagnostic.file && diagnostic.start !== undefined) {
    const lineAndChar = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
    line = lineAndChar.line + 1;
    column = lineAndChar.character + 1;
  }

  let severity: 'error' | 'warning' | 'info' = 'error';
  switch (diagnostic.category) {
    case ts.DiagnosticCategory.Warning:
      severity = 'warning';
      break;
    case ts.DiagnosticCategory.Suggestion:
    case ts.DiagnosticCategory.Message:
      severity = 'info';
      break;
    default:
      severity = 'error';
  }

  return {
    file,
    line,
    column,
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    code: `TS${diagnostic.code}`,
    severity,
  };
}

export function formatDiagnostics(
  diagnostics: ts.Diagnostic[],
  format: 'json' | 'text' | 'formatted' = 'formatted'
): string {
  const formattedDiagnostics = diagnostics.map(formatDiagnostic);

  switch (format) {
    case 'json':
      return JSON.stringify(formattedDiagnostics, null, 2);

    case 'text':
      return formattedDiagnostics
        .map(d => `${d.file}:${d.line}:${d.column} - ${d.severity}: ${d.message} (${d.code})`)
        .join('\n');

    case 'formatted':
    default:
      return formattedDiagnostics
        .map(d => {
          const severityColor = getSeverityColor(d.severity);
          const severityIcon = getSeverityIcon(d.severity);
          return `${severityIcon} ${severityColor}${d.severity.toUpperCase()}${resetColor()} in ${d.file}:${d.line}:${d.column}
  ${d.message}
  Code: ${d.code}`;
        })
        .join('\n\n');
  }
}

function getSeverityColor(severity: 'error' | 'warning' | 'info'): string {
  switch (severity) {
    case 'error':
      return '\x1b[31m'; // Red
    case 'warning':
      return '\x1b[33m'; // Yellow
    case 'info':
      return '\x1b[36m'; // Cyan
  }
}

function getSeverityIcon(severity: 'error' | 'warning' | 'info'): string {
  switch (severity) {
    case 'error':
      return '✖';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ℹ';
  }
}

function resetColor(): string {
  return '\x1b[0m';
}

export function getDiagnosticSummary(diagnostics: ts.Diagnostic[]): {
  errorCount: number;
  warningCount: number;
  infoCount: number;
} {
  const summary = {
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
  };

  diagnostics.forEach(diagnostic => {
    switch (diagnostic.category) {
      case ts.DiagnosticCategory.Error:
        summary.errorCount++;
        break;
      case ts.DiagnosticCategory.Warning:
        summary.warningCount++;
        break;
      case ts.DiagnosticCategory.Suggestion:
      case ts.DiagnosticCategory.Message:
        summary.infoCount++;
        break;
    }
  });

  return summary;
}