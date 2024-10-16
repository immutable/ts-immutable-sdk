import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { BigNumber, Contract } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { WrapDirection } from '../types/wrap';
import { wrap } from './wrap';
import { CheckoutConfiguration } from '../config';
import { DEFAULT_TOKEN_DECIMALS } from '../env';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Contract: jest.fn(),
}));

describe('wrap', () => {
  const mockChainId = 13473;
  const mockConfig = {
    environment: Environment.SANDBOX,
  } as unknown as CheckoutConfiguration;

  const sendTransactionMock = jest.fn().mockResolvedValue({ hash: '0xtxhash', wait: jest.fn() });

  const mockProvider = {
    getSigner: jest.fn().mockReturnValue({
      getAddress: jest.fn().mockResolvedValue('0xmockaddress'),
      sendTransaction: sendTransactionMock,
    }),
    getNetwork: jest.fn().mockResolvedValue({ chainId: mockChainId }),
    provider: {
      isPassport: false,
    },
  } as unknown as Web3Provider;

  const mockWrappedIMXContract = {
    populateTransaction: {
      deposit: jest.fn().mockResolvedValue({}),
      withdraw: jest.fn().mockResolvedValue({}),
    },
  };

  (Contract as unknown as jest.Mock).mockReturnValue(mockWrappedIMXContract);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call sendTransaction with the correct transaction - wrapping', async () => {
    const amount = '100';
    const direction = WrapDirection.WRAP;

    const expectedParsedAmount = parseUnits(amount, DEFAULT_TOKEN_DECIMALS);

    await wrap(mockConfig, mockProvider, amount, direction);

    expect(mockWrappedIMXContract.populateTransaction.deposit).toHaveBeenCalled();
    expect(sendTransactionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        value: expectedParsedAmount,
        gasPrice: undefined,
      }),
    );
  });

  it('should call sendTransaction with the correct transaction - unwrapping', async () => {
    const amount = '100';
    const direction = WrapDirection.UNWRAP;

    const expectedParsedAmount = parseUnits(amount, DEFAULT_TOKEN_DECIMALS);

    await wrap(mockConfig, mockProvider, amount, direction);

    expect(mockWrappedIMXContract.populateTransaction.withdraw).toHaveBeenCalledWith(expectedParsedAmount.toString());
    expect(sendTransactionMock).toHaveBeenCalled();
  });

  it('should ensure zero gas costs for passport providers', async () => {
    const mockPassportProvider = {
      ...mockProvider,
      provider: {
        isPassport: true,
      },
    } as unknown as Web3Provider;

    const amount = '100';
    const direction = WrapDirection.WRAP;

    await wrap(mockConfig, mockPassportProvider, amount, direction);

    expect(sendTransactionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        gasPrice: BigNumber.from(0),
      }),
    );
  });
});
