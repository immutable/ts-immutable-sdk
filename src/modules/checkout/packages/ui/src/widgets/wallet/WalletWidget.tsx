import { BiomeThemeProvider, Heading } from '@biom3/react'
import { onLightBase } from '@biom3/design-tokens'

import { 
  WalletWidgetProps,
} from '../../types'
import { CheckoutSDK, ConnectionProviders } from '@imtbl/checkout-sdk-web';
import { useEffect } from 'react';
import { formatEther } from 'ethers/lib/utils';

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
    }

    connectAndGetBalance();
  }, [checkoutSDK])

  return(
    <BiomeThemeProvider theme={{base: onLightBase}}>
    <Heading>Wallet Widget</Heading>
    </BiomeThemeProvider>
  )

}