export const isNode = () => typeof window === 'undefined';

export const isBrowser = () => !isNode();
