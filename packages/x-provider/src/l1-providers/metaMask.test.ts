import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { connect } from './metaMask';
import { WALLET_ACTION } from './rpc';

jest.mock('@metamask/detect-provider');

describe('the connect function', () => {
  it('Should succeed and return a Web3Provider', async () => {
    const requestMockFn = jest.fn();
    (detectEthereumProvider as jest.Mock).mockResolvedValue({
      request: requestMockFn,
    });

    const web3Provider = await connect({});

    expect(requestMockFn).toHaveBeenCalledWith({
      method: WALLET_ACTION.CONNECT,
    });
    expect(web3Provider).not.toBeNull();
    expect(web3Provider).toBeInstanceOf(ethers.providers.Web3Provider);
  });

  it('Should switch to the mainnet', async () => {
    const requestMockFn = jest.fn();
    (detectEthereumProvider as jest.Mock).mockResolvedValue({
      request: requestMockFn,
    });

    const web3Provider = await connect({ chainID: 1 });

    expect(requestMockFn).toBeCalledWith({
      method: WALLET_ACTION.SWITCH_CHAIN,
      params: [{ chainId: '0x1' }],
    });
    expect(web3Provider).toBeInstanceOf(ethers.providers.Web3Provider);
  });

  it('Should throw an error', async () => {
    (detectEthereumProvider as jest.Mock).mockResolvedValue({ request: null });

    await expect(connect({})).rejects.toThrowError();
  });
});
