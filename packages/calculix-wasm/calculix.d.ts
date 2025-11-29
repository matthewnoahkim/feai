/**
 * TypeScript type definitions for CalculiX WASM module
 */

export interface CalculiXModule extends EmscriptenModule {
  FS: typeof FS;
  callMain(args: string[]): number;
  cwrap<T extends (...args: any[]) => any>(
    ident: string,
    returnType: string | null,
    argTypes: string[]
  ): T;
}

export interface EmscriptenModule {
  print(text: string): void;
  printErr(text: string): void;
  onExit?(status: number): void;
  preRun?: Array<() => void>;
  postRun?: Array<() => void>;
}

export interface EmscriptenFS {
  mkdir(path: string): void;
  rmdir(path: string): void;
  readdir(path: string): string[];
  writeFile(path: string, data: string | ArrayBufferView, opts?: any): void;
  readFile(path: string, opts?: { encoding?: 'binary' | 'utf8' }): any;
  unlink(path: string): void;
  stat(path: string): { size: number; mode: number };
  chdir(path: string): void;
  cwd(): string;
}

declare const FS: EmscriptenFS;

export default function createCalculiXModule(
  overrides?: Partial<CalculiXModule>
): Promise<CalculiXModule>;

