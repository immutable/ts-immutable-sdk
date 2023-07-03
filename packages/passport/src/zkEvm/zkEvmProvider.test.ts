import { JsonRpcProvider } from '@ethersproject/providers';
import { ZkEvmProviderInput, ZkEvmProvider } from './zkEvmProvider';
import { registerZkEvmUser } from './userRegistration';

jest.mock('@ethersproject/providers');
jest.mock('./relayerAdapter');
jest.mock('./userRegistration');

describe('ZkEvmProvider', () => {
  const getProvider = () => {
    const constructorParameters = {
      config: {},
    } as Partial<ZkEvmProviderInput>;

    return new ZkEvmProvider(constructorParameters as ZkEvmProviderInput);
  };

  describe('passthrough methods', () => {
    const sendMock = jest.fn();
    const passthroughMethods = [
      ['eth_getStorageAt', '0x'],
      ['eth_getBalance', '0x1'],
      ['eth_gasPrice', '0x2'],
      ['eth_estimateGas', '0x3'],
    ];

    beforeEach(() => {
      jest.resetAllMocks();

      (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
        send: sendMock,
      }));
    });

    it.each(passthroughMethods)('should passthrough %s to the jsonRpcProvider', async (method, returnValue) => {
      sendMock.mockResolvedValueOnce(returnValue);

      const provider = getProvider();

      // NOTE: params are static since we are only testing the call is
      // forwarded with whatever parameters it's called with. Might not match
      // the actual parameters for a specific method.
      const providerParams = { method, params: [] };
      const result = await provider.request(providerParams);

      expect(sendMock).toBeCalledTimes(1);
      expect(sendMock).toBeCalledWith(providerParams.method, providerParams.params);
      expect(result).toBe(returnValue);
    });
  });

  describe('eth_requestAccounts', () => {
    it('should return the ethAddress if already logged in', async () => {
      const mockUser = {
        zkEvm: {
          ethAddress: '0x123',
        },
      };
      const mockMagicProvider = {};
      (registerZkEvmUser as jest.Mock).mockResolvedValue({
        user: mockUser,
        magicProvider: mockMagicProvider,
      });
      const provider = getProvider();

      const resultOne = await provider.request({ method: 'eth_requestAccounts', params: [] });
      const resultTwo = await provider.request({ method: 'eth_requestAccounts', params: [] });

      expect(resultOne).toEqual([mockUser.zkEvm.ethAddress]);
      expect(resultTwo).toEqual([mockUser.zkEvm.ethAddress]);
      expect(registerZkEvmUser).toBeCalledTimes(1);
    });
  });
});
