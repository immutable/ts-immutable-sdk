/** @jest-environment jsdom */

/* eslint-disable no-param-reassign */

import { Store } from './Store';

describe('Store', () => {
  interface Data {
    id: string;
    user: { name: string; age?: number };
    items?: number[];
  }

  const defaultValue: Data = {
    id: '1',
    user: { name: 'bob' },
    items: [],
  };

  let store: Store<Data>;

  beforeEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
    store = new Store<Data>(defaultValue);
  });

  it('should handle errors when loading from local storage', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Local storage error');
    });

    store = new Store<Data>(defaultValue);
    expect(store.get()).toEqual(defaultValue);

    store.set(() => ({ id: '2' }));
    expect(store.get().id).toEqual('2');
  });

  it('should set and get the data object', () => {
    store.set((data) => {
      data.id = '2';
    });

    expect(store.get()).toEqual({
      id: '2',
      items: [],
      user: { name: 'bob' },
    });
  });

  it('should perform a nested partial update on the data object', () => {
    store.set((data) => {
      data.user = { name: 'alice', age: 20 };
      data.items?.push(...[1, 2, 3]);
    });

    expect(store.get()).toEqual({
      id: '1',
      items: [1, 2, 3],
      user: { name: 'alice', age: 20 },
    });
  });

  it('should load data from local storage', () => {
    const storedData: Data = {
      id: '3',
      user: { name: 'charlie', age: 20 },
    };
    const serializedData = JSON.stringify(storedData);
    localStorage.setItem('storeData', serializedData);

    store = new Store<Data>(defaultValue);

    expect(store.get()).toEqual(storedData);
  });

  it('should save data to local storage', () => {
    store.set((data) => {
      data.id = '4';
      data.user = { name: 'alice', age: 30 };
    });

    const storedData = localStorage.getItem('storeData');
    const parsedData = storedData ? JSON.parse(storedData) : null;

    expect(parsedData).toEqual(store.get());
  });
});
