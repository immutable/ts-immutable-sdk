import { StaticJsonRpcProvider, TransactionRequest } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { Flow } from '@imtbl/metrics';
import { BigNumber } from 'ethers';
import {
  getEip155ChainId,
  getNonce,
  getSignedMetaTransactions,
} from './walletHelpers';
import { sendTransaction } from './sendTransaction';
import { chainId, chainIdEip155, mockUserZkEvm } from '../test/mocks';
import { RelayerClient } from './relayerClient';
import { retryWithDelay } from '../network/retry';
import { FeeOption, RelayerTransaction, RelayerTransactionStatus } from './types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import GuardianClient from '../guardian';
import * as walletHelpers from './walletHelpers';

jest.mock('./walletHelpers');
jest.mock('../network/retry');

describe('sendTransaction', () => {
  const signedTransactions = 'signedTransactions123';
  const relayerTransactionId = 'relayerTransactionId123';
  const transactionHash = 'transactionHash123';

  const nonce = '5';

  const transactionRequest: TransactionRequest = {
    to: mockUserZkEvm.zkEvm.ethAddress,
    data: '0x456',
    value: '0x00',
  };
  const rpcProvider = {
    detectNetwork: jest.fn(),
  };
  const relayerClient = {
    imGetFeeOptions: jest.fn(),
    ethSendTransaction: jest.fn(),
    imGetTransactionByHash: jest.fn(),
  };
  const guardianClient = {
    validateEVMTransaction: jest.fn(),
  };
  const ethSigner = {
    getAddress: jest.fn(),
  } as Partial<Signer> as Signer;
  const flow = {
    addEvent: jest.fn(),
  };

  const imxFeeOption: FeeOption = {
    tokenPrice: '0x1',
    tokenSymbol: 'IMX',
    tokenDecimals: 18,
    tokenAddress: '0x1337',
    recipientAddress: '0x7331',
  };

  beforeEach(() => {
    jest.resetAllMocks();
    relayerClient.imGetFeeOptions.mockResolvedValue([imxFeeOption]);
    (getNonce as jest.Mock).mockResolvedValueOnce(nonce);
    (getEip155ChainId as jest.Mock).mockReturnValue(chainIdEip155);
    (getSignedMetaTransactions as jest.Mock).mockResolvedValueOnce(
      signedTransactions,
    );
    relayerClient.ethSendTransaction.mockResolvedValue(relayerTransactionId);
    rpcProvider.detectNetwork.mockResolvedValue({ chainId });
    guardianClient.validateEVMTransaction.mockResolvedValue(undefined);
  });

  describe('successful imGetTransactionByHash retrievals', () => {
    beforeEach(() => {
      (retryWithDelay as jest.Mock).mockResolvedValue({
        status: RelayerTransactionStatus.SUCCESSFUL,
        hash: transactionHash,
      } as RelayerTransaction);
    });

    it('calls relayerClient.imGetFeeOptions with the correct arguments', async () => {
      (walletHelpers.encodeMessageSubDigest as jest.Mock).mockReturnValue('encodedMessageSubDigest123');

      await sendTransaction({
        params: [transactionRequest],
        ethSigner,
        rpcProvider: rpcProvider as unknown as StaticJsonRpcProvider,
        relayerClient: relayerClient as unknown as RelayerClient,
        zkevmAddress: mockUserZkEvm.zkEvm.ethAddress,
        guardianClient: guardianClient as unknown as GuardianClient,
        flow: flow as unknown as Flow,
      });

      expect(relayerClient.imGetFeeOptions).toHaveBeenCalledWith(
        mockUserZkEvm.zkEvm.ethAddress,
        'encodedMessageSubDigest123',
      );
    });

    it('calls relayerClient.ethSendTransaction with the correct arguments', async () => {
      const result = await sendTransaction({
        params: [transactionRequest],
        ethSigner,
        rpcProvider: rpcProvider as unknown as StaticJsonRpcProvider,
        relayerClient: relayerClient as unknown as RelayerClient,
        zkevmAddress: mockUserZkEvm.zkEvm.ethAddress,
        guardianClient: guardianClient as unknown as GuardianClient,
        flow: flow as unknown as Flow,
      });

      expect(result).toEqual(transactionHash);
      expect(relayerClient.ethSendTransaction).toHaveBeenCalledWith(
        mockUserZkEvm.zkEvm.ethAddress,
        signedTransactions,
      );
    });

    it('calls relayerClient.ethSendTransaction with sponsored meta transaction', async () => {
      const mockImxFeeOption = {
        tokenPrice: '0',
        tokenSymbol: 'IMX',
        tokenDecimals: 18,
        tokenAddress: '0x1337',
        recipientAddress: '0x7331',
      };

      relayerClient.imGetFeeOptions.mockResolvedValue([mockImxFeeOption]);

      const result = await sendTransaction({
        params: [transactionRequest],
        ethSigner,
        rpcProvider: rpcProvider as unknown as StaticJsonRpcProvider,
        relayerClient: relayerClient as unknown as RelayerClient,
        zkevmAddress: mockUserZkEvm.zkEvm.ethAddress,
        guardianClient: guardianClient as unknown as GuardianClient,
        flow: flow as unknown as Flow,
      });

      expect(result).toEqual(transactionHash);
      expect(guardianClient.validateEVMTransaction).toHaveBeenCalledWith(
        {
          chainId: chainIdEip155,
          nonce,
          metaTransactions: [
            {
              data: transactionRequest.data,
              revertOnError: true,
              to: mockUserZkEvm.zkEvm.ethAddress,
              value: '0x00',
              nonce,
            },
          ],
        },
      );

      expect(relayerClient.ethSendTransaction).toHaveBeenCalledWith(
        mockUserZkEvm.zkEvm.ethAddress,
        signedTransactions,
      );
    });

    it('calls guardian.evaluateTransaction with the correct arguments', async () => {
      (getEip155ChainId as jest.Mock).mockReturnValue(`eip155:${chainId}`);

      const result = await sendTransaction({
        params: [transactionRequest],
        ethSigner,
        rpcProvider: rpcProvider as unknown as StaticJsonRpcProvider,
        relayerClient: relayerClient as unknown as RelayerClient,
        zkevmAddress: mockUserZkEvm.zkEvm.ethAddress,
        guardianClient: guardianClient as unknown as GuardianClient,
        flow: flow as unknown as Flow,
      });

      expect(result).toEqual(transactionHash);
      expect(getEip155ChainId).toHaveBeenCalledWith(chainId);
      expect(guardianClient.validateEVMTransaction).toHaveBeenCalledWith(
        {
          chainId: chainIdEip155,
          nonce,
          metaTransactions: [
            {
              data: transactionRequest.data,
              revertOnError: true,
              to: mockUserZkEvm.zkEvm.ethAddress,
              value: '0x00',
              nonce,
            },
            {
              revertOnError: true,
              to: imxFeeOption.recipientAddress,
              value: BigNumber.from(imxFeeOption.tokenPrice),
              nonce,
            },
          ],
        },
      );
      expect(relayerClient.ethSendTransaction).toHaveBeenCalledWith(
        mockUserZkEvm.zkEvm.ethAddress,
        signedTransactions,
      );
    });
  });

  describe('when the relayer returns a transaction with a "FAILED" status', () => {
    beforeEach(() => {
      (retryWithDelay as jest.Mock).mockResolvedValue({
        status: RelayerTransactionStatus.FAILED,
        statusMessage: 'Unable to complete transaction',
      } as RelayerTransaction);
    });

    it('returns and surfaces an error', async () => {
      await expect(
        sendTransaction({
          params: [transactionRequest],
          ethSigner,
          rpcProvider: rpcProvider as unknown as StaticJsonRpcProvider,
          relayerClient: relayerClient as unknown as RelayerClient,
          zkevmAddress: mockUserZkEvm.zkEvm.ethAddress,
          guardianClient: guardianClient as unknown as GuardianClient,
          flow: flow as unknown as Flow,
        }),
      ).rejects.toThrow(
        new JsonRpcError(
          RpcErrorCode.INTERNAL_ERROR,
          'Transaction failed to submit with status FAILED. Error message: Unable to complete transaction',
        ),
      );
    });
  });

  describe('when the relayer returns a transaction with a "CANCELLED" status', () => {
    beforeEach(() => {
      (retryWithDelay as jest.Mock).mockResolvedValue({
        status: RelayerTransactionStatus.CANCELLED,
        statusMessage: 'Transaction cancelled',
      } as RelayerTransaction);
    });

    it('returns and surfaces an error', async () => {
      await expect(
        sendTransaction({
          params: [transactionRequest],
          ethSigner,
          rpcProvider: rpcProvider as unknown as StaticJsonRpcProvider,
          relayerClient: relayerClient as unknown as RelayerClient,
          zkevmAddress: mockUserZkEvm.zkEvm.ethAddress,
          guardianClient: guardianClient as unknown as GuardianClient,
          flow: flow as unknown as Flow,
        }),
      ).rejects.toThrow(
        new JsonRpcError(
          RpcErrorCode.INTERNAL_ERROR,
          'Transaction failed to submit with status CANCELLED. Error message: Transaction cancelled',
        ),
      );
    });
  });
});
