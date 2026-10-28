export interface StorageAdapter {
  put(key: string, data: Buffer | Uint8Array, contentType: string): Promise<string>;
  getSignedUrl(key: string, expiresIn: number): Promise<string>;
  delete(key: string): Promise<void>;
}

export class InMemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, { data: Buffer | Uint8Array; contentType: string }>();

  async put(key: string, data: Buffer | Uint8Array, contentType: string): Promise<string> {
    this.store.set(key, { data, contentType });
    return key;
  }

  async getSignedUrl(key: string, expiresIn: number): Promise<string> {
    return `/api/files/${encodeURIComponent(key)}?expires=${Date.now() + expiresIn * 1000}`;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

export const storage: StorageAdapter = new InMemoryStorageAdapter();
