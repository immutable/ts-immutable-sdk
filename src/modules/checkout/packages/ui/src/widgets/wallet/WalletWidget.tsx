import { Badge, BiomeThemeProvider, Body, Box, Button, Heading } from "@biom3/react";
import { onDarkBase } from "@biom3/design-tokens";

import { WalletWidgetProps } from "../../types";
import { CheckoutSDK, ConnectionProviders } from "@imtbl/checkout-sdk-web";
import { useEffect, useState } from "react";
import { Web3Provider, Network as EthersNetwork } from "@ethersproject/providers";
import { WalletWidgetStyle, WidgetSubHeadingStyle, WidgetHeaderStyle, WidgetBodyStyle } from "./WalletStyles";
import { NetworkName, NetworkNameMap } from "../../types/constants";
import { TokenBalance } from "./components/tokenBalance";

export function WalletWidget(props:WalletWidgetProps) {
  const { params } = props;
  const balances = [{
    name:'IMX',
    description:'immutable',
    value: '20.25',
    aud:'23.50'
  },
  {
    name:'GODS',
    value: '200',
    aud:'3'
  }];
  const [provider, setProvider] = useState<Web3Provider>();
  const [network, setNetwork] = useState<EthersNetwork>();
  // const [tokenBalances, setTokenBalances] = useState(balances);
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
    const networkName = network.name as NetworkName;

    if(!Object.values(NetworkName).includes(networkName)){
      return network.name;
    }

    return NetworkNameMap[networkName];
  }

  // const getTokenBalances = () => {
  //   setTokenBalances(balances)
  // }
  return(
    <BiomeThemeProvider theme={{base: onDarkBase}}>
      <Box sx={WalletWidgetStyle}>
        <Box sx={WidgetHeaderStyle}>
          <Box sx={{width:'5%'}}>
            <Badge  isAnimated />
          </Box>
          <Box sx={{width:'75%'}}>
            <Body>
              Network: {getNetworkName()}
            </Body>
          </Box>
          <Box sx={{width:'20%'}}>
          <Button size={'small'} sx={{alignSelf:'flex-end'}}
            testId='close-button'
            onClick={() => console.log('closing wallet widget')}>x</Button>
          </Box>
        </Box>
        <Box sx={WidgetSubHeadingStyle}>
          <Box sx={{width:'75%'}}>
          <Heading size={'medium'}> Tokens</Heading>
          </Box>
          <Box sx={{width:'25%'}}>
            <Body sx={{alignSelf:'flex-end'}} size={'medium'}> Value:$26.50</Body>
          </Box>
        </Box>
        <Box sx={WidgetBodyStyle}>
            {balances.map((balance) =>
              <TokenBalance params={balance}></TokenBalance>)}
        </Box>
      </Box>
    </BiomeThemeProvider>
  )

}
