/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */

import { Service } from 'typedi';
import { produce } from 'immer';

import type { CraftIngredient } from './__codegen__/crafting';

type State = {
  craftingInputs: CraftIngredient[];
  selectedRecipeId: string | undefined;
};

export const defaultState: State = {
  selectedRecipeId: undefined,
  craftingInputs: [],
};

@Service()
export class Store<T = State> {
  private data!: T;

  constructor(private defaultValue: T, private persist = false) {
    this.reset();
  }

  public set(fn: (data: T) => void) {
    this.data = produce(this.data, fn);
    if (this.persist) {
      this.saveToLocalStorage(this.data);
    }
  }

  public get(): T {
    return this.data;
  }

  public reset() {
    this.data = { ...this.defaultValue, ...this.loadFromLocalStorage() };
  }

  private saveToLocalStorage(data: T): void {
    if (!this.persist) return;

    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem('storeData', serializedData);
    } catch (error) {
      console.log('Failed to save data to local storage:', error);
    }
  }

  private loadFromLocalStorage(): T | null {
    if (!this.persist) return null;

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
