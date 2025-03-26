import BN from 'bn.js';
import * as encUtils from 'enc-utils';
import { Signer, toUtf8Bytes } from 'ethers';

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
  signer: Signer,
): Promise<string> {
  console.log('signRaw.payload', { payload });
  console.log('signRaw.toUtf8Bytes', { bytes: toUtf8Bytes(payload).toString() });
  console.log('signRaw.payload.normalize() === payload', { result: payload === payload.normalize() });

  // prevent utf-8 encoding issues
  const encoder = new TextEncoder();
  const buffer = encoder.encode(payload);
  // use this message to sign
  const message = new TextDecoder('utf-8').decode(buffer);

  const buffer2 = Buffer.from(payload, 'utf8');
  const message2 = new TextDecoder('utf-8').decode(buffer2);

  // compare message utf8 bytes with payload.normalize()
  console.log('signRaw.message === payload.normalize()', { result: message === payload.normalize() });
  console.log('signRaw.message2 === payload.normalize()', { result: message2 === payload.normalize() });

  // output utf8 bytes
  console.log('signRaw.message', { message, bytes: toUtf8Bytes(message).toString() });
  console.log('signRaw.message2', { message2, bytes: toUtf8Bytes(message2).toString() });

  // compare utf8 bytes output
  console.log(
    'signRaw.toUtf8Bytes === toUtf8Bytes(message)',
    { result: toUtf8Bytes(payload).toString() === toUtf8Bytes(message).toString() },
  );
  console.log(
    'signRaw.toUtf8Bytes === toUtf8Bytes(message2)',
    { result: toUtf8Bytes(payload).toString() === toUtf8Bytes(message2).toString() },
  );

  const signature = deserializeSignature(await signer.signMessage(toUtf8Bytes(message)));
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
