import { renderHook } from '@testing-library/react';
import { useStableValue } from './useStableValue';

describe('useStableValue', () => {
  it('returns same reference when value is deeply equal', () => {
    const initial = { a: 1, b: 'hello', nested: { x: true } };
    const { result, rerender } = renderHook(
      ({ value }) => useStableValue(value),
      { initialProps: { value: initial } },
    );

    const firstRef = result.current;

    // Re-render with a new object that has identical data
    rerender({ value: { a: 1, b: 'hello', nested: { x: true } } });

    expect(result.current).toBe(firstRef);
  });

  it('returns new reference when value changes', () => {
    const initial = { a: 1, b: 'hello' };
    const { result, rerender } = renderHook(
      ({ value }) => useStableValue(value),
      { initialProps: { value: initial } },
    );

    const firstRef = result.current;

    rerender({ value: { a: 2, b: 'hello' } });

    expect(result.current).not.toBe(firstRef);
    expect(result.current).toEqual({ a: 2, b: 'hello' });
  });

  it('handles null to value transition', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useStableValue(value),
      { initialProps: { value: null as { a: number } | null } },
    );

    expect(result.current).toBeNull();

    rerender({ value: { a: 1 } });

    expect(result.current).toEqual({ a: 1 });
  });

  it('handles value to null transition', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useStableValue(value),
      { initialProps: { value: { a: 1 } as { a: number } | null } },
    );

    expect(result.current).toEqual({ a: 1 });

    rerender({ value: null });

    expect(result.current).toBeNull();
  });

  it('is key-order independent', () => {
    const initial = { b: 2, a: 1 };
    const { result, rerender } = renderHook(
      ({ value }) => useStableValue(value),
      { initialProps: { value: initial } },
    );

    const firstRef = result.current;

    // Same data, different key order
    rerender({ value: { a: 1, b: 2 } });

    expect(result.current).toBe(firstRef);
  });
});
