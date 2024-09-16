import { config } from 'dotenv';
import { Wallet, providers } from 'ethers';
import { deployERC20Token } from './erc20';

config();

const deployerKey = process.env.ZKEVM_ORDERBOOK_BANKER;
const rpcUrl = process.env.ZKEVM_RPC_ENDPOINT;

if (!deployerKey || !rpcUrl) {
  throw new Error('missing config');
}

const deployerWallet = new Wallet(deployerKey, new providers.JsonRpcProvider(rpcUrl));

deployERC20Token(deployerWallet);
