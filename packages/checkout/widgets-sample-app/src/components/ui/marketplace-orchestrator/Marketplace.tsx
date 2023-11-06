import { ChainId, ChainName } from '@imtbl/checkout-sdk';
import { MainPage } from './MainPage';
import { WidgetProvider } from './WidgetProvider';

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'

// 1. Get projectId
const projectId = '68a502c25207d3f5250d778ad8c28fd0'

// 3. Create modal
const metadata = {
  name: 'Checkout Sample App',
  description: 'Checkout Sample App',
  url: 'http://localhost:3000',
  icons: ['http://localhost:3000']
}

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  // chains: [{
  //   chainId: ChainId.SEPOLIA,
  //   name: ChainName.SEPOLIA,
  //   currency: 'ETH',
  //   explorerUrl: 'https://sepolia.etherscan.io',
  //   rpcUrl: 'https://checkout-api.sandbox.immutable.com/v1/rpc/eth-sepolia'
  // },
  // {
  //   chainId: ChainId.IMTBL_ZKEVM_TESTNET,
  //   name: ChainName.IMTBL_ZKEVM_TESTNET,
  //   currency: 'IMX',
  //   explorerUrl: 'https://rpc.testnet.immutable.com',
  //   rpcUrl: 'https://rpc.testnet.immutable.com'
  // }],
  projectId
})

export const Marketplace = () => {
  return (
    <WidgetProvider>
      <MainPage />
    </WidgetProvider>
  );
};
