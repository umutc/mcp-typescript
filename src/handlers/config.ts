import * as ts from 'typescript';
import * as path from 'path';
import { TsConfigUpdateOptions } from '../types/index.js';
import { fileExists, readFile, writeFile } from '../utils/file.js';

export class TypeScriptConfigManager {
  async updateTsConfig(options: TsConfigUpdateOptions): Promise<{
    success: boolean;
    message: string;
    updatedConfig?: any;
  }> {
    const configPath = path.resolve(options.configPath);

    if (!fileExists(configPath)) {
      throw new Error(`tsconfig.json not found at: ${configPath}`);
    }

    try {
      // Read current config
      const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
      if (configFile.error) {
        throw new Error(`Error reading tsconfig.json: ${ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n')}`);
      }

      // Merge with new options
      const updatedConfig = {
        ...configFile.config,
        compilerOptions: {
          ...configFile.config.compilerOptions,
          ...options.options,
        },
      };

      // Validate the updated configuration
      const validationResult = this.validateConfig(updatedConfig);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: `Configuration validation failed: ${validationResult.errors.join(', ')}`,
        };
      }

      // Write updated config
      await writeFile(configPath, JSON.stringify(updatedConfig, null, 2));

      return {
        success: true,
        message: 'TypeScript configuration updated successfully',
        updatedConfig,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async createTsConfig(
    projectPath: string,
    options: Partial<ts.CompilerOptions> = {}
  ): Promise<{
    success: boolean;
    message: string;
    configPath?: string;
  }> {
    const configPath = path.join(path.resolve(projectPath), 'tsconfig.json');

    if (fileExists(configPath)) {
      return {
        success: false,
        message: 'tsconfig.json already exists at this location',
      };
    }

    const defaultConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        moduleResolution: 'node',
        lib: ['ES2020'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        ...options,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    };

    try {
      await writeFile(configPath, JSON.stringify(defaultConfig, null, 2));

      return {
        success: true,
        message: 'TypeScript configuration created successfully',
        configPath,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create tsconfig.json',
      };
    }
  }

  async getTsConfig(configPath: string): Promise<{
    success: boolean;
    config?: any;
    parsedConfig?: ts.ParsedCommandLine;
    message?: string;
  }> {
    const resolvedPath = path.resolve(configPath);

    if (!fileExists(resolvedPath)) {
      return {
        success: false,
        message: `tsconfig.json not found at: ${resolvedPath}`,
      };
    }

    try {
      const configFile = ts.readConfigFile(resolvedPath, ts.sys.readFile);
      if (configFile.error) {
        return {
          success: false,
          message: `Error reading tsconfig.json: ${ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n')}`,
        };
      }

      const parsedConfig = ts.parseJsonConfigFileContent(
        configFile.config,
        ts.sys,
        path.dirname(resolvedPath)
      );

      return {
        success: true,
        config: configFile.config,
        parsedConfig,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private validateConfig(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if config has required structure
    if (typeof config !== 'object' || config === null) {
      errors.push('Configuration must be an object');
      return { isValid: false, errors };
    }

    // Validate compilerOptions if present
    if (config.compilerOptions) {
      if (typeof config.compilerOptions !== 'object') {
        errors.push('compilerOptions must be an object');
      } else {
        // Validate specific compiler options
        const compilerOptions = config.compilerOptions;

        // Check target
        if (compilerOptions.target) {
          const validTargets = ['ES3', 'ES5', 'ES6', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', 'ES2021', 'ES2022', 'ESNext'];
          if (!validTargets.includes(compilerOptions.target)) {
            errors.push(`Invalid target: ${compilerOptions.target}. Valid targets are: ${validTargets.join(', ')}`);
          }
        }

        // Check module
        if (compilerOptions.module) {
          const validModules = ['None', 'CommonJS', 'AMD', 'System', 'UMD', 'ES6', 'ES2015', 'ES2020', 'ES2022', 'ESNext'];
          if (!validModules.includes(compilerOptions.module)) {
            errors.push(`Invalid module: ${compilerOptions.module}. Valid modules are: ${validModules.join(', ')}`);
          }
        }

        // Check moduleResolution
        if (compilerOptions.moduleResolution) {
          const validResolutions = ['node', 'classic'];
          if (!validResolutions.includes(compilerOptions.moduleResolution)) {
            errors.push(`Invalid moduleResolution: ${compilerOptions.moduleResolution}. Valid options are: ${validResolutions.join(', ')}`);
          }
        }

        // Validate boolean options
        const booleanOptions = ['strict', 'esModuleInterop', 'skipLibCheck', 'forceConsistentCasingInFileNames', 'declaration', 'sourceMap'];
        booleanOptions.forEach(option => {
          if (compilerOptions[option] !== undefined && typeof compilerOptions[option] !== 'boolean') {
            errors.push(`${option} must be a boolean value`);
          }
        });

        // Validate string options
        const stringOptions = ['outDir', 'rootDir', 'baseUrl'];
        stringOptions.forEach(option => {
          if (compilerOptions[option] !== undefined && typeof compilerOptions[option] !== 'string') {
            errors.push(`${option} must be a string value`);
          }
        });
      }
    }

    // Validate include array
    if (config.include && !Array.isArray(config.include)) {
      errors.push('include must be an array of strings');
    } else if (config.include) {
      const invalidIncludes = config.include.filter((item: any) => typeof item !== 'string');
      if (invalidIncludes.length > 0) {
        errors.push('All include entries must be strings');
      }
    }

    // Validate exclude array
    if (config.exclude && !Array.isArray(config.exclude)) {
      errors.push('exclude must be an array of strings');
    } else if (config.exclude) {
      const invalidExcludes = config.exclude.filter((item: any) => typeof item !== 'string');
      if (invalidExcludes.length > 0) {
        errors.push('All exclude entries must be strings');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async listCompilerOptions(): Promise<{ [key: string]: any }> {
    return {
      target: {
        description: 'Specify ECMAScript target version',
        type: 'string',
        enum: ['ES3', 'ES5', 'ES6', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', 'ES2021', 'ES2022', 'ESNext'],
        default: 'ES2020',
      },
      module: {
        description: 'Specify module code generation',
        type: 'string',
        enum: ['None', 'CommonJS', 'AMD', 'System', 'UMD', 'ES6', 'ES2015', 'ES2020', 'ES2022', 'ESNext'],
        default: 'CommonJS',
      },
      lib: {
        description: 'List of library files to be included in the compilation',
        type: 'array',
        items: { type: 'string' },
      },
      outDir: {
        description: 'Redirect output structure to the directory',
        type: 'string',
      },
      rootDir: {
        description: 'Specify the root directory of input files',
        type: 'string',
      },
      strict: {
        description: 'Enable all strict type checking options',
        type: 'boolean',
        default: false,
      },
      esModuleInterop: {
        description: 'Enables emit interoperability between CommonJS and ES Modules',
        type: 'boolean',
        default: false,
      },
      skipLibCheck: {
        description: 'Skip type checking of declaration files',
        type: 'boolean',
        default: false,
      },
      forceConsistentCasingInFileNames: {
        description: 'Ensure consistent casing in file names',
        type: 'boolean',
        default: false,
      },
      declaration: {
        description: 'Generate corresponding .d.ts file',
        type: 'boolean',
        default: false,
      },
      sourceMap: {
        description: 'Generate corresponding .map file',
        type: 'boolean',
        default: false,
      },
      incremental: {
        description: 'Enable incremental compilation',
        type: 'boolean',
        default: false,
      },
    };
  }
}