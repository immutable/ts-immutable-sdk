import { Flow } from '@imtbl/metrics';
import { Signer, TransactionRequest } from 'ethers';
import { mockUserZkEvm } from '../test/mocks';
import * as transactionHelpers from './transactionHelpers';
import { signEjectionTransaction } from './signEjectionTransaction';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';

jest.mock('./transactionHelpers');
jest.mock('../network/retry');

describe('im_signEjectionTransaction', () => {
  const signedTransactionPayload = {
    to: mockUserZkEvm.zkEvm.ethAddress,
    data: '123',
    chainId: '1',
  };

  const transactionRequest: TransactionRequest = {
    to: mockUserZkEvm.zkEvm.ethAddress,
    nonce: 5,
    chainId: 1,
    value: BigInt('5'),
  };
  const ethSigner = {
    getAddress: jest.fn(),
  } as Partial<Signer> as Signer;
  const flow = {
    addEvent: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (transactionHelpers.prepareAndSignEjectionTransaction as jest.Mock).mockResolvedValue(
      signedTransactionPayload,
    );
  });

  it('calls prepareAndSignEjectionTransaction with the correct arguments', async () => {
    await signEjectionTransaction({
      params: [transactionRequest],
      ethSigner,
      zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
      flow: flow as unknown as Flow,
    });

    expect(transactionHelpers.prepareAndSignEjectionTransaction).toHaveBeenCalledWith({
      transactionRequest,
      ethSigner,
      zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
      flow: flow as unknown as Flow,
    });
  });

  it('calls signEjectionTransaction with invalid params', async () => {
    await expect(signEjectionTransaction({
      params: [transactionRequest, { test: 'test' }],
      ethSigner,
      zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
      flow: flow as unknown as Flow,
    })).rejects.toThrow(
      new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'im_signEjectionTransaction requires a singular param (hash)'),
    );
  });

  it('returns the transaction hash', async () => {
    const result = await signEjectionTransaction({
      params: [transactionRequest],
      ethSigner,
      zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
      flow: flow as unknown as Flow,
    });

    expect(result).toEqual(signedTransactionPayload);
  });
});
