import { BrowserProvider } from 'ethers';
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
    } as unknown as BrowserProvider;

    const chainId = await getUnderlyingChainId(provider);
    expect(chainId).toEqual(ChainId.SEPOLIA);
    expect(provider.send).not.toBeCalled();
  });

  it('should return the underlying chain id from rpc call', async () => {
    const provider = {
      provider: {
        request: jest.fn().mockResolvedValue('0xaa36a7'),
      },
    } as unknown as BrowserProvider;

    const chainId = await getUnderlyingChainId(provider);
    expect(chainId).toEqual(ChainId.SEPOLIA);
    expect(provider.send).toBeCalledWith({
      method: WalletAction.GET_CHAINID,
      params: [],
    });
  });

  it('should properly parse chain id', async () => {
    const intChainId = 13473;
    const strChainId = intChainId.toString();
    const hexChainId = `0x${intChainId.toString(16)}`;
    const getMockProvider = (chainId: unknown) => ({ provider: { chainId } } as unknown as BrowserProvider);

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
      await getUnderlyingChainId({} as BrowserProvider);
    } catch (err: any) {
      expect(err.message).toEqual(
        'Parsed provider is not a valid BrowserProvider',
      );
      expect(err.type).toEqual(CheckoutErrorType.WEB3_PROVIDER_ERROR);
    }
  });

  it('should throw an error if provider.request missing', async () => {
    try {
      await getUnderlyingChainId({ provider: {} } as BrowserProvider);
    } catch (err: any) {
      expect(err.message).toEqual(
        'Parsed provider is not a valid BrowserProvider',
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
    } as unknown as BrowserProvider;

    expect(provider.send).not.toHaveBeenCalled();
    expect(getUnderlyingChainId(provider)).rejects.toThrow('Invalid chainId');
  });

  it('should throw an error if invalid chain id value returned from rpc call ', async () => {
    const provider = {
      provider: {
        request: jest.fn().mockResolvedValue('invalid'),
      },
    } as unknown as BrowserProvider;

    expect(getUnderlyingChainId(provider)).rejects.toThrow('Invalid chainId');
    expect(provider.send).toHaveBeenCalled();
  });
});
