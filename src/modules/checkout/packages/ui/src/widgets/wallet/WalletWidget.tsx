import { Badge, BiomeThemeProvider, Body, Box, Button } from "@biom3/react";
import { onDarkBase } from "@biom3/design-tokens";

import { WalletWidgetProps } from "../../types";
import { CheckoutSDK, ConnectionProviders, Network, NetworkMap } from "@imtbl/checkout-sdk-web";
import { useEffect, useState } from "react";
import { Web3Provider, Network as EthersNetwork } from "@ethersproject/providers";
import { WalletWidgetStyle, WidgetHeaderStyle } from "./WalletStyles";

export function WalletWidget(props:WalletWidgetProps) {
  const { params } = props;
  const [provider, setProvider] = useState<Web3Provider>();
  const [network, setNetwork] = useState<EthersNetwork>();
  console.log("wallet:",params);

  useEffect(()=>{
    const getNetwork = async ()=>{
      const network = await provider?.getNetwork();
      setNetwork(network);
    }
    getNetwork();
  }, [provider]);

  useEffect(()=>{
    const getProvider = async ()=>{
      const checkout = new CheckoutSDK();
      const prov: Web3Provider = await checkout.connect({
        providerPreference: ConnectionProviders.METAMASK
      });
      setProvider(prov);
    }
    getProvider();
  }, [])

  const getNetworkName = (): string => {
    if(network === undefined){
      return '';
    }
    switch (network.name) {
      case 'matic': return NetworkMap[Network.POLYGON].chainName;
      case 'homestead': return NetworkMap[Network.ETHEREUM].chainName;
      case 'goerli': return NetworkMap[Network.GOERLI].chainName;
      default: return '';
    }
  }

  return(
    <BiomeThemeProvider theme={{base: onDarkBase}}>
      <Box sx={WalletWidgetStyle}>
        <Box sx={WidgetHeaderStyle}>
            <Badge isAnimated />
            <Body>
              Network: {getNetworkName()}
            </Body>
          <Button sx={{alignSelf:'flex-end'}}
            testId='close-button'
            onClick={() => console.log('closing wallet widget')}>x</Button>
        </Box>
        <Box>
        <Body>
          Network: {network?.name}
        </Body>
        </Box>
      </Box>
    </BiomeThemeProvider>
  )

}
