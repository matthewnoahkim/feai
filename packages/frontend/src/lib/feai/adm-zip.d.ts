declare module 'adm-zip' {
  class AdmZip {
    constructor(buffer?: Buffer);
    addFile(entryName: string, data: Buffer): void;
    toBuffer(): Buffer;
    getEntries(): { entryName: string; isDirectory: boolean; getData: () => Buffer }[];
    getEntry(entryName: string): { entryName: string; isDirectory: boolean; getData: () => Buffer } | null;
  }
  export = AdmZip;
}
