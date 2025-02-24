import { Flow } from '@imtbl/metrics';
import { Signer, JsonRpcProvider } from 'ethers';
import { sendDeployTransactionAndPersonalSign } from './sendDeployTransactionAndPersonalSign';
import { mockUserZkEvm } from '../test/mocks';
import { RelayerClient } from './relayerClient';
import GuardianClient from '../guardian';
import * as transactionHelpers from './transactionHelpers';
import * as personalSign from './personalSign';

jest.mock('./transactionHelpers');
jest.mock('./personalSign');

describe('sendDeployTransactionAndPersonalSign', () => {
  const signedTransactions = 'signedTransactions123';
  const relayerTransactionId = 'relayerTransactionId123';
  const transactionHash = 'transactionHash123';
  const signedMessage = 'signedMessage123';

  const nonce = BigInt(5);

  const params = ['message to sign'];
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
    withConfirmationScreen: jest.fn(),
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
    (personalSign.personalSign as jest.Mock).mockResolvedValue(signedMessage);
    (guardianClient.withConfirmationScreen as jest.Mock)
      .mockImplementation(() => (task: () => void) => task());
  });

  it('calls prepareAndSignTransaction with the correct arguments', async () => {
    await sendDeployTransactionAndPersonalSign({
      params,
      ethSigner,
      rpcProvider: rpcProvider as unknown as JsonRpcProvider,
      relayerClient: relayerClient as unknown as RelayerClient,
      zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
      guardianClient: guardianClient as unknown as GuardianClient,
      flow: flow as unknown as Flow,
    });

    expect(transactionHelpers.prepareAndSignTransaction).toHaveBeenCalledWith({
      transactionRequest: { to: mockUserZkEvm.zkEvm.ethAddress, value: 0 },
      ethSigner,
      rpcProvider: rpcProvider as unknown as JsonRpcProvider,
      relayerClient: relayerClient as unknown as RelayerClient,
      guardianClient: guardianClient as unknown as GuardianClient,
      zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
      flow: flow as unknown as Flow,
    });
  });

  it('calls personalSign with the correct arguments', async () => {
    await sendDeployTransactionAndPersonalSign({
      params,
      ethSigner,
      rpcProvider: rpcProvider as unknown as JsonRpcProvider,
      relayerClient: relayerClient as unknown as RelayerClient,
      zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
      guardianClient: guardianClient as unknown as GuardianClient,
      flow: flow as unknown as Flow,
    });

    expect(personalSign.personalSign).toHaveBeenCalledWith({
      params,
      ethSigner,
      zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
      rpcProvider: rpcProvider as unknown as JsonRpcProvider,
      guardianClient: guardianClient as unknown as GuardianClient,
      relayerClient: relayerClient as unknown as RelayerClient,
      flow: flow as unknown as Flow,
    });
  });

  it('calls pollRelayerTransaction with the correct arguments', async () => {
    await sendDeployTransactionAndPersonalSign({
      params,
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

  it('returns the signed message', async () => {
    const result = await sendDeployTransactionAndPersonalSign({
      params,
      ethSigner,
      rpcProvider: rpcProvider as unknown as JsonRpcProvider,
      relayerClient: relayerClient as unknown as RelayerClient,
      zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
      guardianClient: guardianClient as unknown as GuardianClient,
      flow: flow as unknown as Flow,
    });

    expect(result).toEqual(signedMessage);
  });

  it('calls guardianClient.withConfirmationScreen with the correct arguments', async () => {
    await sendDeployTransactionAndPersonalSign({
      params,
      ethSigner,
      rpcProvider: rpcProvider as unknown as JsonRpcProvider,
      relayerClient: relayerClient as unknown as RelayerClient,
      zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
      guardianClient: guardianClient as unknown as GuardianClient,
      flow: flow as unknown as Flow,
    });

    expect(guardianClient.withConfirmationScreen).toHaveBeenCalled();
  });

  it('throws an error if any step fails', async () => {
    const error = new Error('Something went wrong');
    (transactionHelpers.prepareAndSignTransaction as jest.Mock).mockRejectedValue(error);

    await expect(
      sendDeployTransactionAndPersonalSign({
        params,
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
