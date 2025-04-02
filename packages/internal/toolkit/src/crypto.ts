import BN from 'bn.js';
import * as encUtils from 'enc-utils';
import { toUtf8Bytes, Signer } from 'ethers';
import { Signer as EthersV5Signer } from 'ethers-v5';
import { track } from '@imtbl/metrics';

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
  const isValidBigNumber = new BN(v, 16).cmp(new BN(27)) !== -1
    ? new BN(v, 16).sub(new BN(27)).toNumber()
    : new BN(v, 16).toNumber();
  return v.trim()
    ? isValidBigNumber
    : undefined;
}

// used chained with serializeEthSignature. serializeEthSignature(deserializeSignature(...))
function deserializeSignature(sig: string, size = 64): SignatureOptions {
  const removedHexPrefixSig = encUtils.removeHexPrefix(sig);
  return {
    r: new BN(removedHexPrefixSig.substring(0, size), 'hex'),
    s: new BN(removedHexPrefixSig.substring(size, size * 2), 'hex'),
    recoveryParam: importRecoveryParam(removedHexPrefixSig.substring(size * 2, size * 2 + 2)),
  };
}

export async function signRaw(
  payload: string,
  signer: Signer | EthersV5Signer,
): Promise<string> {
  const address = await signer.getAddress();
  track('xProvider', 'log', {
    address,
    param: 'signRaw.payload',
    val: payload,
  });
  track('xProvider', 'log', {
    address,
    param: 'signRaw.toUtf8Bytes',
    val: toUtf8Bytes(payload).toString(),
  });
  track('xProvider', 'log', {
    address,
    param: 'signRaw.payload.normalize() === payload',
    val: payload === payload.normalize(),
  });

  // prevent utf-8 encoding issues
  const encoder = new TextEncoder();
  const buffer = encoder.encode(payload);
  // use this message to sign
  const message = new TextDecoder('utf-8').decode(buffer);

  const buffer2 = Buffer.from(payload, 'utf8');
  const message2 = new TextDecoder('utf-8').decode(buffer2);

  // compare message utf8 bytes with payload.normalize()
  track('xProvider', 'log', {
    address,
    param: 'signRaw.message === payload.normalize()',
    val: message === payload.normalize(),
  });
  track('xProvider', 'log', {
    address,
    param: 'signRaw.message2 === payload.normalize()',
    val: message2 === payload.normalize(),
  });

  // output utf8 bytes
  track('xProvider', 'log', {
    address,
    param: 'signRaw.message',
    val: message,
    bytes: toUtf8Bytes(message).toString(),
  });
  track('xProvider', 'log', {
    address,
    param: 'signRaw.message2',
    val: message2,
    bytes: toUtf8Bytes(message2).toString(),
  });
  // compare utf8 bytes output
  track('xProvider', 'log', {
    address,
    param: 'signRaw.toUtf8Bytes === toUtf8Bytes(message)',
    val: toUtf8Bytes(payload).toString() === toUtf8Bytes(message).toString(),
  });
  track('xProvider', 'log', {
    address,
    param: 'signRaw.toUtf8Bytes === toUtf8Bytes(message2)',
    val: toUtf8Bytes(payload).toString() === toUtf8Bytes(message2).toString(),
  });

  const signature = deserializeSignature(await signer.signMessage(toUtf8Bytes(message)));
  return serializeEthSignature(signature);
}

type IMXAuthorisationHeaders = {
  timestamp: string;
  signature: string;
};

export async function generateIMXAuthorisationHeaders(
  ethSigner: Signer | EthersV5Signer,
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
  signer: Signer | EthersV5Signer,
): Promise<{ message: string; ethAddress: string; ethSignature: string }> {
  const ethAddress = await signer.getAddress();
  const ethSignature = await signRaw(message, signer);
  return {
    message,
    ethAddress,
    ethSignature,
  };
}
