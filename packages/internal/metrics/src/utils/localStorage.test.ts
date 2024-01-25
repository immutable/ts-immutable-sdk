import { deleteItem, getItem, setItem } from './localStorage';

beforeEach(() => {
  global.localStorage.clear();
});

describe('getItem', () => {
  test('it should not return a value that does not exist', () => {
    const value = getItem('test');
    expect(value).toBe(undefined);
  });
  test('it should return a string value when stored', () => {
    global.localStorage.setItem('__IMX-test', 'some value');
    expect(getItem('test')).toBe('some value');
  });
});

describe('setItem', () => {
  test('it should store items in a namespaced key', () => {
    setItem('test', 1);
    expect(global.localStorage.getItem('__IMX-test')).toBe('1');
  });

  test('it should serialise an object accurately when storing', () => {
    const returnVal = setItem('test', { a: 1, b: 'hello' });
    expect(global.localStorage.getItem('__IMX-test')).toBe(
      JSON.stringify({ a: 1, b: 'hello' }),
    );
    expect(returnVal).toBe(true);
  });

  test('it should handle null values accurately', () => {
    setItem('isNull', null);
    expect(getItem('isNull')).toBe(null);
    expect(getItem('doesnotexist')).toBe(undefined);
  });
});

describe('deleteItem', () => {
  test('should remove item that is stored', () => {
    global.localStorage.setItem('__IMX-test', 'test');
    deleteItem('test');
    expect(global.localStorage.getItem('__IMX--test')).toBeNull();
  });
  test('should do nothing if key not stored', () => {
    expect(() => global.localStorage.getItem('__IMX-random')).not.toThrow();
  });
});
