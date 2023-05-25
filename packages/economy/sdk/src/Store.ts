/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */

import { Service } from 'typedi';
import { produce } from 'immer';

import type { CraftIngredient } from './__codegen__/crafting';

type State = {
  craftingInputs: CraftIngredient[]
  selectedRecipeId: string | undefined
};

@Service()
export class Store<T = State> {
  private data: T;

  constructor(defaultValue: T) {
    this.data = this.loadFromLocalStorage() || { ...defaultValue };
  }

  set(fn: (data: T) => void) {
    this.data = produce(this.data, fn);
    this.saveToLocalStorage(this.data);
  }

  get(): T {
    return this.data;
  }

  private saveToLocalStorage(data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem('storeData', serializedData);
    } catch (error) {
      console.log('Failed to save data to local storage:', error);
    }
  }

  private loadFromLocalStorage(): T | null {
    try {
      const serializedData = localStorage.getItem('storeData');
      if (serializedData) {
        return JSON.parse(serializedData);
      }
    } catch (error) {
      console.log('Failed to load data from local storage:', error);
    }

    return null;
  }
}
