import { Flow } from '@imtbl/metrics';
import { JsonRpcProvider } from 'ethers';
import { RelayerClient } from './relayerClient';
import GuardianClient from '../guardian';
import { FeeOption, MetaTransaction, RelayerTransactionStatus } from './types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { pollRelayerTransaction, prepareAndSignEjectionTransaction, prepareAndSignTransaction } from './transactionHelpers';
import * as walletHelpers from './walletHelpers';
import { retryWithDelay } from '../network/retry';
import MagicTeeAdapter from '../magic/magicTeeAdapter';

jest.mock('./walletHelpers', () => ({
  __esModule: true,
  ...jest.requireActual('./walletHelpers'),
}));
jest.mock('../network/retry');

describe('transactionHelpers', () => {
  const flow = { addEvent: jest.fn() } as unknown as Flow;

  const magicTeeAdapter = {
    personalSign: jest.fn(),
    createWallet: jest.fn(),
  } as unknown as MagicTeeAdapter;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('pollRelayerTransaction', () => {
    const relayerId = 'relayerId123';
    const transactionHash = 'transactionHash123';
    const relayerClient = {
      imGetFeeOptions: jest.fn(),
      ethSendTransaction: jest.fn(),
      imGetTransactionByHash: jest.fn(),
    } as unknown as RelayerClient;

    it('returns the transaction when successful', async () => {
      const successfulTx = { status: RelayerTransactionStatus.SUCCESSFUL, hash: transactionHash };
      (retryWithDelay as jest.Mock).mockResolvedValue(successfulTx);

      const result = await pollRelayerTransaction(relayerClient, relayerId, flow);

      expect(result).toEqual(successfulTx);
      expect(flow.addEvent).toHaveBeenCalledWith('endRetrieveRelayerTransaction');
    });

    it('throws an error for failed transactions', async () => {
      const failedTx = { status: RelayerTransactionStatus.FAILED, statusMessage: 'Transaction failed' };
      (retryWithDelay as jest.Mock).mockResolvedValue(failedTx);

      await expect(pollRelayerTransaction(relayerClient, relayerId, flow))
        .rejects.toThrow(new JsonRpcError(
          RpcErrorCode.RPC_SERVER_ERROR,
          'Transaction failed to submit with status FAILED. Error message: Transaction failed',
        ));
    });

    it('throws an error for cancelled transactions', async () => {
      const cancelledTx = { status: RelayerTransactionStatus.CANCELLED, statusMessage: 'Transaction cancelled' };
      (retryWithDelay as jest.Mock).mockResolvedValue(cancelledTx);

      await expect(pollRelayerTransaction(relayerClient, relayerId, flow))
        .rejects.toThrow(new JsonRpcError(
          RpcErrorCode.RPC_SERVER_ERROR,
          'Transaction failed to submit with status CANCELLED. Error message: Transaction cancelled',
        ));
    });
  });

  describe('prepareAndSignTransaction', () => {
    const chainId = 123n;
    const nonce = BigInt(5);
    const zkEvmAddresses = {
      ethAddress: '0x1234567890123456789012345678901234567890',
      userAdminAddress: '0x4567890123456789012345678901234567890123',
    };
    const transactionRequest = {
      to: '0x1234567890123456789012345678901234567890',
      data: '0x456',
      value: '0x00',
    };

    const metaTransactions: MetaTransaction[] = [
      {
        to: transactionRequest.to,
        data: transactionRequest.data,
        nonce,
        value: transactionRequest.value,
        revertOnError: true,
      },
    ];

    const signedTransactions = 'signedTransactions123';
    const relayerId = 'relayerId123';

    const imxFeeOption: FeeOption = {
      tokenPrice: '0x1',
      tokenSymbol: 'IMX',
      tokenDecimals: 18,
      tokenAddress: '0x1337',
      recipientAddress: '0x7331',
    };

    const rpcProvider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId }),
    } as unknown as JsonRpcProvider;

    const relayerClient = {
      imGetFeeOptions: jest.fn().mockResolvedValue([imxFeeOption]),
      ethSendTransaction: jest.fn().mockResolvedValue(relayerId),
    } as unknown as RelayerClient;

    const guardianClient = {
      validateEVMTransaction: jest.fn().mockResolvedValue(undefined),
    } as unknown as GuardianClient;

    beforeEach(() => {
      jest.resetAllMocks();
      jest.spyOn(walletHelpers, 'signMetaTransactions').mockResolvedValue(signedTransactions);
      jest.spyOn(walletHelpers, 'getNonce').mockResolvedValue(nonce);
      jest.spyOn(walletHelpers, 'getNormalisedTransactions').mockReturnValue([
        {
          delegateCall: false,
          revertOnError: true,
          gasLimit: BigInt(0),
          target: metaTransactions[0].to || '0x0000000000000000000000000000000000000000',
          value: BigInt(metaTransactions[0].value || 0),
          data: metaTransactions[0].data || '0x',
        },
      ]);
      jest.spyOn(walletHelpers, 'encodedTransactions').mockReturnValue('encodedTransactions123');
      (rpcProvider.getNetwork as jest.Mock).mockResolvedValue({ chainId });
      jest.spyOn(relayerClient, 'imGetFeeOptions').mockResolvedValue([imxFeeOption]);
      jest.spyOn(relayerClient, 'ethSendTransaction').mockResolvedValue(relayerId);
      jest.spyOn(guardianClient, 'validateEVMTransaction').mockResolvedValue(undefined);
    });

    it('prepares and signs transaction correctly', async () => {
      const result = await prepareAndSignTransaction({
        transactionRequest,
        magicTeeAdapter,
        rpcProvider,
        guardianClient,
        relayerClient,
        zkEvmAddresses,
        flow,
      });

      expect(result).toEqual({
        signedTransactions,
        relayerId,
        nonce,
      });

      expect(rpcProvider.getNetwork).toHaveBeenCalled();
      expect(guardianClient.validateEVMTransaction).toHaveBeenCalled();
      expect(walletHelpers.signMetaTransactions).toHaveBeenCalled();
      expect(relayerClient.ethSendTransaction).toHaveBeenCalledWith(zkEvmAddresses.ethAddress, signedTransactions);
      expect(flow.addEvent).toHaveBeenCalledWith('endDetectNetwork');
      expect(flow.addEvent).toHaveBeenCalledWith('endBuildMetaTransactions');
      expect(flow.addEvent).toHaveBeenCalledWith('endValidateEVMTransaction');
      expect(flow.addEvent).toHaveBeenCalledWith('endGetSignedMetaTransactions');
      expect(flow.addEvent).toHaveBeenCalledWith('endRelayerSendTransaction');
    });

    it('handles sponsored transactions correctly', async () => {
      const sponsoredFeeOption = { ...imxFeeOption, tokenPrice: '0' };
      (relayerClient.imGetFeeOptions as jest.Mock).mockResolvedValue([sponsoredFeeOption]);

      await prepareAndSignTransaction({
        transactionRequest,
        magicTeeAdapter,
        rpcProvider,
        guardianClient,
        relayerClient,
        zkEvmAddresses,
        flow,
      });

      expect(guardianClient.validateEVMTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          metaTransactions: expect.arrayContaining([
            expect.objectContaining({
              data: transactionRequest.data,
              revertOnError: true,
              to: transactionRequest.to,
              value: '0x00',
              nonce: expect.any(BigInt),
            }),
          ]),
        }),
      );
    });

    it('handles non-sponsored transactions correctly', async () => {
      const nonSponsoredFeeOption: FeeOption = {
        tokenPrice: '0x1', // Non-zero value in hex
        tokenSymbol: 'IMX',
        tokenDecimals: 18,
        tokenAddress: '0x1337',
        recipientAddress: '0x7331',
      };
      (relayerClient.imGetFeeOptions as jest.Mock).mockResolvedValue([nonSponsoredFeeOption]);

      await prepareAndSignTransaction({
        transactionRequest,
        magicTeeAdapter,
        rpcProvider,
        guardianClient,
        relayerClient,
        zkEvmAddresses,
        flow,
      });

      expect(guardianClient.validateEVMTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          metaTransactions: expect.arrayContaining([
            expect.objectContaining({
              data: transactionRequest.data,
              revertOnError: true,
              to: transactionRequest.to,
              value: '0x00',
              nonce: expect.any(BigInt),
            }),
            expect.objectContaining({
              to: '0x7331',
              value: expect.any(BigInt),
              revertOnError: true,
              nonce: expect.any(BigInt),
            }),
          ]),
        }),
      );

      expect(walletHelpers.signMetaTransactions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            data: transactionRequest.data,
            revertOnError: true,
            to: transactionRequest.to,
            value: '0x00',
            nonce: expect.any(BigInt),
          }),
          expect.objectContaining({
            to: '0x7331',
            value: expect.any(BigInt),
            revertOnError: true,
            nonce: expect.any(BigInt),
          }),
        ]),
        expect.any(BigInt),
        expect.any(BigInt),
        zkEvmAddresses.ethAddress,
        magicTeeAdapter,
      );
    });

    it('signs the transaction when the nonce is zero', async () => {
      jest.spyOn(walletHelpers, 'getNonce').mockResolvedValue(0n);

      const result = await prepareAndSignTransaction({
        transactionRequest,
        magicTeeAdapter,
        rpcProvider,
        guardianClient,
        relayerClient,
        zkEvmAddresses,
        flow,
      });

      expect(result).toEqual({
        signedTransactions,
        relayerId,
        nonce: 0n,
      });
    });

    it('throws an error when validateEVMTransaction fails', async () => {
      (guardianClient.validateEVMTransaction as jest.Mock).mockRejectedValue(new Error('Validation failed'));

      await expect(prepareAndSignTransaction({
        transactionRequest,
        magicTeeAdapter,
        rpcProvider,
        guardianClient,
        relayerClient,
        zkEvmAddresses,
        flow,
      })).rejects.toThrow('Validation failed');

      expect(guardianClient.validateEVMTransaction).toHaveBeenCalled();
      expect(walletHelpers.signMetaTransactions).toHaveBeenCalled(); // This will be called due to parallelization
      expect(relayerClient.ethSendTransaction).not.toHaveBeenCalled();
    });

    it('throws an error when signMetaTransactions fails', async () => {
      (walletHelpers.signMetaTransactions as jest.Mock).mockRejectedValue(new Error('Signing failed'));

      await expect(prepareAndSignTransaction({
        transactionRequest,
        magicTeeAdapter,
        rpcProvider,
        guardianClient,
        relayerClient,
        zkEvmAddresses,
        flow,
      })).rejects.toThrow('Signing failed');
    });

    it('throws an error when ethSendTransaction fails', async () => {
      (relayerClient.ethSendTransaction as jest.Mock).mockRejectedValue(new Error('Transaction send failed'));

      await expect(prepareAndSignTransaction({
        transactionRequest,
        magicTeeAdapter,
        rpcProvider,
        guardianClient,
        relayerClient,
        zkEvmAddresses,
        flow,
      })).rejects.toThrow('Transaction send failed');
    });

    it('throws an error when imGetFeeOptions returns undefined', async () => {
      (relayerClient.imGetFeeOptions as jest.Mock).mockResolvedValue(undefined);

      await expect(prepareAndSignTransaction({
        transactionRequest,
        ethSigner,
        rpcProvider,
        guardianClient,
        relayerClient,
        zkEvmAddress,
        flow,
      })).rejects.toThrow('Invalid fee options received from relayer');
    });

    it('throws an error when imGetFeeOptions returns null', async () => {
      (relayerClient.imGetFeeOptions as jest.Mock).mockResolvedValue(null);

      await expect(prepareAndSignTransaction({
        transactionRequest,
        ethSigner,
        rpcProvider,
        guardianClient,
        relayerClient,
        zkEvmAddress,
        flow,
      })).rejects.toThrow('Invalid fee options received from relayer');
    });

    it('throws an error when imGetFeeOptions returns a non-array', async () => {
      (relayerClient.imGetFeeOptions as jest.Mock).mockResolvedValue({ invalid: 'response' });

      await expect(prepareAndSignTransaction({
        transactionRequest,
        ethSigner,
        rpcProvider,
        guardianClient,
        relayerClient,
        zkEvmAddress,
        flow,
      })).rejects.toThrow('Invalid fee options received from relayer');
    });
  });

  describe('prepareAndSignEjectionTransaction', () => {
    const chainId = 123;

    const transactionRequest = {
      to: '0x1234567890123456789012345678901234567890',
      data: '0x456',
      value: '0x00',
      chainId,
    };

    const zkEvmAddresses = {
      ethAddress: '0x1234567890123456789012345678901234567890',
      userAdminAddress: '0x4567890123456789012345678901234567890123',
    };
    const signedTransactions = 'signedTransactions123';

    beforeEach(() => {
      jest.resetAllMocks();
      jest.spyOn(walletHelpers, 'signMetaTransactions').mockResolvedValue(signedTransactions);
    });

    describe('when the nonce is 0', () => {
      it('prepares and signs transaction correctly', async () => {
        const result = await prepareAndSignEjectionTransaction({
          transactionRequest: {
            ...transactionRequest,
            nonce: 0,
          },
          magicTeeAdapter,
          zkEvmAddresses,
          flow,
        });

        expect(result).toEqual({
          chainId: 'eip155:123',
          data: signedTransactions,
          to: zkEvmAddresses.ethAddress,
        });
      });
    });
  });
});
