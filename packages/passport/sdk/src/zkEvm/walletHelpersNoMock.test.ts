import { JsonRpcProvider } from 'ethers';
import { getNonce } from './walletHelpers';

describe('getNonce', () => {
  it('should return the nonce for a smart contract wallet', async () => {
    const rpcProvider = new JsonRpcProvider('https://rpc.testnet.immutable.com');
    const smartContractWalletAddress = '0x41da14174e0bc2c3f9358c0d0409092bbaa5c70d';
    const nonce = await getNonce(rpcProvider, smartContractWalletAddress);
    expect(nonce).toBe(0n);
  }, 10000);
});
