import { useState } from 'react';

export default function useLocalStorage<T>(key: string, initialValue: T) {
  const [state, setState] = useState(() => {
    // Initialize the state
    if (typeof window !== 'undefined') {
      const value = window.localStorage.getItem(key);
      // Check if the local storage already has any values,
      // otherwise initialize it with the passed initialValue
      return value ? JSON.parse(value) : initialValue;
    }
    return initialValue;
  });

  const setValue = (value: T) => {
    if (typeof window !== 'undefined') {
      const valueToStore = value instanceof Function ? value(state) : value;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      setState(value);
    }
  };

  return [state, setValue];
}
