import { Flow } from '@imtbl/metrics';
import { Signer, JsonRpcProvider } from 'ethers';
import GuardianClient from '../guardian';
import { signAndPackTypedData } from './walletHelpers';
import {
  chainId,
  chainIdHex,
} from '../test/mocks';
import { RelayerClient } from './relayerClient';
import { signTypedDataV4 } from './signTypedDataV4';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { TypedDataPayload } from './types';

jest.mock('./walletHelpers');

describe('signTypedDataV4', () => {
  const address = '0xd64b0d2d72bb1b3f18046b8a7fc6c9ee6bccd287';
  const eip712Payload: TypedDataPayload = {
    types: { EIP712Domain: [] },
    domain: {},
    primaryType: '',
    message: {},
  };
  const relayerSignature = '02011b1d383526a2815d26550eb314b5d7e0551327330043c4d07715346a7d5517ecbc32304fc1ccdcd52fea386c94c3b58b90410f20cd1d5c6db8fa1f03c34e82dce78c3445ce38583e0b0689c69b8fbedbc33d3a2e45431b0103';
  const combinedSignature = '0x000202011b1d383526a2815d26550eb314b5d7e0551327330043c4d07715346a7d5517ecbc32304fc1ccdcd52fea386c94c3b58b90410f20cd1d5c6db8fa1f03c34e82dce78c3445ce38583e0b0689c69b8fbedbc33d3a2e45431b01030001d25acf5eef26fb627f91e02ebd111580030ab8fb0a55567ac8cc66c34de7ae98185125a76adc6ee2fea042c7fce9c85a41e790ce3529f93dfec281bf56620ef21b02';
  const ethSigner = {} as Signer;
  const rpcProvider = {
    _detectNetwork: jest.fn(),
  };
  const relayerClient = {
    imSignTypedData: jest.fn(),
  };
  const guardianClient = {
    evaluateEIP712Message: jest.fn(),
  };
  const flow = {
    addEvent: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    relayerClient.imSignTypedData.mockResolvedValue(relayerSignature);
    (signAndPackTypedData as jest.Mock).mockResolvedValueOnce(
      combinedSignature,
    );
    rpcProvider._detectNetwork.mockResolvedValue({ chainId });
  });

  describe('when a valid address and json are provided', () => {
    it('returns a signature', async () => {
      const result = await signTypedDataV4({
        method: 'eth_signTypedData_v4',
        params: [address, JSON.stringify(eip712Payload)],
        ethSigner,
        rpcProvider: rpcProvider as unknown as JsonRpcProvider,
        relayerClient: relayerClient as unknown as RelayerClient,
        guardianClient: guardianClient as unknown as GuardianClient,
        flow: flow as unknown as Flow,
      });

      expect(result).toEqual(combinedSignature);
      expect(relayerClient.imSignTypedData).toHaveBeenCalledWith(
        address,
        eip712Payload,
      );
      expect(signAndPackTypedData).toHaveBeenCalledWith(
        eip712Payload,
        relayerSignature,
        BigInt(chainId),
        address,
        ethSigner,
      );
    });
  });

  describe('when a valid address and object are provided', () => {
    it('returns a signature', async () => {
      const result = await signTypedDataV4({
        method: 'eth_signTypedData_v4',
        params: [address, eip712Payload],
        ethSigner,
        rpcProvider: rpcProvider as unknown as JsonRpcProvider,
        relayerClient: relayerClient as unknown as RelayerClient,
        guardianClient: guardianClient as any,
        flow: flow as unknown as Flow,
      });

      expect(result).toEqual(combinedSignature);
      expect(relayerClient.imSignTypedData).toHaveBeenCalledWith(
        address,
        eip712Payload,
      );
      expect(signAndPackTypedData).toHaveBeenCalledWith(
        eip712Payload,
        relayerSignature,
        BigInt(chainId),
        address,
        ethSigner,
      );
    });
  });

  describe('when an argument is missing', () => {
    it('should throw an error', async () => {
      await expect(async () => (
        signTypedDataV4({
          method: 'eth_signTypedData_v4',
          params: [address],
          ethSigner,
          rpcProvider: rpcProvider as unknown as JsonRpcProvider,
          relayerClient: relayerClient as unknown as RelayerClient,
          guardianClient: guardianClient as any,
          flow: flow as unknown as Flow,
        })
      )).rejects.toThrow(
        new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'eth_signTypedData_v4 requires an address and a typed data JSON'),
      );
    });
  });

  describe('when an invalid JSON is provided', () => {
    it('should throw an error', async () => {
      await expect(async () => (
        signTypedDataV4({
          method: 'eth_signTypedData_v4',
          params: [address, '*~<|8)-/-<'],
          ethSigner,
          rpcProvider: rpcProvider as unknown as JsonRpcProvider,
          relayerClient: relayerClient as unknown as RelayerClient,
          guardianClient: guardianClient as any,
          flow: flow as unknown as Flow,
        })
      )).rejects.toMatchObject({
        code: RpcErrorCode.INVALID_PARAMS,
        // Using stringMatching to avoid differing error message formats across Node
        message: expect.stringMatching(/Failed to parse typed data JSON: SyntaxError: Unexpected token.*/),
      });
    });
  });

  describe('when the typedDataPayload is missing a required property', () => {
    it('should throw an error', async () => {
      const payload = {
        domain: {},
        primaryType: '',
        message: {},
      };

      await expect(async () => (
        signTypedDataV4({
          method: 'eth_signTypedData_v4',
          params: [address, payload],
          ethSigner,
          rpcProvider: rpcProvider as unknown as JsonRpcProvider,
          relayerClient: relayerClient as unknown as RelayerClient,
          guardianClient: guardianClient as any,
          flow: flow as unknown as Flow,
        })
      )).rejects.toThrow(
        new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'Invalid typed data argument. The following properties are required: types, domain, primaryType, message'),
      );
    });
  });

  describe('when a different chainId is used', () => {
    it('should throw an error', async () => {
      await expect(async () => (
        signTypedDataV4({
          method: 'eth_signTypedData_v4',
          params: [
            address,
            {
              ...eip712Payload,
              domain: {
                chainId: 5,
              },
            },
          ],
          ethSigner,
          rpcProvider: rpcProvider as unknown as JsonRpcProvider,
          relayerClient: relayerClient as unknown as RelayerClient,
          guardianClient: guardianClient as any,
          flow: flow as unknown as Flow,
        })
      )).rejects.toThrow(
        new JsonRpcError(RpcErrorCode.INVALID_PARAMS, `Invalid chainId, expected ${chainId}`),
      );
    });
  });

  it.each([chainIdHex, `${chainId}`])('converts the chainId to a number and returns a signature', async (testChainId: any) => {
    const payload: TypedDataPayload = {
      ...eip712Payload,
      domain: {
        chainId: testChainId,
      },
    };
    const result = await signTypedDataV4({
      method: 'eth_signTypedData_v4',
      params: [
        address,
        payload,
      ],
      ethSigner,
      rpcProvider: rpcProvider as unknown as JsonRpcProvider,
      relayerClient: relayerClient as unknown as RelayerClient,
      guardianClient: guardianClient as any,
      flow: flow as unknown as Flow,
    });

    expect(result).toEqual(combinedSignature);
    expect(relayerClient.imSignTypedData).toHaveBeenCalledWith(
      address,
      payload,
    );
    expect(signAndPackTypedData).toHaveBeenCalledWith(
      payload,
      relayerSignature,
      BigInt(chainId),
      address,
      ethSigner,
    );
  });
});
