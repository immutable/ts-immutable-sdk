import { Web3Provider } from '@ethersproject/providers';
import { ChainId } from '../types/chains';
import { getUnderlyingChainId } from './getUnderlyingProvider';
import { WalletAction } from '../types/wallet';
import { CheckoutErrorType } from '../errors';

describe('getUnderlyingChainId', () => {
  it('should return the underlying chain id', async () => {
    const provider = {
      provider: {
        request: jest.fn().mockResolvedValue('0xAA36A7'),
      },
    } as unknown as Web3Provider;

    const chainId = await getUnderlyingChainId(provider);
    expect(chainId).toEqual(ChainId.SEPOLIA);
    expect(provider.provider.request).toBeCalledWith({
      method: WalletAction.GET_CHAINID,
      params: [],
    });
  });

  it('should throw an error if provider missing from web3provider', async () => {
    try {
      await getUnderlyingChainId({} as Web3Provider);
    } catch (err: any) {
      expect(err.message).toEqual('Parsed provider is not a valid Web3Provider');
      expect(err.type).toEqual(CheckoutErrorType.WEB3_PROVIDER_ERROR);
    }
  });

  it('should throw an error if provider.request missing', async () => {
    try {
      await getUnderlyingChainId({ provider: {} } as Web3Provider);
    } catch (err: any) {
      expect(err.message).toEqual('Parsed provider is not a valid Web3Provider');
      expect(err.type).toEqual(CheckoutErrorType.WEB3_PROVIDER_ERROR);
    }
  });
});
