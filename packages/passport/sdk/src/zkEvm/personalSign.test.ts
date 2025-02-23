import { Flow } from '@imtbl/metrics';
import { JsonRpcProvider, Signer } from 'ethers';
import { personalSign } from './personalSign';
import {
  packSignatures,
  signERC191Message,
} from './walletHelpers';
import { chainId } from '../test/mocks';
import { RelayerClient } from './relayerClient';
import GuardianClient from '../guardian';

jest.mock('./walletHelpers');

describe('personalSign', () => {
  const eoaAddress = '0xd64b0d2d72bb1b3f18046b8a7fc6c9ee6bccd287';
  const message = 'hello';

  const eoaSignature = '02011b1d383526a2815d26550eb314b5d7e05513273300439b63b94e127c13e1bae9f3f24ab42717c7ae2e25fb82e7fd24afc320690413ca6581c798f91cce8296bd21f4f35a4b33b882a5401499f829481d8ed8d3de23741b0103';
  const relayerSignature = '02011b1d383526a2815d26550eb314b5d7e0551327330043c4d07715346a7d5517ecbc32304fc1ccdcd52fea386c94c3b58b90410f20cd1d5c6db8fa1f03c34e82dce78c3445ce38583e0b0689c69b8fbedbc33d3a2e45431b0103';
  const packedSignatures = '0x000202011b1d383526a2815d26550eb314b5d7e0551327330043c4d07715346a7d5517ecbc32304fc1ccdcd52fea386c94c3b58b90410f20cd1d5c6db8fa1f03c34e82dce78c3445ce38583e0b0689c69b8fbedbc33d3a2e45431b01030001d25acf5eef26fb627f91e02ebd111580030ab8fb0a55567ac8cc66c34de7ae98185125a76adc6ee2fea042c7fce9c85a41e790ce3529f93dfec281bf56620ef21b02';

  // Mocks
  const ethSigner = {
    getAddress: jest.fn(),
  };
  const rpcProvider = {
    getNetwork: jest.fn(),
  };
  const relayerClient = {
    imSign: jest.fn(),
  };
  const guardianClient = {
    evaluateERC191Message: jest.fn(),
  };
  const flow = {
    addEvent: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();

    // Wallet helper mocks
    (packSignatures as jest.Mock).mockReturnValue(packedSignatures);
    (signERC191Message as jest.Mock).mockResolvedValue(eoaSignature);

    ethSigner.getAddress.mockResolvedValue(eoaAddress);
    relayerClient.imSign.mockResolvedValue(relayerSignature);
    rpcProvider.getNetwork.mockResolvedValue({ chainId });
  });

  describe('when a valid address and message are provided', () => {
    it('returns a signature', async () => {
      const result = await personalSign({
        params: [message, eoaAddress],
        ethSigner: ethSigner as unknown as Signer,
        rpcProvider: rpcProvider as unknown as JsonRpcProvider,
        relayerClient: relayerClient as unknown as RelayerClient,
        guardianClient: guardianClient as unknown as GuardianClient,
        zkEvmAddress: eoaAddress,
        flow: flow as unknown as Flow,
      });

      expect(result).toEqual(packedSignatures);
      expect(guardianClient.evaluateERC191Message).toHaveBeenCalledWith({
        payload: message,
        chainID: chainId,
      });
      expect(relayerClient.imSign).toHaveBeenCalledWith(eoaAddress, message);
      expect(signERC191Message).toHaveBeenCalledWith(
        BigInt(chainId),
        message,
        ethSigner,
        eoaAddress,
      );
    });
  });

  describe('when a valid address and hex encoded message are provided', () => {
    it('returns a signature', async () => {
      const hexMessage = '0x68656c6c6f'; // 'hello' in hex

      const result = await personalSign({
        params: [hexMessage, eoaAddress],
        ethSigner: ethSigner as unknown as Signer,
        rpcProvider: rpcProvider as unknown as JsonRpcProvider,
        relayerClient: relayerClient as unknown as RelayerClient,
        guardianClient: guardianClient as unknown as GuardianClient,
        zkEvmAddress: eoaAddress,
        flow: flow as unknown as Flow,
      });

      expect(result).toEqual(packedSignatures);
      expect(guardianClient.evaluateERC191Message).toHaveBeenCalledWith({
        payload: message,
        chainID: chainId,
      });
      expect(relayerClient.imSign).toHaveBeenCalledWith(eoaAddress, message);
      expect(signERC191Message).toHaveBeenCalledWith(
        BigInt(chainId),
        message,
        ethSigner,
        eoaAddress,
      );
    });
  });

  describe('when an argument is missing', () => {
    it('throws an error', async () => {
      await expect(personalSign({
        params: [eoaAddress],
        ethSigner: ethSigner as unknown as Signer,
        rpcProvider: rpcProvider as unknown as JsonRpcProvider,
        relayerClient: relayerClient as unknown as RelayerClient,
        guardianClient: guardianClient as unknown as GuardianClient,
        zkEvmAddress: eoaAddress,
        flow: flow as unknown as Flow,
      })).rejects.toThrow('personal_sign requires an address and a message');
    });
  });
});
