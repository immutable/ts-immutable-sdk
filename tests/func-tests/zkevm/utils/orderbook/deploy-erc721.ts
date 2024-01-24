import { config } from 'dotenv';
import { Wallet, providers } from 'ethers';
import { deployTestToken } from './erc721';

config();

const seaportAddress = process.env.SEAPORT_CONTRACT_ADDRESS;
const deployerKey = process.env.ZKEVM_ORDERBOOK_BANKER;
const rpcUrl = process.env.ZKEVM_RPC_ENDPOINT;

if (!seaportAddress || !deployerKey || !rpcUrl) {
  throw new Error('missing config');
}

const deployerWallet = new Wallet(deployerKey, new providers.JsonRpcProvider(rpcUrl));

deployTestToken(deployerWallet, seaportAddress);
