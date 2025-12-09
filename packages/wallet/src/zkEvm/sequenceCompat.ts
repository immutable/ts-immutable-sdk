/* eslint-disable no-bitwise */
import {
  getAddress,
  toBytes,
  toHex,
  encodePacked,
  type Address,
} from 'viem';

// Minimal ABI surface used by walletHelpers for nonce reads and execute encoding.
export const walletContracts = {
  mainModule: {
    abi: [
      {
        type: 'function',
        name: 'nonce',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }],
      },
      {
        type: 'function',
        name: 'readNonce',
        stateMutability: 'view',
        inputs: [{ type: 'uint256' }],
        outputs: [{ type: 'uint256' }],
      },
      {
        type: 'function',
        name: 'execute',
        stateMutability: 'nonpayable',
        inputs: [
          {
            components: [
              { type: 'bool', name: 'delegateCall' },
              { type: 'bool', name: 'revertOnError' },
              { type: 'uint256', name: 'gasLimit' },
              { type: 'address', name: 'target' },
              { type: 'uint256', name: 'value' },
              { type: 'bytes', name: 'data' },
            ],
            type: 'tuple[]',
          },
          { type: 'uint256' },
          { type: 'bytes' },
        ],
        outputs: [],
      },
    ],
  },
};

enum SignaturePartType {
  EOASignature = 0,
  Address = 1,
  DynamicSignature = 2,
}

export type SequenceSigner = {
  weight: number;
  address?: string;
  signature?: string;
  isDynamic?: boolean;
  unrecovered?: boolean;
};

export type SequenceSignature = {
  version: 1;
  threshold: number;
  signers: SequenceSigner[];
};

export const decodeSequenceSignatureV1 = (signature: string): SequenceSignature => {
  const bytes = toBytes(signature as `0x${string}`);
  const threshold = (bytes[0] << 8) | bytes[1];
  const signers: SequenceSigner[] = [];

  for (let i = 2; i < bytes.length;) {
    const type = bytes[i++];
    const weight = bytes[i++];

    if (type === SignaturePartType.EOASignature) {
      signers.push({
        unrecovered: true,
        weight,
        signature: toHex(bytes.slice(i, i + 66)),
        isDynamic: false,
      });
      i += 66;
    } else if (type === SignaturePartType.Address) {
      signers.push({
        weight,
        address: getAddress(toHex(bytes.slice(i, i + 20))),
      });
      i += 20;
    } else if (type === SignaturePartType.DynamicSignature) {
      const address = getAddress(toHex(bytes.slice(i, i + 20)));
      i += 20;
      const size = (bytes[i] << 8) | bytes[i + 1];
      i += 2;
      signers.push({
        unrecovered: true,
        weight,
        signature: toHex(bytes.slice(i, i + size)),
        address,
        isDynamic: true,
      });
      i += size;
    } else {
      throw new Error(`Unknown signature part type: ${type}`);
    }
  }

  return {
    version: 1,
    threshold,
    signers,
  };
};

export const encodeSequenceSignatureV1 = (input: SequenceSignature): string => {
  const { signers, threshold } = input;
  const encodedSigners = signers.map((signer) => {
    const weight = Number(signer.weight);
    if (signer.address && signer.signature === undefined) {
      return encodePacked(
        ['uint8', 'uint8', 'address'],
        [SignaturePartType.Address, weight, signer.address as Address],
      );
    }

    if (signer.signature === undefined) {
      throw new Error('Signature value missing for signer');
    }

    if (signer.isDynamic) {
      const signatureBytes = toBytes(signer.signature as `0x${string}`);
      const address = signer.address ? getAddress(signer.address) : undefined;
      if (!address) {
        throw new Error('Dynamic signature part must include an address');
      }
      return encodePacked(
        ['uint8', 'uint8', 'address', 'uint16', 'bytes'],
        [SignaturePartType.DynamicSignature, weight, address, signatureBytes.length, toHex(signatureBytes)],
      );
    }

    return encodePacked(
      ['uint8', 'uint8', 'bytes'],
      [SignaturePartType.EOASignature, weight, signer.signature as `0x${string}`],
    );
  });

  return encodePacked(
    ['uint16', ...new Array(encodedSigners.length).fill('bytes')],
    [threshold, ...encodedSigners],
  );
};
