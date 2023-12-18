import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';

import * as dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  defaultNetwork: 'devnet',
  networks: {
    devnet: {
      url: process.env.API_URL || '',
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : {
          mnemonic: process.env.TEST_ZKEVM_WALLET_MNEMONIC || '',
          path: "m/44'/60'/0'/0",
          initialIndex: 0,
          count: 10,
          passphrase: '',
        },
    },
    testnet: {
      url: process.env.API_URL || '',
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : {
          mnemonic: process.env.TEST_ZKEVM_WALLET_MNEMONIC || '',
          path: "m/44'/60'/0'/0",
          initialIndex: 0,
          count: 10,
          passphrase: '',
        },
    },
  },
};

export default config;
