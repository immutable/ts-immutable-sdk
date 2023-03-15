import { BiomeThemeProvider, Heading } from '@biom3/react'
import { onLightBase } from '@biom3/design-tokens'

import { 
  WalletWidgetProps,
} from '../../types'
import { CheckoutSDK, ConnectionProviders } from '@imtbl/checkout-sdk-web';
import { useEffect } from 'react';
import { formatEther, formatUnits } from 'ethers/lib/utils';

export function WalletWidget(props:WalletWidgetProps) {
  const { params } = props;
  console.log(params);

  const checkoutSDK = new CheckoutSDK();

  useEffect(() => {
    const connectAndGetBalance = async () => {
      const provider = await checkoutSDK.connect({ providerPreference: ConnectionProviders.METAMASK });

      const walletAddress = await provider.getSigner().getAddress();
      const balance = await checkoutSDK.getBalance({ provider, walletAddress });
      console.log(balance);

      console.log(formatEther(balance));

      const contractAddress = '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF';
      const erc20balance = await checkoutSDK.getERC20Balance({ provider, contractAddress, walletAddress })

      console.log('ether: ', formatEther(erc20balance.balance));
      console.log('units: ', formatUnits(erc20balance.balance, erc20balance.decimals))
    }

    connectAndGetBalance();
  }, [checkoutSDK])

  return(
    <BiomeThemeProvider theme={{base: onLightBase}}>
    <Heading>Wallet Widget</Heading>
    </BiomeThemeProvider>
  )

}