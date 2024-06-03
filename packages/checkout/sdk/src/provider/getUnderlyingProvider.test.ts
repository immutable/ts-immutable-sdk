import { Web3Provider } from '@ethersproject/providers';
import { ChainId } from '../types/chains';
import { getUnderlyingChainId } from './getUnderlyingProvider';
import { WalletAction } from '../types/wallet';
import { CheckoutErrorType } from '../errors';

describe('getUnderlyingChainId', () => {
  it('should return underlying chain id from property', async () => {
    const provider = {
      provider: {
        chainId: ChainId.SEPOLIA,
        request: jest.fn(),
      },
    } as unknown as Web3Provider;

    const chainId = await getUnderlyingChainId(provider);
    expect(chainId).toEqual(ChainId.SEPOLIA);
    expect(provider.provider.request).not.toBeCalled();
  });

  it('should return the underlying chain id from rpc call', async () => {
    const provider = {
      provider: {
        request: jest.fn().mockResolvedValue('0xaa36a7'),
      },
    } as unknown as Web3Provider;

    const chainId = await getUnderlyingChainId(provider);
    expect(chainId).toEqual(ChainId.SEPOLIA);
    expect(provider.provider.request).toBeCalledWith({
      method: WalletAction.GET_CHAINID,
      params: [],
    });
  });

  it('should properly parse chain id', async () => {
    const intChainId = 13473;
    const strChainId = intChainId.toString();
    const hexChainId = `0x${intChainId.toString(16)}`;
    const getMockProvider = (chainId: unknown) => ({ provider: { chainId } } as unknown as Web3Provider);

    // Number
    expect(await getUnderlyingChainId(getMockProvider(intChainId))).toEqual(
      intChainId,
    );

    // String to Number
    expect(await getUnderlyingChainId(getMockProvider(strChainId))).toEqual(
      intChainId,
    );

    // Hex to Number
    expect(await getUnderlyingChainId(getMockProvider(hexChainId))).toEqual(
      intChainId,
    );
  });

  it('should throw an error if provider missing from web3provider', async () => {
    try {
      await getUnderlyingChainId({} as Web3Provider);
    } catch (err: any) {
      expect(err.message).toEqual(
        'Parsed provider is not a valid Web3Provider',
      );
      expect(err.type).toEqual(CheckoutErrorType.WEB3_PROVIDER_ERROR);
    }
  });

  it('should throw an error if provider.request missing', async () => {
    try {
      await getUnderlyingChainId({ provider: {} } as Web3Provider);
    } catch (err: any) {
      expect(err.message).toEqual(
        'Parsed provider is not a valid Web3Provider',
      );
      expect(err.type).toEqual(CheckoutErrorType.WEB3_PROVIDER_ERROR);
    }
  });

  it('should throw an error if invalid chain id value from property', async () => {
    const provider = {
      provider: {
        chainId: 'invalid',
        request: jest.fn(),
      },
    } as unknown as Web3Provider;

    expect(provider.provider.request).not.toHaveBeenCalled();
    expect(getUnderlyingChainId(provider)).rejects.toThrow('Invalid chainId');
  });

  it('should throw an error if invalid chain id value returned from rpc call ', async () => {
    const provider = {
      provider: {
        request: jest.fn().mockResolvedValue('invalid'),
      },
    } as unknown as Web3Provider;

    expect(getUnderlyingChainId(provider)).rejects.toThrow('Invalid chainId');
    expect(provider.provider.request).toHaveBeenCalled();
  });
});
