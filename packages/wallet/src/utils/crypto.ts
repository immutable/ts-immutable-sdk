import type { WalletSigner } from '../types';

/**
 * Signature components for Ethereum signatures
 */
type SignatureOptions = {
  r: bigint;
  s: bigint;
  recoveryParam: number | null | undefined;
};

/**
 * Adds '0x' prefix to a hex string if not present
 */
function addHexPrefix(hex: string): string {
  return hex.startsWith('0x') ? hex : `0x${hex}`;
}

/**
 * Removes '0x' prefix from a hex string if present
 */
function removeHexPrefix(hex: string): string {
  return hex.startsWith('0x') ? hex.slice(2) : hex;
}

/**
 * Pads a hex string to a specified length with leading zeros
 */
function padLeft(str: string, length: number): string {
  return str.padStart(length, '0');
}

/**
 * Serializes Ethereum signature components into a hex string.
 * This format is used for IMX registration with golang backend.
 * @see https://github.com/ethers-io/ethers.js/issues/823
 */
function serializeEthSignature(sig: SignatureOptions): string {
  const rHex = padLeft(sig.r.toString(16), 64);
  const sHex = padLeft(sig.s.toString(16), 64);
  const vHex = padLeft(sig.recoveryParam?.toString(16) || '', 2);
  return addHexPrefix(rHex + sHex + vHex);
}

/**
 * Imports recovery parameter from hex string, normalizing v value
 */
function importRecoveryParam(v: string): number | undefined {
  if (!v.trim()) return undefined;

  const vValue = parseInt(v, 16);
  // If v >= 27, subtract 27 to get recovery param (0 or 1)
  return vValue >= 27 ? vValue - 27 : vValue;
}

/**
 * Deserializes a signature hex string into its components (r, s, v)
 */
function deserializeSignature(sig: string, size = 64): SignatureOptions {
  const cleanSig = removeHexPrefix(sig);
  return {
    r: BigInt(`0x${cleanSig.substring(0, size)}`),
    s: BigInt(`0x${cleanSig.substring(size, size * 2)}`),
    recoveryParam: importRecoveryParam(cleanSig.substring(size * 2, size * 2 + 2)),
  };
}

/**
 * Signs a message with the provided signer and returns a serialized signature
 * suitable for IMX registration and authorization.
 *
 * This is inlined from @imtbl/toolkit to avoid ethers dependency.
 *
 * @param payload - The message to sign
 * @param signer - A WalletSigner implementation
 * @returns The serialized signature as a hex string
 */
export async function signRaw(
  payload: string,
  signer: WalletSigner,
): Promise<string> {
  const rawSignature = await signer.signMessage(payload);
  const signature = deserializeSignature(rawSignature);
  return serializeEthSignature(signature);
}
