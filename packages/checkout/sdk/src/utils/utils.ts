export const isMatchingAddress = (addressA: string = '', addressB: string = '') => (
  addressA.toLowerCase() === addressB.toLowerCase()
);
