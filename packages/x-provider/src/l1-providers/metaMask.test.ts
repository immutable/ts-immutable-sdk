import detectEthereumProvider from '@metamask/detect-provider';
import { BrowserProvider } from 'ethers';
import { connect } from './metaMask';
import { WALLET_ACTION } from './rpc';

jest.mock('@metamask/detect-provider');

describe('the connect function', () => {
  it('Should succeed and return a BrowserProvider', async () => {
    const requestMockFn = jest.fn();
    (detectEthereumProvider as jest.Mock).mockResolvedValue({
      request: requestMockFn,
    });

    const browserProvider = await connect({});

    expect(requestMockFn).toHaveBeenCalledWith({
      method: WALLET_ACTION.CONNECT,
    });
    expect(browserProvider).not.toBeNull();
    expect(browserProvider).toBeInstanceOf(BrowserProvider);
  });

  it('Should switch to the mainnet', async () => {
    const requestMockFn = jest.fn();
    (detectEthereumProvider as jest.Mock).mockResolvedValue({
      request: requestMockFn,
    });

    const browserProvider = await connect({ chainID: 1 });

    expect(requestMockFn).toBeCalledWith({
      method: WALLET_ACTION.SWITCH_CHAIN,
      params: [{ chainId: '0x1' }],
    });
    expect(browserProvider).toBeInstanceOf(BrowserProvider);
  });

  it('Should throw an error', async () => {
    (detectEthereumProvider as jest.Mock).mockResolvedValue({ request: null });

    await expect(connect({})).rejects.toThrowError();
  });
});
