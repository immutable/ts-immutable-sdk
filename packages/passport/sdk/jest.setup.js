import { TextEncoder } from 'util';

global.TextEncoder = TextEncoder;

/**
 * Normalize Uint8Array instanceof checks across realms (jsdom / Node).
 */
Object.defineProperty(Uint8Array, Symbol.hasInstance, {
    value(potentialInstance) {
      return this === Uint8Array
        ? Object.prototype.toString.call(potentialInstance) ===
            '[object Uint8Array]'
        : Uint8Array[Symbol.hasInstance].call(this, potentialInstance);
    },
  });
