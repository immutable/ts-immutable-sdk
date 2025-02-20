import { ChainId } from '../types/chains';
import { getUnderlyingChainId } from './getUnderlyingProvider';
import { WalletAction } from '../types/wallet';
import { CheckoutErrorType } from '../errors';
import { WrappedBrowserProvider } from '../types';

describe('getUnderlyingChainId', () => {
  it('should return underlying chain id from property', async () => {
    const provider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: BigInt(ChainId.SEPOLIA) }),
      send: jest.fn(),
    } as unknown as WrappedBrowserProvider;

    const chainId = await getUnderlyingChainId(provider);
    expect(chainId).toEqual(BigInt(ChainId.SEPOLIA));
    expect(provider.send).not.toBeCalled();
  });

  it('should return the underlying chain id from rpc call', async () => {
    const provider = {
      send: jest.fn().mockResolvedValue(BigInt(ChainId.SEPOLIA)),
      getNetwork: jest.fn().mockResolvedValue({ chainId: undefined }),
    } as unknown as WrappedBrowserProvider;

    const chainId = await getUnderlyingChainId(provider);
    expect(chainId).toEqual(BigInt(ChainId.SEPOLIA));
    expect(provider.send).toBeCalledWith(WalletAction.GET_CHAINID, []);
  });

  it('should throw an error if provider.send missing', async () => {
    try {
      await getUnderlyingChainId({
        getNetwork: jest.fn().mockResolvedValue({ chainId: undefined }),
      } as unknown as WrappedBrowserProvider);
    } catch (err: any) {
      expect(err.message).toEqual(
        'Parsed provider is not a valid WrappedBrowserProvider',
      );
      expect(err.type).toEqual(CheckoutErrorType.WEB3_PROVIDER_ERROR);
    }
  });

  it('should throw an error if invalid chain id value from getNetwork property', async () => {
    const provider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: 'invalid' }),
      send: jest.fn(),
    } as unknown as WrappedBrowserProvider;

    await expect(getUnderlyingChainId(provider)).rejects.toThrow('Invalid chainId');
  });

  it('should throw an error if invalid chain id value returned from rpc call ', async () => {
    const provider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: undefined }),
      send: jest.fn().mockResolvedValue('invalid'),
    } as unknown as WrappedBrowserProvider;

    expect(getUnderlyingChainId(provider)).rejects.toThrow('Invalid chainId');
  });
});
