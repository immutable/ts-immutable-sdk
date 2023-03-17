import { Badge, BiomeThemeProvider, Body, Box, Button, Heading } from "@biom3/react";
import { onDarkBase } from "@biom3/design-tokens";

import { WalletWidgetProps } from "../../types";
import { CheckoutSDK, ConnectionProviders, Network, SwitchNetworkParams } from "@imtbl/checkout-sdk-web";
import { useEffect, useState } from "react";
import { Network as EthersNetwork, Web3Provider } from "@ethersproject/providers";
import { WalletWidgetStyle, WidgetBodyStyle, WidgetHeaderStyle, WidgetSubHeadingStyle } from "./WalletStyles";
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
  const checkout = new CheckoutSDK();

  useEffect(()=>{
    const getNetwork = async ()=>{
      const network = await provider?.getNetwork();
      setNetwork(network);
    }
    getNetwork();
  }, [provider]);

  useEffect(()=>{
    const getProvider = async ()=>{
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
  const switchNetwork = async (network:Network) =>{
    await checkout.switchNetwork({
      network: network,
      provider: provider
    } as SwitchNetworkParams)
  }

  return(
    <BiomeThemeProvider theme={{base: onDarkBase}}>
      <Box sx={WalletWidgetStyle}>
        <Box sx={WidgetHeaderStyle}>
          <Box sx={{width:'5%'}}>
            <Badge variant="success" isAnimated />
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
          <Box >
          <Heading size={'medium'}> Tokens</Heading>
          </Box>
          <Box >
            <Body sx={{alignSelf:'flex-end'}} size={'medium'}> Value:$26.50</Body>
          </Box>
        </Box>
        <Box sx={WidgetBodyStyle}>
            {balances.map((balance) =>
              <TokenBalance params={balance}></TokenBalance>)}
        </Box>
        <Box sx={WidgetSubHeadingStyle}>
          <Button size={'small'}
                  sx={{display: NetworkNameMap[NetworkName.GOERLI]===getNetworkName() ? 'none' : 'block'}}
                  testId='goerli-network-button'
                  onClick={() => switchNetwork(Network.GOERLI)}>
            <Badge isAnimated={false} />
            Switch to Goerli</Button>
          <Button size={'small'}
                  sx={{display: NetworkNameMap[NetworkName.HOMESTEAD]===getNetworkName() ? 'none' : 'block'}}
                  testId='eth-network-button'
                  onClick={() => switchNetwork(Network.ETHEREUM)}>
            <Badge isAnimated={false} />
            Switch to Ethereum</Button>
          <Button size={'small'}
                  sx={{display: NetworkNameMap[NetworkName.MATIC]===getNetworkName() ? 'none' : 'block'}}
                  testId='poly-network-button'
                  onClick={() => switchNetwork(Network.POLYGON)}>
            <Badge isAnimated={false} />
            Switch to Polygon</Button>
        </Box>
      </Box>
    </BiomeThemeProvider>
  )

}
