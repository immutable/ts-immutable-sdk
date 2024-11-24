import { AsyncStorage } from 'oidc-client-ts';
import localForage from 'localforage';

export class LocalForageAsyncStorage implements AsyncStorage {
  private storage: LocalForage;

  constructor(name: string, driver: string | string[]) {
    this.storage = localForage.createInstance({ name, driver });
  }

  get length(): Promise<number> {
    return this.storage.length();
  }

  clear(): Promise<void> {
    return this.storage.clear();
  }

  getItem(key: string): Promise<string | null> {
    return this.storage.getItem<string>(key);
  }

  key(index: number): Promise<string | null> {
    return this.storage.key(index);
  }

  async removeItem(key: string): Promise<void> {
    await this.storage.removeItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.storage.setItem(key, value);
  }
}
