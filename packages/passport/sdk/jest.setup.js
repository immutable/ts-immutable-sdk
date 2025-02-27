import { TextEncoder } from 'util';

global.TextEncoder = TextEncoder;

/**
 * @see https://github.com/ethers-io/ethers.js/issues/4365
 */
Object.defineProperty(Uint8Array, Symbol.hasInstance, {
    value(potentialInstance) {
      return this === Uint8Array
        ? Object.prototype.toString.call(potentialInstance) ===
            '[object Uint8Array]'
        : Uint8Array[Symbol.hasInstance].call(this, potentialInstance);
    },
  });
