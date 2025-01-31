import { identify, trackFlow } from '@imtbl/metrics';
import { BrowserProvider, JsonRpcProvider, toBeHex } from 'ethers';
import AuthManager from '../authManager';
import { ZkEvmProvider, ZkEvmProviderInput } from './zkEvmProvider';
import { sendTransaction } from './sendTransaction';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from './JsonRpcError';
import GuardianClient from '../guardian';
import { RelayerClient } from './relayerClient';
import { Provider, RequestArguments } from './types';
import { PassportEventMap, PassportEvents } from '../types';
import TypedEventEmitter from '../utils/typedEventEmitter';
import { mockUser, mockUserZkEvm, testConfig } from '../test/mocks';
import { signTypedDataV4 } from './signTypedDataV4';
import MagicAdapter from '../magicAdapter';
import { signEjectionTransaction } from './signEjectionTransaction';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  JsonRpcProvider: jest.fn(),
  BrowserProvider: jest.fn(),
}));
jest.mock('@imtbl/metrics');
jest.mock('./relayerClient');
jest.mock('./user');
jest.mock('./sendTransaction');
jest.mock('./signEjectionTransaction');
jest.mock('./signTypedDataV4');

describe('ZkEvmProvider', () => {
  let passportEventEmitter: TypedEventEmitter<PassportEventMap>;
  const config = testConfig;
  const ethSigner = {};
  const authManager = {
    getUserOrLogin: jest.fn().mockResolvedValue(mockUserZkEvm),
    getUser: jest.fn().mockResolvedValue(mockUserZkEvm),
  };
  const magicAdapter = {
    login: jest.fn(),
  } as Partial<MagicAdapter> as MagicAdapter;
  const guardianClient = {
    withConfirmationScreen: jest.fn().mockImplementation(() => (task: () => void) => task()),
  } as unknown as GuardianClient;

  beforeEach(() => {
    passportEventEmitter = new TypedEventEmitter<PassportEventMap>();
    jest.resetAllMocks();
    (BrowserProvider as unknown as jest.Mock).mockImplementation(() => ({
      getSigner: jest.fn().mockImplementation(() => ethSigner),
    }));
    (trackFlow as unknown as jest.Mock).mockImplementation(() => ({
      addEvent: jest.fn(),
      end: jest.fn(),
    }));
    (guardianClient.withConfirmationScreen as jest.Mock)
      .mockImplementation(() => (task: () => void) => task());
  });

  const getProvider = () => {
    const constructorParameters = {
      config,
      authManager: authManager as Partial<AuthManager> as AuthManager,
      passportEventEmitter,
      guardianClient,
      magicAdapter,
    } as Partial<ZkEvmProviderInput>;

    return new ZkEvmProvider(constructorParameters as ZkEvmProviderInput);
  };

  describe('constructor', () => {
    describe('when an application session exists', () => {
      it('initialises the signer', async () => {
        authManager.getUser.mockResolvedValue(mockUserZkEvm);
        getProvider();

        await new Promise(process.nextTick); // https://immutable.atlassian.net/browse/ID-2516

        expect(authManager.getUser).toBeCalledTimes(1);
        expect(magicAdapter.login).toBeCalledTimes(1);
        expect(BrowserProvider).toBeCalledTimes(1);
      });

      describe('and the user has not registered before', () => {
        it('does not call session activity', async () => {
          const onAccountsRequested = jest.fn();
          passportEventEmitter.on(PassportEvents.ACCOUNTS_REQUESTED, onAccountsRequested);
          authManager.getUser.mockResolvedValue(mockUser);
          getProvider();

          await new Promise(process.nextTick); // https://immutable.atlassian.net/browse/ID-2516

          expect(authManager.getUser).toBeCalledTimes(1);
          expect(onAccountsRequested).not.toHaveBeenCalled();
        });
      });
      describe('and the user has registered before', () => {
        it('calls session activity', async () => {
          const onAccountsRequested = jest.fn();
          passportEventEmitter.on(PassportEvents.ACCOUNTS_REQUESTED, onAccountsRequested);
          authManager.getUser.mockResolvedValue(mockUserZkEvm);
          getProvider();

          await new Promise(process.nextTick); // https://immutable.atlassian.net/browse/ID-2516

          expect(authManager.getUser).toBeCalledTimes(1);
          expect(onAccountsRequested).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('when a login occurs outside of the zkEvm provider', () => {
      beforeEach(() => {
        authManager.getUser.mockResolvedValue(null);
      });

      it('initialises the signer', async () => {
        getProvider();
        passportEventEmitter.emit(PassportEvents.LOGGED_IN, mockUserZkEvm);

        await new Promise(process.nextTick); // https://immutable.atlassian.net/browse/ID-2516

        expect(magicAdapter.login).toBeCalledTimes(1);
        expect(BrowserProvider).toBeCalledTimes(1);
      });

      describe('and the user has not registered before', () => {
        it('does not call session activity', async () => {
          const onAccountsRequested = jest.fn();
          passportEventEmitter.on(PassportEvents.ACCOUNTS_REQUESTED, onAccountsRequested);
          getProvider();
          passportEventEmitter.emit(PassportEvents.LOGGED_IN, mockUser);

          await new Promise(process.nextTick); // https://immutable.atlassian.net/browse/ID-2516

          expect(onAccountsRequested).not.toHaveBeenCalled();
        });

        describe('and the user has registered before', () => {
          it('calls session activity', async () => {
            const onAccountsRequested = jest.fn();
            passportEventEmitter.on(PassportEvents.ACCOUNTS_REQUESTED, onAccountsRequested);
            getProvider();
            passportEventEmitter.emit(PassportEvents.LOGGED_IN, mockUserZkEvm);

            await new Promise(process.nextTick); // https://immutable.atlassian.net/browse/ID-2516

            expect(onAccountsRequested).toHaveBeenCalledTimes(1);
          });
        });
      });
    });
  });

  describe('eth_requestAccounts', () => {
    it('should return the ethAddress if already logged in', async () => {
      authManager.getUser.mockResolvedValue(mockUserZkEvm);
      const provider = getProvider();

      const resultOne = await provider.request({ method: 'eth_requestAccounts', params: [] });
      const resultTwo = await provider.request({ method: 'eth_requestAccounts', params: [] });

      expect(resultOne).toEqual([mockUserZkEvm.zkEvm.ethAddress]);
      expect(resultTwo).toEqual([mockUserZkEvm.zkEvm.ethAddress]);
      expect(authManager.getUser).toBeCalledTimes(3);
    });

    it('should emit accountsChanged event and identify user when user logs in', async () => {
      authManager.getUser.mockResolvedValue(null);

      authManager.getUserOrLogin.mockReturnValue(mockUserZkEvm);
      const provider = getProvider();
      const onAccountsChanged = jest.fn();

      provider.on('accountsChanged', onAccountsChanged);

      // #doc eth_request-accounts
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      // #enddoc eth_request-accounts

      expect(accounts).toEqual([mockUserZkEvm.zkEvm.ethAddress]);
      expect(onAccountsChanged).toHaveBeenCalledWith([mockUserZkEvm.zkEvm.ethAddress]);
      expect(identify).toHaveBeenCalledWith({
        passportId: mockUserZkEvm.profile.sub,
      });
    });

    it('should throw an error if the signer initialisation fails', async () => {
      authManager.getUserOrLogin.mockReturnValue(mockUserZkEvm);
      authManager.getUser.mockResolvedValue(mockUserZkEvm);

      (BrowserProvider as unknown as jest.Mock).mockImplementation(() => ({
        getSigner: () => {
          throw new Error('Something went wrong');
        },
      }));
      const provider = getProvider();
      await provider.request({ method: 'eth_requestAccounts' });

      await expect(provider.request({ method: 'eth_sendTransaction' })).rejects.toThrow(
        new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, 'Something went wrong'),
      );
    });

    it('should not reinitialise the ethSigner when it has been set during the constructor', async () => {
      authManager.getUser.mockResolvedValue(mockUserZkEvm);
      const provider = getProvider();

      await new Promise(process.nextTick); // https://immutable.atlassian.net/browse/ID-2516

      expect(magicAdapter.login).toBeCalledTimes(1);
      expect(BrowserProvider).toBeCalledTimes(1);

      await provider.request({ method: 'eth_requestAccounts' });

      // Add a delay so that we can check if the ethSigner is initialised again
      await new Promise(process.nextTick);

      expect(magicAdapter.login).toBeCalledTimes(1);
      expect(BrowserProvider).toBeCalledTimes(1);
    });
  });

  describe('eth_sendTransaction', () => {
    const transaction = {
      from: '0x123',
      to: '0x456',
      value: '1',
    };

    it('should throw an error if the user is not logged in', async () => {
      authManager.getUser.mockResolvedValue(null);

      const provider = getProvider();

      await expect(async () => (
        provider.request({ method: 'eth_sendTransaction', params: [transaction] })
      )).rejects.toThrow(
        new JsonRpcError(ProviderErrorCode.UNAUTHORIZED, 'Unauthorised - call eth_requestAccounts first'),
      );
    });

    it('should open a confirmation screen', async () => {
      authManager.getUserOrLogin.mockReturnValue(mockUserZkEvm);
      authManager.getUser.mockResolvedValue(mockUserZkEvm);

      const provider = getProvider();
      await provider.request({ method: 'eth_requestAccounts' });
      await provider.request({ method: 'eth_sendTransaction', params: [transaction] });

      expect(guardianClient.withConfirmationScreen).toBeCalledTimes(1);
    });

    it('should call sendTransaction with the correct params', async () => {
      const transactionHash = '0x789';
      authManager.getUserOrLogin.mockReturnValue(mockUserZkEvm);
      authManager.getUser.mockResolvedValue(mockUserZkEvm);
      (sendTransaction as jest.Mock).mockResolvedValue(transactionHash);

      const provider = getProvider();
      await provider.request({ method: 'eth_requestAccounts' });
      const result = await provider.request({
        method: 'eth_sendTransaction',
        params: [transaction],
      });

      expect(result).toEqual(transactionHash);
      expect(sendTransaction).toHaveBeenCalledWith({
        params: [transaction],
        guardianClient,
        ethSigner,
        rpcProvider: expect.any(Object),
        relayerClient: expect.any(RelayerClient),
        zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
        flow: expect.any(Object),
      });
    });
  });

  describe('im_signEjectionTransaction', () => {
    const transaction = {
      from: '0x123',
      to: '0x456',
      value: '1',
      nonce: BigInt(5),
      chainId: 1,
    };

    it('should throw an error if the user is not logged in', async () => {
      authManager.getUser.mockResolvedValue(null);

      const provider = getProvider();

      await expect(async () => (
        provider.request({ method: 'im_signEjectionTransaction', params: [transaction] })
      )).rejects.toThrow(
        new JsonRpcError(ProviderErrorCode.UNAUTHORIZED, 'Unauthorised - call eth_requestAccounts first'),
      );
    });

    it('should call im_signEjectionTransaction with the correct params', async () => {
      const signedTransaction = '0x789';
      authManager.getUserOrLogin.mockReturnValue(mockUserZkEvm);
      authManager.getUser.mockResolvedValue(mockUserZkEvm);
      (signEjectionTransaction as jest.Mock).mockResolvedValue(signedTransaction);

      const provider = getProvider();
      await provider.request({ method: 'eth_requestAccounts' });
      const result = await provider.request({
        method: 'im_signEjectionTransaction',
        params: [transaction],
      });

      expect(result).toEqual(signedTransaction);
      expect(signEjectionTransaction).toHaveBeenCalledWith({
        params: [transaction],
        ethSigner,
        zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
        flow: expect.any(Object),
      });
    });
  });

  describe('eth_signTypedData_v4', () => {
    const address = '0xd64b0d2d72bb1b3f18046b8a7fc6c9ee6bccd287';
    const typedDataPayload = '{}';

    it('should throw an error if the user is not logged in', async () => {
      authManager.getUser.mockResolvedValue(null);

      const provider = getProvider();

      await expect(async () => (
        provider.request({ method: 'eth_signTypedData_v4', params: [address, typedDataPayload] })
      )).rejects.toThrow(
        new JsonRpcError(ProviderErrorCode.UNAUTHORIZED, 'Unauthorised - call eth_requestAccounts first'),
      );
    });

    it('should call eth_signTypedData_v4 with the correct params', async () => {
      const signature = '0x123';
      authManager.getUserOrLogin.mockReturnValue(mockUserZkEvm);
      authManager.getUser.mockResolvedValue(mockUserZkEvm);
      (signTypedDataV4 as jest.Mock).mockResolvedValue(signature);

      const provider = getProvider();
      await provider.request({ method: 'eth_requestAccounts' });
      const result = await provider.request({
        method: 'eth_signTypedData_v4',
        params: [address, typedDataPayload],
      });

      expect(result).toEqual(signature);
      expect(signTypedDataV4).toHaveBeenCalledWith({
        method: 'eth_signTypedData_v4',
        params: [address, typedDataPayload],
        guardianClient,
        ethSigner,
        rpcProvider: expect.any(Object),
        relayerClient: expect.any(RelayerClient),
        flow: expect.any(Object),
      });
    });

    it('should open a confirmation screen', async () => {
      authManager.getUserOrLogin.mockReturnValue(mockUserZkEvm);
      authManager.getUser.mockResolvedValue(mockUserZkEvm);
      const provider = getProvider();
      await provider.request({ method: 'eth_requestAccounts' });
      await provider.request({ method: 'eth_signTypedData_v4', params: [address, typedDataPayload] });

      expect(guardianClient.withConfirmationScreen).toBeCalledTimes(1);
    });
  });

  describe('isPassport', () => {
    it('should be set to true', () => {
      authManager.getUser.mockResolvedValue(mockUserZkEvm);

      const provider = getProvider();

      expect(provider.isPassport).toBe(true);
      expect((provider as Provider).isPassport).toBe(true);
    });
  });

  describe('when the user has been logged out', () => {
    const unauthorisedError = new JsonRpcError(ProviderErrorCode.UNAUTHORIZED, 'Unauthorised - call eth_requestAccounts first');

    describe('and eth_sendTransaction is called', () => {
      it('throws an unauthorized error', async () => {
        authManager.getUser.mockResolvedValue(null);
        authManager.getUserOrLogin.mockReturnValue(mockUserZkEvm);

        const provider = getProvider();
        await provider.request({ method: 'eth_requestAccounts' });
        passportEventEmitter.emit(PassportEvents.LOGGED_OUT);

        await expect(provider.request({ method: 'eth_sendTransaction' })).rejects.toThrowError(
          unauthorisedError,
        );
      });
    });

    describe('and eth_signTypedDataV4 is called', () => {
      it('throws an unauthorized error', async () => {
        authManager.getUserOrLogin.mockReturnValue(mockUserZkEvm);
        authManager.getUser.mockResolvedValue(null);

        const provider = getProvider();
        await provider.request({ method: 'eth_requestAccounts' });
        passportEventEmitter.emit(PassportEvents.LOGGED_OUT);

        await expect(provider.request({ method: 'eth_signTypedData_v4' })).rejects.toThrowError(
          unauthorisedError,
        );
      });
    });

    describe('and eth_accounts is called', () => {
      it('returns an empty array', async () => {
        authManager.getUserOrLogin.mockReturnValue(mockUserZkEvm);
        authManager.getUser.mockResolvedValue(null);

        const provider = getProvider();
        await provider.request({ method: 'eth_requestAccounts' });
        passportEventEmitter.emit(PassportEvents.LOGGED_OUT);
        const result = await provider.request({ method: 'eth_accounts' });

        expect(result).toEqual([]);
      });
    });

    it('should emit accountsChanged', async () => {
      authManager.getUserOrLogin.mockReturnValue(mockUserZkEvm);
      authManager.getUser.mockResolvedValue(mockUserZkEvm);

      const provider = getProvider();
      await provider.request({ method: 'eth_requestAccounts' });

      const onAccountsChanged = jest.fn();
      provider.on('accountsChanged', onAccountsChanged);
      passportEventEmitter.emit(PassportEvents.LOGGED_OUT);

      expect(onAccountsChanged).toHaveBeenCalledWith([]);
    });
  });

  describe('eth_chainId', () => {
    const chainId = 13371;
    const getNetworkMock = jest.fn();
    const sendMock = jest.fn();

    beforeEach(() => {
      jest.resetAllMocks();

      (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
        send: sendMock,
        getNetwork: getNetworkMock,
      }));
    });

    it('should call detectNetwork', async () => {
      authManager.getUser.mockResolvedValue(mockUserZkEvm);

      getNetworkMock.mockResolvedValueOnce({ chainId });

      const provider = getProvider();

      const providerParams = { method: 'eth_chainId', params: [] };
      const result = await provider.request(providerParams);

      expect(getNetworkMock).toBeCalledTimes(1);
      expect(sendMock).not.toBeCalled();
      expect(result).toBe(toBeHex(chainId));
    });
  });

  describe('passthrough methods', () => {
    const sendMock = jest.fn();
    type Request = {
      requestArgument: RequestArguments,
      returnValue: any,
    };
    const passthroughMethods: Array<Request> = [
      { requestArgument: { method: 'eth_getStorageAt', params: ['0x123', '0x0', '0x1'] }, returnValue: '0x' },
      { requestArgument: { method: 'eth_getBalance', params: ['0x123', '0x1'] }, returnValue: '0x1' },
      { requestArgument: { method: 'eth_getCode', params: ['0x123', '0x1'] }, returnValue: '0x' },
      { requestArgument: { method: 'eth_gasPrice', params: [] }, returnValue: '0x2' },
      { requestArgument: { method: 'eth_estimateGas', params: [{ to: '0x1', value: 0 }, '0x1'] }, returnValue: '0x3' },
      { requestArgument: { method: 'eth_call', params: [{ to: '0x1', value: 0 }, '0x1'] }, returnValue: '0x' },
      { requestArgument: { method: 'eth_blockNumber', params: [] }, returnValue: '0x4' },
      {
        requestArgument: { method: 'eth_getBlockByHash', params: ['0x1', false] },
        returnValue: {
          baseFeePerGas: '0x7',
          difficulty: '0x0',
          extraData: '0x496c6c756d696e61746520446d6f63726174697a6520447374726962757465',
          gasLimit: '0x1c9c380',
          gasUsed: '0x8c6cee',
          hash: '0xec484a535316996705454b53ce5a1f4af0f64e399c2855ec05753df2d0e1a83b',
          logsBloom: '0x00000244841000100041010000100000011148010108100000000008000002100040010020840000010000010008000000801820002c00612094290801200800100c20000c0202080080000804000002000009c0020110002c0200020000002004000800064000000a9400060000090042045400200000101440201000018102501082040000800020100000008580042100040001101000000ca4020002000202088c09000000201004188100080000200091400000000080c0500c0025402004400002080100000000442080200044000001000000000150000d020100a0000014002000420100000840000400202080040000000000028024800000400008',
          miner: '0x1e2cd78882b12d3954a049fd82ffd691565dc0a5',
          mixHash: '0x6e864fb8be5c362d52a206823a6bf64d0310e97f2f8904e51d8419d569349f6c',
          nonce: '0x0000000000000000',
          number: '0x3a33ad',
          parentHash: '0xdb557161e52f5becee1483e3bbd5714baca9a940a11433d101546ac77977beff',
          receiptsRoot: '0x79c1493bb19bf5454d6ccff5c277df7f8c045702099a5a5a84a8d11eaa919fb3',
          sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
          size: '0xc0cd',
          stateRoot: '0x8125b0d797b82408652a90255e7f7059314552a00b9587890e39cc3fed83f7f3',
          timestamp: '0x64a258e8',
          totalDifficulty: '0x3c656d23029ab0',
          transactions: [
            '0x415a3c9e9dceb2974b74ddd739097f838e200e103370f688314a5f01c15e769c',
          ],
          transactionsRoot: '0xa87c27d6395631c8c779f9070b319268740355579f3b11d9454c2834b5943951',
          uncles: [],
          withdrawals: [
            {
              index: '0xc8f201',
              validatorIndex: '0x3a6',
              address: '0xe276bc378a527a8792b353cdca5b5e53263dfb9e',
              amount: '0xf00',
            },
          ],
          withdrawalsRoot: '0x9b35c0a8f97d4a06af667bd48ae1e7ca405218326ec384c443b6cb7960f88d5d',
        },
      },
      {
        requestArgument: { method: 'eth_getBlockByNumber', params: ['earliest', false] },
        returnValue: {
          baseFeePerGas: '0x7',
          difficulty: '0x0',
          extraData: '0x496c6c756d696e61746520446d6f63726174697a6520447374726962757465',
          gasLimit: '0x1c9c380',
          gasUsed: '0x8c6cee',
          hash: '0xec484a535316996705454b53ce5a1f4af0f64e399c2855ec05753df2d0e1a83b',
          logsBloom: '0x00000244841000100041010000100000011148010108100000000008000002100040010020840000010000010008000000801820002c00612094290801200800100c20000c0202080080000804000002000009c0020110002c0200020000002004000800064000000a9400060000090042045400200000101440201000018102501082040000800020100000008580042100040001101000000ca4020002000202088c09000000201004188100080000200091400000000080c0500c0025402004400002080100000000442080200044000001000000000150000d020100a0000014002000420100000840000400202080040000000000028024800000400008',
          miner: '0x1e2cd78882b12d3954a049fd82ffd691565dc0a5',
          mixHash: '0x6e864fb8be5c362d52a206823a6bf64d0310e97f2f8904e51d8419d569349f6c',
          nonce: '0x0000000000000000',
          number: '0x3a33ad',
          parentHash: '0xdb557161e52f5becee1483e3bbd5714baca9a940a11433d101546ac77977beff',
          receiptsRoot: '0x79c1493bb19bf5454d6ccff5c277df7f8c045702099a5a5a84a8d11eaa919fb3',
          sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
          size: '0xc0cd',
          stateRoot: '0x8125b0d797b82408652a90255e7f7059314552a00b9587890e39cc3fed83f7f3',
          timestamp: '0x64a258e8',
          totalDifficulty: '0x3c656d23029ab0',
          transactions: [
            '0x415a3c9e9dceb2974b74ddd739097f838e200e103370f688314a5f01c15e769c',
          ],
          transactionsRoot: '0xa87c27d6395631c8c779f9070b319268740355579f3b11d9454c2834b5943951',
          uncles: [],
          withdrawals: [
            {
              index: '0xc8f201',
              validatorIndex: '0x3a6',
              address: '0xe276bc378a527a8792b353cdca5b5e53263dfb9e',
              amount: '0xf00',
            },
          ],
          withdrawalsRoot: '0x9b35c0a8f97d4a06af667bd48ae1e7ca405218326ec384c443b6cb7960f88d5d',
        },
      },
      {
        requestArgument: { method: 'eth_getTransactionByHash', params: ['0x1'] },
        returnValue: {
          blockHash: '0xec484a535316996705454b53ce5a1f4af0f64e399c2855ec05753df2d0e1a83b',
          blockNumber: '0x3a33ad',
          from: '0x781ed6f2834d692fd75002c7f2f406c5ed1c6996',
          gas: '0xb513',
          gasPrice: '0x9502f907',
          maxFeePerGas: '0x9502f90e',
          maxPriorityFeePerGas: '0x9502f900',
          hash: '0x415a3c9e9dceb2974b74ddd739097f838e200e103370f688314a5f01c15e769c',
          input: '0x095ea7b3000000000000000000000000a81373e6070bc2d9d25216dbe52a979c850e261f000000000000000000000000000000000000000000000005f40bfa403363a8a3',
          nonce: '0x28',
          to: '0x922a99b817f501af4c3dfc1ce359d7ec9dbdf8a3',
          transactionIndex: '0x0',
          value: '0x0',
          type: '0x2',
          accessList: [],
          chainId: '0xaa36a7',
          v: '0x0',
          r: '0xdd4c1526e293d8139500d84104cd28498d3570603c9f0698e47e7406a552b388',
          s: '0x1a3f1c65aa1ea66ef595422f7dd4c43a4800156225f02ffc22272093e41b780',
        },
      },
      {
        requestArgument: { method: 'eth_getTransactionReceipt', params: ['0x1'] },
        returnValue: {
          blockHash: '0xec484a535316996705454b53ce5a1f4af0f64e399c2855ec05753df2d0e1a83b',
          blockNumber: '0x3a33ad',
          from: '0x781ed6f2834d692fd75002c7f2f406c5ed1c6996',
          gas: '0xb513',
          gasPrice: '0x9502f907',
          maxFeePerGas: '0x9502f90e',
          maxPriorityFeePerGas: '0x9502f900',
          hash: '0x415a3c9e9dceb2974b74ddd739097f838e200e103370f688314a5f01c15e769c',
          input: '0x095ea7b3000000000000000000000000a81373e6070bc2d9d25216dbe52a979c850e261f000000000000000000000000000000000000000000000005f40bfa403363a8a3',
          nonce: '0x28',
          to: '0x922a99b817f501af4c3dfc1ce359d7ec9dbdf8a3',
          transactionIndex: '0x0',
          value: '0x0',
          type: '0x2',
          accessList: [],
          chainId: '0xaa36a7',
          v: '0x0',
          r: '0xdd4c1526e293d8139500d84104cd28498d3570603c9f0698e47e7406a552b388',
          s: '0x1a3f1c65aa1ea66ef595422f7dd4c43a4800156225f02ffc22272093e41b780',
        },
      },
      { requestArgument: { method: 'eth_getTransactionCount', params: ['0x1', '0x1'] }, returnValue: '0x6' },
    ];

    beforeEach(() => {
      jest.resetAllMocks();

      (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => ({
        send: sendMock,
      }));
    });

    it.each(passthroughMethods)('should passthrough %s to the rpcProvider', async ({ requestArgument, returnValue }) => {
      authManager.getUser.mockResolvedValue(mockUserZkEvm);

      sendMock.mockResolvedValueOnce(returnValue);

      const provider = getProvider();

      // NOTE: params are static since we are only testing the call is
      // forwarded with whatever parameters it's called with. Might not match
      // the actual parameters for a specific method.
      const result = await provider.request(requestArgument);

      expect(sendMock).toBeCalledTimes(1);
      expect(sendMock).toBeCalledWith(requestArgument.method, requestArgument.params);
      expect(result).toBe(returnValue);
    });

    describe('eth_getBalance', () => {
      it('defaults the `blockNumber` argument to `latest` if not provided', async () => {
        authManager.getUser.mockResolvedValue(mockUserZkEvm);

        const provider = getProvider();
        await provider.request({ method: 'eth_getBalance', params: ['0x1'] });

        expect(sendMock).toBeCalledWith('eth_getBalance', ['0x1', 'latest']);
      });
    });

    describe('eth_getCode', () => {
      it('defaults the `blockNumber` argument to `latest` if not provided', async () => {
        authManager.getUser.mockResolvedValue(mockUserZkEvm);

        const provider = getProvider();
        await provider.request({ method: 'eth_getCode', params: ['0x1'] });

        expect(sendMock).toBeCalledWith('eth_getCode', ['0x1', 'latest']);
      });
    });

    describe('eth_getTransactionCount', () => {
      it('defaults the `blockNumber` argument to `latest` if not provided', async () => {
        authManager.getUser.mockResolvedValue(mockUserZkEvm);

        const provider = getProvider();
        await provider.request({ method: 'eth_getTransactionCount', params: ['0x1'] });

        expect(sendMock).toBeCalledWith('eth_getTransactionCount', ['0x1', 'latest']);
      });
    });

    describe('eth_getStorageAt', () => {
      it('defaults the `blockNumber` argument to `latest` if not provided', async () => {
        authManager.getUser.mockResolvedValue(mockUserZkEvm);

        const provider = getProvider();
        await provider.request({ method: 'eth_getStorageAt', params: ['0x1', '0x2'] });

        expect(sendMock).toBeCalledWith('eth_getStorageAt', ['0x1', '0x2', 'latest']);
      });
    });

    describe('eth_call', () => {
      it('defaults the `blockNumber` argument to `latest` if not provided', async () => {
        authManager.getUser.mockResolvedValue(mockUserZkEvm);

        const provider = getProvider();
        await provider.request({ method: 'eth_call', params: [{ to: '0x1' }] });

        expect(sendMock).toBeCalledWith('eth_call', [{ to: '0x1' }, 'latest']);
      });
    });

    describe('eth_estimateGas', () => {
      it('defaults the `blockNumber` argument to `latest` if not provided', async () => {
        authManager.getUser.mockResolvedValue(mockUserZkEvm);

        const provider = getProvider();
        await provider.request({ method: 'eth_estimateGas', params: [{ to: '0x1' }] });

        expect(sendMock).toBeCalledWith('eth_estimateGas', [{ to: '0x1' }, 'latest']);
      });
    });
  });
});
