import { TransactionRequest } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { Flow } from '@imtbl/metrics';
import { BigNumber } from 'ethers';
import { mockUserZkEvm } from '../test/mocks';
import * as transactionHelpers from './transactionHelpers';
import { signEjectionTransaction } from './signEjectionTransaction';

jest.mock('./transactionHelpers');
jest.mock('../network/retry');

describe('im_signEjectionTransaction', () => {
  const signedTransaction = 'signedTransaction123';

  const transactionRequest: TransactionRequest = {
    to: mockUserZkEvm.zkEvm.ethAddress,
    data: '0x456',
    nonce: BigNumber.from(5),
    chainId: 1,
    value: '0x00',
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
      signedTransaction,
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

  it('returns the transaction hash', async () => {
    const result = await signEjectionTransaction({
      params: [transactionRequest],
      ethSigner,
      zkEvmAddress: mockUserZkEvm.zkEvm.ethAddress,
      flow: flow as unknown as Flow,
    });

    expect(result).toEqual(signedTransaction);
  });
});
