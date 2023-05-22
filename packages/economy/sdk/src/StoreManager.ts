/* eslint-disable class-methods-use-this */
import { Service } from 'typedi';

@Service()
export class StoreManager {
  public storeData<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (e) {
      console.error('Error saving data to local storage', e);
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
      console.error('Error getting data from local storage', e);
      return null;
    }
  }

  // Delete data from local storage
  public deleteData(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error deleting data from local storage', e);
    }
  }

  // Clear all data from local storage
  public clearData(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error clearing local storage', e);
    }
  }
}
