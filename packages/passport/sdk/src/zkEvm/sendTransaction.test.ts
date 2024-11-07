import { Flow } from '@imtbl/metrics';
import { sendTransaction } from './sendTransaction';
import { mockUserZkEvm } from '../test/mocks';
import { RelayerClient } from './relayerClient';
import GuardianClient from '../guardian';
import * as transactionHelpers from './transactionHelpers';
import { Signer, TransactionRequest } from 'ethers';
import { JsonRpcProvider } from 'ethers';

jest.mock('./transactionHelpers');
jest.mock('../network/retry');

describe('sendTransaction', () => {
  const signedTransactions = 'signedTransactions123';
  const relayerTransactionId = 'relayerTransactionId123';
  const transactionHash = 'transactionHash123';

  const nonce = BigInt(5);

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

  beforeEach(() => {
    jest.resetAllMocks();
    (transactionHelpers.prepareAndSignTransaction as jest.Mock).mockResolvedValue({
      signedTransactions,
      relayerId: relayerTransactionId,
      nonce,
    });
    (transactionHelpers.pollRelayerTransaction as jest.Mock).mockResolvedValue({
      hash: transactionHash,
    });
  });

  it('calls prepareAndSignTransaction with the correct arguments', async () => {
    await sendTransaction({
      params: [transactionRequest],
      ethSigner,
      rpcProvider: rpcProvider as unknown as JsonRpcProvider,
      relayerClient: relayerClient as unknown as RelayerClient,
      zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
      guardianClient: guardianClient as unknown as GuardianClient,
      flow: flow as unknown as Flow,
    });

    expect(transactionHelpers.prepareAndSignTransaction).toHaveBeenCalledWith({
      transactionRequest,
      ethSigner,
      rpcProvider: rpcProvider as unknown as JsonRpcProvider,
      relayerClient: relayerClient as unknown as RelayerClient,
      guardianClient: guardianClient as unknown as GuardianClient,
      zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
      flow: flow as unknown as Flow,
    });
  });

  it('calls pollRelayerTransaction with the correct arguments', async () => {
    await sendTransaction({
      params: [transactionRequest],
      ethSigner,
      rpcProvider: rpcProvider as unknown as JsonRpcProvider,
      relayerClient: relayerClient as unknown as RelayerClient,
      zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
      guardianClient: guardianClient as unknown as GuardianClient,
      flow: flow as unknown as Flow,
    });

    expect(transactionHelpers.pollRelayerTransaction).toHaveBeenCalledWith(
      relayerClient as unknown as RelayerClient,
      relayerTransactionId,
      flow as unknown as Flow,
    );
  });

  it('returns the transaction hash', async () => {
    const result = await sendTransaction({
      params: [transactionRequest],
      ethSigner,
      rpcProvider: rpcProvider as unknown as JsonRpcProvider,
      relayerClient: relayerClient as unknown as RelayerClient,
      zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
      guardianClient: guardianClient as unknown as GuardianClient,
      flow: flow as unknown as Flow,
    });

    expect(result).toEqual(transactionHash);
  });

  it('throws an error if pollRelayerTransaction fails', async () => {
    const error = new Error('Transaction failed');
    (transactionHelpers.pollRelayerTransaction as jest.Mock).mockRejectedValue(error);

    await expect(
      sendTransaction({
        params: [transactionRequest],
        ethSigner,
        rpcProvider: rpcProvider as unknown as JsonRpcProvider,
        relayerClient: relayerClient as unknown as RelayerClient,
        zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
        guardianClient: guardianClient as unknown as GuardianClient,
        flow: flow as unknown as Flow,
      }),
    ).rejects.toThrow(error);
  });
});
