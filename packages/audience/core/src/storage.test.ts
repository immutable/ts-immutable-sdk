import * as storage from './storage';

afterEach(() => {
  localStorage.clear();
});

describe('storage', () => {
  it('round-trips a string value', () => {
    storage.setItem('key', 'hello');
    expect(storage.getItem('key')).toBe('hello');
  });

  it('round-trips an object value', () => {
    const obj = { a: 1, b: 'two' };
    storage.setItem('key', obj);
    expect(storage.getItem('key')).toEqual(obj);
  });

  it('returns undefined for missing keys', () => {
    expect(storage.getItem('missing')).toBeUndefined();
  });

  it('removes items', () => {
    storage.setItem('key', 'value');
    storage.removeItem('key');
    expect(storage.getItem('key')).toBeUndefined();
  });

  it('prefixes keys in localStorage', () => {
    storage.setItem('test', 'val');
    expect(localStorage.getItem('__imtbl_audience_test')).toBe('"val"');
  });
});
