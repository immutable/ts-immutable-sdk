import { parseSignature, type Hex } from 'viem';
import { Signer } from '../zkEvm/walletHelpers';

export async function signRaw(
  payload: string,
  signer: Signer,
): Promise<string> {
  const signatureHex = await signer.signMessage(payload);

  // Parse signature to get r, s, v
  const { r, s, v } = parseSignature(signatureHex as Hex);

  // Format r and s: remove 0x prefix, ensure 32 bytes (64 hex chars)
  const rHex = r.slice(2).padStart(64, '0');
  const sHex = s.slice(2).padStart(64, '0');

  // Format v:
  // v is bigint, usually 27 or 28 for Ethereum.
  // We need recovery param (0 or 1) as 1 byte (2 hex chars).
  // Matches logic in toolkit/crypto.ts: const recoveryParam = v ? Number(v) - 27 : 0;

  let vVal = Number(v);
  if (vVal >= 27) vVal -= 27;
  const vHex = vVal.toString(16).padStart(2, '0');

  // Reconstruct: 0x + r + s + v
  return `0x${rHex}${sHex}${vHex}`;
}
