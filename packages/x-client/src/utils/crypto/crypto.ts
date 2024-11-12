// eslint-disable-next-line @typescript-eslint/naming-convention
import BN from 'bn.js';
// @ts-ignore
import elliptic from 'elliptic';
import * as encUtils from 'enc-utils';
import { Signer, solidityPackedKeccak256 } from 'ethers';
import { StarkSigner } from '../../types';
import { starkEcOrder } from '../stark/starkCurve';

type SignatureOptions = {
  r: BN;
  s: BN;
  recoveryParam: number | null | undefined;
};

// used to sign message with L1 keys. Used for registration
function serializeEthSignature(sig: SignatureOptions): string {
  // This is because golang appends a recovery param
  // https://github.com/ethers-io/ethers.js/issues/823
  return encUtils.addHexPrefix(
    encUtils.padLeft(sig.r.toString(16), 64)
      + encUtils.padLeft(sig.s.toString(16), 64)
      + encUtils.padLeft(sig.recoveryParam?.toString(16) || '', 2),
  );
}

function importRecoveryParam(v: string): number | undefined {
  // eslint-disable-next-line no-nested-ternary
  return v.trim()
    ? new BN(v, 16).cmp(new BN(27)) !== -1
      ? new BN(v, 16).sub(new BN(27)).toNumber()
      : new BN(v, 16).toNumber()
    : undefined;
}

// used chained with serializeEthSignature. serializeEthSignature(deserializeSignature(...))
function deserializeSignature(sig: string, size = 64): SignatureOptions {
  // eslint-disable-next-line no-param-reassign
  sig = encUtils.removeHexPrefix(sig);
  return {
    r: new BN(sig.substring(0, size), 'hex'),
    s: new BN(sig.substring(size, size * 2), 'hex'),
    recoveryParam: importRecoveryParam(sig.substring(size * 2, size * 2 + 2)),
  };
}

export async function signRaw(
  payload: string,
  signer: Signer,
): Promise<string> {
  const signature = deserializeSignature(await signer.signMessage(payload));
  return serializeEthSignature(signature);
}

type IMXAuthorisationHeaders = {
  timestamp: string;
  signature: string;
};

export async function generateIMXAuthorisationHeaders(
  ethSigner: Signer,
): Promise<IMXAuthorisationHeaders> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = await signRaw(timestamp, ethSigner);

  return {
    timestamp,
    signature,
  };
}

export async function signMessage(
  message: string,
  signer: Signer,
): Promise<{ message: string; ethAddress: string; ethSignature: string }> {
  const ethAddress = await signer.getAddress();
  const ethSignature = await signRaw(message, signer);
  return {
    message,
    ethAddress,
    ethSignature,
  };
}

export function serializePackedSignature(
  // elliptic signature object
  // eslint-disable-line @typescript-eslint/no-explicit-any
  sig: any,
  pubY: string,
): string {
  return encUtils.sanitizeHex(
    encUtils.padLeft(sig.r.toString(16), 64)
    + encUtils.padLeft(sig.s.toString(16), 64, '0')
    + encUtils.padLeft(
      new BN(encUtils.removeHexPrefix(pubY), 'hex').toString(16),
      64,
      '0',
    ),
  );
}

export async function signRegisterEthAddress(
  starkSigner: StarkSigner,
  ethAddress: string,
  starkPublicKey: string,
): Promise<string> {
  const hash: string = solidityPackedKeccak256(
    ['string', 'address', 'uint256'],
    ['UserRegistration:', ethAddress, starkPublicKey],
  );
  const msgHash: BN = new BN(encUtils.removeHexPrefix(hash), 16);
  const modMsgHash: BN = msgHash.mod(starkEcOrder);
  const sigString: string = await starkSigner.signMessage(
    modMsgHash.toString(16),
  );
  const signature: elliptic.ec.Signature = deserializeSignature(sigString);
  const pubY: string = encUtils.sanitizeHex(await starkSigner.getYCoordinate());
  return serializePackedSignature(signature, pubY);
}
