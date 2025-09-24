import * as fs from 'fs';
import * as path from 'path';

export function readFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

export function writeFile(filePath: string, content: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filePath);
    fs.mkdir(dir, { recursive: true }, (mkdirError) => {
      if (mkdirError) {
        reject(mkdirError);
        return;
      }

      fs.writeFile(filePath, content, 'utf8', (writeError) => {
        if (writeError) {
          reject(writeError);
        } else {
          resolve();
        }
      });
    });
  });
}

export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

export function getFileStats(filePath: string): fs.Stats | null {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}

export function findTsConfig(startDir: string): string | null {
  let currentDir = startDir;

  while (currentDir !== path.dirname(currentDir)) {
    const tsConfigPath = path.join(currentDir, 'tsconfig.json');
    if (fileExists(tsConfigPath)) {
      return tsConfigPath;
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

export function resolveFilePath(filePath: string): string {
  return path.resolve(filePath);
}

export function isTypeScriptFile(filePath: string): boolean {
  return /\.(ts|tsx)$/.test(filePath);
}

export function getOutputPath(inputPath: string, outputDir?: string): string {
  if (outputDir) {
    const fileName = path.basename(inputPath, path.extname(inputPath)) + '.js';
    return path.join(outputDir, fileName);
  }

  return inputPath.replace(/\.(ts|tsx)$/, '.js');
}