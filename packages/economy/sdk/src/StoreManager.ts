/* eslint-disable class-methods-use-this */
import { Service } from 'typedi';

@Service()
export class StoreManager {
  public storeData<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (e) {
      this.handleError(e);
    }
  }

  // Retrieve data from local storage
  public getData<T>(key: string): T | null {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return null;
      }
      return JSON.parse(serializedData) as T;
    } catch (e) {
      this.handleError(e);
      return null;
    }
  }

  // Delete data from local storage
  public deleteData(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      this.handleError(e);
    }
  }

  // Clear all data from local storage
  public clearData(): void {
    try {
      localStorage.clear();
    } catch (e) {
      this.handleError(e);
    }
  }

  private handleError(e: unknown) {
    if (e instanceof DOMException) {
      if (e.name === 'QuotaExceededError') {
        console.error(
          'Failed to save data to local storage because it is full.'
        );
      } else if (e.name === 'SecurityError') {
        console.error('Local storage is disabled, unable to save data.');
      }
    } else {
      console.error('Error using local storage methods', e);
    }
  }
}
