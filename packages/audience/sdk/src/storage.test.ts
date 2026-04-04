import { getItem, setItem, removeItem } from './utils/storage';

const PREFIX = '__imtbl_audience_';

beforeEach(() => {
  localStorage.clear();
});

describe('storage', () => {
  describe('setItem / getItem', () => {
    it('round-trips an object', () => {
      setItem('test', { a: 1 });
      expect(getItem('test')).toEqual({ a: 1 });
    });

    it('round-trips an array', () => {
      setItem('arr', [1, 2, 3]);
      expect(getItem('arr')).toEqual([1, 2, 3]);
    });

    it('round-trips a string', () => {
      setItem('str', 'hello');
      expect(getItem('str')).toBe('hello');
    });

    it('prefixes keys in localStorage', () => {
      setItem('test', 'value');
      expect(localStorage.getItem(`${PREFIX}test`)).toBe('"value"');
    });
  });

  describe('getItem', () => {
    it('returns undefined for missing keys', () => {
      expect(getItem('missing')).toBeUndefined();
    });

    it('returns undefined when localStorage has invalid JSON', () => {
      localStorage.setItem(`${PREFIX}bad`, '{broken');
      expect(getItem('bad')).toBeUndefined();
    });
  });

  describe('removeItem', () => {
    it('removes the prefixed key', () => {
      setItem('test', 'value');
      removeItem('test');
      expect(getItem('test')).toBeUndefined();
    });
  });
});
