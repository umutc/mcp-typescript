#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { TypeScriptCompiler } from './handlers/compiler.js';
import { TypeScriptTypeChecker } from './handlers/typechecker.js';
import { TypeScriptConfigManager } from './handlers/config.js';
import type { CompileOptions, TypeCheckOptions, DiagnosticOptions, TsConfigUpdateOptions } from './types/index.js';

const compiler = new TypeScriptCompiler();
const typeChecker = new TypeScriptTypeChecker();
const configManager = new TypeScriptConfigManager();

const server = new Server(
  {
    name: '@mcp/typescript',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'compile_typescript',
        description: 'Compile TypeScript file(s) to JavaScript with full project support, watch mode, and source maps',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to TypeScript file to compile',
            },
            projectPath: {
              type: 'string',
              description: 'Path to TypeScript project directory with tsconfig.json',
            },
            outputDir: {
              type: 'string',
              description: 'Output directory for compiled JavaScript files',
            },
            sourceMap: {
              type: 'boolean',
              description: 'Generate source maps for debugging',
              default: false,
            },
            watch: {
              type: 'boolean',
              description: 'Enable watch mode for continuous compilation on file changes',
              default: false,
            },
          },
        },
      },
      {
        name: 'check_types',
        description: 'Perform comprehensive type checking on TypeScript files or projects',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to TypeScript file or project directory to type check',
            },
            strict: {
              type: 'boolean',
              description: 'Use strict type checking mode',
              default: false,
            },
            includeDeclarations: {
              type: 'boolean',
              description: 'Include .d.ts declaration files in type checking',
              default: true,
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'get_diagnostics',
        description: 'Get detailed type errors, warnings, and diagnostic information',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to TypeScript file to analyze',
            },
            formatOutput: {
              type: 'string',
              enum: ['json', 'text', 'formatted'],
              description: 'Output format for diagnostics (formatted includes colors and icons)',
              default: 'formatted',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'update_tsconfig',
        description: 'Update TypeScript configuration (tsconfig.json) with new compiler options',
        inputSchema: {
          type: 'object',
          properties: {
            configPath: {
              type: 'string',
              description: 'Path to tsconfig.json file to update',
            },
            options: {
              type: 'object',
              description: 'TypeScript compiler options to update or add',
              additionalProperties: true,
            },
          },
          required: ['configPath', 'options'],
        },
      },
      {
        name: 'create_tsconfig',
        description: 'Create a new TypeScript configuration file with sensible defaults',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to project directory where tsconfig.json will be created',
            },
            options: {
              type: 'object',
              description: 'Custom compiler options to override defaults',
              additionalProperties: true,
            },
          },
          required: ['projectPath'],
        },
      },
      {
        name: 'validate_syntax',
        description: 'Validate TypeScript syntax without full type checking',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to TypeScript file to validate',
            },
          },
          required: ['filePath'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'compile_typescript': {
        const options = args as unknown as CompileOptions;
        const result = await compiler.compileFile(options);

        let responseText = '';
        if (result.success) {
          responseText = `✅ Compilation successful!`;
          if (result.duration) {
            responseText += ` (${result.duration}ms)`;
          }
          if (result.files) {
            responseText += `\n\nFiles generated:`;
            result.files.forEach(file => {
              responseText += `\n- ${file.path}`;
            });
          }
        } else {
          responseText = `❌ Compilation failed!`;
          if (result.errors && result.errors.length > 0) {
            responseText += `\n\n${result.errors.length} error(s):`;
            result.errors.forEach((error, index) => {
              responseText += `\n${index + 1}. ${error.file}:${error.line}:${error.column} - ${error.message} (${error.code})`;
            });
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        };
      }

      case 'check_types': {
        const options = args as unknown as TypeCheckOptions;
        const result = await typeChecker.checkTypes(options);

        let responseText = '';
        if (result.success) {
          responseText = `✅ Type checking passed!`;
        } else {
          responseText = `❌ Type checking failed!`;
        }

        responseText += `\n\nSummary:`;
        responseText += `\n- Errors: ${result.summary.errorCount}`;
        responseText += `\n- Warnings: ${result.summary.warningCount}`;
        responseText += `\n- Info: ${result.summary.infoCount}`;

        if (result.diagnostics.length > 0) {
          responseText += `\n\nDiagnostics:`;
          result.diagnostics.slice(0, 10).forEach((diagnostic, index) => {
            responseText += `\n${index + 1}. ${diagnostic.file}:${diagnostic.line}:${diagnostic.column} - ${diagnostic.severity}: ${diagnostic.message}`;
          });

          if (result.diagnostics.length > 10) {
            responseText += `\n... and ${result.diagnostics.length - 10} more`;
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        };
      }

      case 'get_diagnostics': {
        const options = args as unknown as DiagnosticOptions;
        const diagnostics = await typeChecker.getDiagnostics(options);

        return {
          content: [
            {
              type: 'text',
              text: diagnostics,
            },
          ],
        };
      }

      case 'update_tsconfig': {
        const options = args as unknown as TsConfigUpdateOptions;
        const result = await configManager.updateTsConfig(options);

        return {
          content: [
            {
              type: 'text',
              text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
            },
          ],
        };
      }

      case 'create_tsconfig': {
        const { projectPath, options } = args as unknown as { projectPath: string; options?: any };
        const result = await configManager.createTsConfig(projectPath, options);

        return {
          content: [
            {
              type: 'text',
              text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
            },
          ],
        };
      }

      case 'validate_syntax': {
        const { filePath } = args as unknown as { filePath: string };
        const result = await typeChecker.validateSyntax(filePath);

        let responseText = '';
        if (result.isValid) {
          responseText = `✅ Syntax is valid!`;
        } else {
          responseText = `❌ Syntax errors found:`;
          result.errors.forEach((error, index) => {
            responseText += `\n${index + 1}. Line ${error.line}, Column ${error.column}: ${error.message}`;
          });
        }

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.error('Shutting down MCP TypeScript server...');
  compiler.stopWatching();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Shutting down MCP TypeScript server...');
  compiler.stopWatching();
  process.exit(0);
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 MCP TypeScript server running on stdio');
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}