import { config } from 'dotenv';
import { JsonRpcProvider, Wallet } from 'ethers';
import { deployERC721Token } from './erc721';

config();

const allowlistAddress = process.env.OPERATOR_ALLOWLIST_ADDRESS;
const deployerKey = process.env.ZKEVM_ORDERBOOK_BANKER;
const rpcUrl = process.env.ZKEVM_RPC_ENDPOINT;

if (!allowlistAddress || !deployerKey || !rpcUrl) {
  throw new Error('missing config');
}

const deployerWallet = new Wallet(deployerKey, new JsonRpcProvider(rpcUrl));

deployERC721Token(deployerWallet, allowlistAddress);
