/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/naming-convention
import BN from 'bn.js';
// @ts-ignore
import elliptic from 'elliptic';
import * as encUtils from 'enc-utils';
import { hdkey } from '@ethereumjs/wallet';
import hashJS from 'hash.js';

import {
  ORDER,
  SECP_ORDER,
  starkEc,
} from './constants';

export function isHexPrefixed(str: string): boolean {
  return str.substring(0, 2) === '0x';
}

export function getIntFromBits(
  hex: string,
  start: number,
  end: number | undefined = undefined,
): number {
  const bin = encUtils.hexToBinary(hex);
  const bits = bin.slice(start, end);
  const int = encUtils.binaryToNumber(bits);
  return int;
}

export function getAccountPath(
  layer: string,
  application: string,
  ethereumAddress: string,
  index: string,
): string {
  const layerHash = hashJS.sha256().update(layer).digest('hex');
  const applicationHash = hashJS.sha256().update(application).digest('hex');
  const layerInt = getIntFromBits(layerHash, -31);
  const applicationInt = getIntFromBits(applicationHash, -31);
  const ethAddressInt1 = getIntFromBits(ethereumAddress, -31);
  const ethAddressInt2 = getIntFromBits(ethereumAddress, -62, -31);
  return `m/2645'/${layerInt}'/${applicationInt}'/${ethAddressInt1}'/${ethAddressInt2}'/${index}`;
}

export function hashKeyWithIndex(key: string, index: number): BN {
  return new BN(
    hashJS
      .sha256()
      .update(
        encUtils.hexToBuffer(
          encUtils.removeHexPrefix(key)
            + encUtils.sanitizeBytes(encUtils.numberToHex(index), 2),
        ),
      )
      .digest('hex'),
    16,
  );
}

export function grindKey(privateKey: string): string {
  let i = 0;
  let key: BN = hashKeyWithIndex(privateKey, i);

  while (!key.lt(SECP_ORDER.sub(SECP_ORDER.mod(ORDER)))) {
    key = hashKeyWithIndex(key.toString(16), i);
    i = i++;
  }
  return key.mod(ORDER).toString('hex');
}

export function getKeyPair(privateKey: string): elliptic.ec.KeyPair {
  return starkEc.keyFromPrivate(privateKey, 'hex');
}

export function getPrivateKeyFromPath(seed: string, path: string): string {
  const seedArrayIterable = seed.slice(2).match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16));
  if (!seedArrayIterable) {
    throw new Error('Seed is not a valid hex string');
  }
  const uint8ArrayFromHexString = Uint8Array.from(seedArrayIterable);

  return hdkey.EthereumHDKey
    .fromMasterSeed(uint8ArrayFromHexString) // assuming seed is '0x...'
    .derivePath(path)
    .getWallet()
    .getPrivateKeyString();
}

export function getPublic(keyPair: elliptic.ec.KeyPair, compressed = false): string {
  return keyPair.getPublic(compressed, 'hex');
}

export function getStarkPublicKey(keyPair: elliptic.ec.KeyPair): string {
  return getPublic(keyPair, true);
}

export function getKeyPairFromPublicKey(publicKey: string): elliptic.ec.KeyPair {
  return starkEc.keyFromPublic(encUtils.hexToArray(publicKey));
}

export function getKeyPairFromPrivateKey(privateKey: string): elliptic.ec.KeyPair {
  return starkEc.keyFromPrivate(privateKey, 'hex');
}

export function getXCoordinate(publicKey: string): string {
  const keyPair = getKeyPairFromPublicKey(publicKey);
  return encUtils.sanitizeBytes((keyPair as any).pub.getX().toString(16), 2);
}
