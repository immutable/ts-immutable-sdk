import { deserializeSignature, serializeEthSignature } from '@imtbl/toolkit';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { Flow } from '@imtbl/metrics';
import { JsonRpcProvider } from 'ethers';
import { ChainId, ChainName } from '../../network/chains';
import { registerZkEvmUser } from './registerZkEvmUser';
import AuthManager from '../../authManager';
import { mockListChains, mockUserZkEvm } from '../../test/mocks';
import MagicTeeAdapter from '../../magic/magicTeeAdapter';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  JsonRpcProvider: jest.fn(),
}));
jest.mock('@imtbl/toolkit', () => ({
  deserializeSignature: jest.fn(),
  serializeEthSignature: jest.fn(),
}));

describe('registerZkEvmUser', () => {
  const mockMagicTeeAdapter = {
    createWallet: jest.fn(),
    personalSign: jest.fn(),
  };
  
  const authManager = {
    getUser: jest.fn(),
    forceUserRefreshInBackground: jest.fn(),
  };
  const multiRollupApiClients = {
    passportApi: {
      createCounterfactualAddressV2: jest.fn(),
    },
    chainsApi: {
      listChains: jest.fn(),
    },
  };
  const jsonRPCProvider = {
    getNetwork: jest.fn(),
  };
  const flow = {
    addEvent: jest.fn(),
  };
  const ethereumSignature = '0xcc63b10814e3ab4b2dff6762a6712e40c23db00c11f2c54bcc699babdbf1d2bc3096fec623da4784fafb7f6da65338d91e3c846ef52e856c2f5f86c4cf10790900';
  const accessToken = 'accessToken123';

  beforeEach(() => {
    jest.restoreAllMocks();
    mockMagicTeeAdapter.createWallet.mockResolvedValue(mockUserZkEvm.zkEvm.userAdminAddress);
    mockMagicTeeAdapter.personalSign.mockResolvedValue('mockSignature');
    
    // Mock the signature processing chain
    (deserializeSignature as jest.Mock).mockReturnValue('deserializedSignature');
    (serializeEthSignature as jest.Mock).mockReturnValue(ethereumSignature);
    
    multiRollupApiClients.chainsApi.listChains.mockResolvedValue(mockListChains);
    jsonRPCProvider.getNetwork.mockResolvedValue({ chainId: ChainId.IMTBL_ZKEVM_TESTNET });
  });

  describe('when createCounterfactualAddressV2 doesn\'t return a 201', () => {
    it('should throw an error', async () => {
      multiRollupApiClients.passportApi.createCounterfactualAddressV2.mockRejectedValue(
        new Error('Internal server error'),
      );
      await expect(async () => registerZkEvmUser({
        authManager: authManager as unknown as AuthManager,
        magicTeeAdapter: mockMagicTeeAdapter as unknown as MagicTeeAdapter,
        multiRollupApiClients: multiRollupApiClients as unknown as MultiRollupApiClients,
        accessToken,
        rpcProvider: jsonRPCProvider as unknown as JsonRpcProvider,
        flow: flow as unknown as Flow,
      })).rejects.toThrow('Failed to create counterfactual address: Error: Internal server error');
    });
  });

  it('should return a user that has registered with zkEvm', async () => {
    multiRollupApiClients.passportApi.createCounterfactualAddressV2.mockResolvedValue({
      status: 201,
      data: {
        counterfactual_address: mockUserZkEvm.zkEvm.ethAddress,
      },
    });

    const result = await registerZkEvmUser({
      authManager: authManager as unknown as AuthManager,
      magicTeeAdapter: mockMagicTeeAdapter as unknown as MagicTeeAdapter,
      multiRollupApiClients: multiRollupApiClients as unknown as MultiRollupApiClients,
      accessToken,
      rpcProvider: jsonRPCProvider as unknown as JsonRpcProvider,
      flow: flow as unknown as Flow,
    });

    expect(result).toEqual(mockUserZkEvm.zkEvm);
    expect(multiRollupApiClients.passportApi.createCounterfactualAddressV2).toHaveBeenCalledWith({
      chainName: ChainName.IMTBL_ZKEVM_TESTNET,
      createCounterfactualAddressRequest: {
        ethereum_address: mockUserZkEvm.zkEvm.userAdminAddress,
        ethereum_signature: ethereumSignature,
      },
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    expect(authManager.forceUserRefreshInBackground).toHaveBeenCalledTimes(1);
  });
});
