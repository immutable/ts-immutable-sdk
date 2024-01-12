import { config } from 'dotenv';
import { Wallet, providers } from 'ethers';
import { deployTestToken } from './erc721';

config();

// For dev create a banker who has power to mint from this contract
// For sandbox create a banker who has power to mint for this contract

const seaportAddress = process.env.SEAPORT_CONTRACT_ADDRESS;
const deployerKey = process.env.ORDERBOOK_BANKER;
const rpcUrl = process.env.RPC_ENDPOINT;

if (!seaportAddress || !deployerKey || !rpcUrl) {
  throw new Error('missing config');
}

const deployerWallet = new Wallet(deployerKey, new providers.JsonRpcProvider(rpcUrl));

deployTestToken(deployerWallet, seaportAddress);
