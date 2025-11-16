/**
 * Storage abstraction that works in browser and SSR environments
 */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Browser localStorage adapter
 */
class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage quota exceeded or disabled
    }
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage disabled
    }
  }
}

/**
 * Cookie-based storage adapter (fallback for when localStorage is unavailable)
 */
class CookieStorageAdapter implements StorageAdapter {
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') {
      return null;
    }
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  private setCookie(name: string, value: string, days = 365): void {
    if (typeof document === 'undefined') {
      return;
    }
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  private removeCookie(name: string): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  getItem(key: string): string | null {
    return this.getCookie(key);
  }

  setItem(key: string, value: string): void {
    this.setCookie(key, value);
  }

  removeItem(key: string): void {
    this.removeCookie(key);
  }
}

/**
 * In-memory storage adapter (for SSR or when storage is unavailable)
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }
}

/**
 * Get the best available storage adapter
 */
export function getStorageAdapter(): StorageAdapter {
  if (typeof window !== 'undefined') {
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return new LocalStorageAdapter();
    } catch {
      // localStorage unavailable, try cookies
      if (typeof document !== 'undefined') {
        return new CookieStorageAdapter();
      }
    }
  }
  return new MemoryStorageAdapter();
}

