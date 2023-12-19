require('@nomicfoundation/hardhat-toolbox');
require('@typechain/hardhat');
require('@nomiclabs/hardhat-ethers');

const dotenv = require('dotenv');

dotenv.config();

const config/*: HardhatUserConfig */ = {
  solidity: {
    version: '0.8.19',
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

module.exports = config;
