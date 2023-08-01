import { uniqBy } from './utils';

describe('uniqBy', () => {
  describe('when given an array of numbers with Math.floor func', () => {
    it('returns only unique items using comparator', () => {
      const numeros = [2.3, 1.2, 2.1];
      const uniqueItems = uniqBy(numeros, Math.floor);

      expect(uniqueItems.length).toEqual(2);
      expect(uniqueItems).toContain(2.1);
      expect(uniqueItems).toContain(1.2);
    });
  });

  describe('when given an array of strings with custom comparator', () => {
    it('returns only unique items using comparator', () => {
      const names = ['keith', 'jeet', 'feena'];
      const uniqueItems = uniqBy(names, (name) => name[1]);

      expect(uniqueItems.length).toEqual(1);
      expect(uniqueItems).toContain('feena');
    });
  });
});
