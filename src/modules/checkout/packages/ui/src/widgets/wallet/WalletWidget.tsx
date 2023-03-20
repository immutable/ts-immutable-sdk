import { Badge, BiomeThemeProvider, Body, Box, Button, Heading } from "@biom3/react";
import { onDarkBase } from "@biom3/design-tokens";

import { WalletWidgetProps } from "../../types";
import {
  CheckoutSDK,
  ConnectionProviders,
  Network,
  SwitchNetworkParams
} from "@imtbl/checkout-sdk-web";
import { useEffect, useState } from "react";
import { Network as EthersNetwork, Web3Provider } from "@ethersproject/providers";
import { WalletWidgetStyle, WidgetBodyStyle, WidgetHeaderStyle, WidgetSubHeadingStyle } from "./WalletStyles";
import { NetworkName, NetworkNameMap } from "../../types/constants";
import { BalanceInfo, TokenBalance } from "./components/tokenBalance";
import { utils } from "ethers";

export function WalletWidget(props:WalletWidgetProps) {
  const { params } = props;
  // const balances:BalanceInfo[] = [{
  //   name:'IMX',
  //   description:'immutable',
  //   balance: '20.25',
  //   fiatAmount:'23.50'
  // },
  // {
  //   name:'GODS',
  //   balance: '200',
  //   fiatAmount:'3'
  // }];
  const [provider, setProvider] = useState<Web3Provider>();
  const [network, setNetwork] = useState<EthersNetwork>();
  const [tokenBalances, setTokenBalances] = useState<BalanceInfo[]>();
  const checkout = new CheckoutSDK();

  useEffect(()=>{
    const getNetwork = async ()=>{
      const network = await provider?.getNetwork();
      setNetwork(network);
    }

    getNetwork();
  }, []);

  useEffect(()=>{
    const getProvider = async ()=>{
      const providerPreference = params.providerPreference ?? ConnectionProviders.METAMASK;
      const prov: Web3Provider = await checkout.connect({
        providerPreference
      });
      setProvider(prov);
    }
    getProvider();
  }, [])

  useEffect(()=>{
    const getTokenBalances = async () => {
      if(provider === undefined){
        return '';
      }
      const walletAddress = await provider.getSigner().getAddress();
      const tokenBalances: BalanceInfo[] = [];

      //fetch tokens for the connected network
      //foreach ERC-20 token contract, call checkout.getERC20Balance
      const tokens = [
        {name:'GODS', contractAddress:'0xccC8cb5229B0ac8069C51fd58367Fd1e622aFD97'},
        {name:'IMX', contractAddress:'0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF'}
      ];

      for (const token of tokens) {
        const balanceResult = await checkout.getERC20Balance({
          provider,
          walletAddress,
          contractAddress: token.contractAddress
        });
        tokenBalances.push({
          balance: balanceResult.formattedBalance,
          fiatAmount: 'n/a',
          name: balanceResult.symbol,
          description: balanceResult.name
        });
      }
      //get balance for native currency
      const nativeCurrencyBalance = await checkout.getBalance({
        provider,
        walletAddress
      });
      tokenBalances.push({
        balance:utils.formatUnits(nativeCurrencyBalance),
        name: 'NATIVE',
        fiatAmount:'n/a',
      });

      setTokenBalances(tokenBalances)
    }
    getTokenBalances();
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
    } as SwitchNetworkParams);
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
            {tokenBalances?.map((balance) =>
              <TokenBalance key={balance.name} params={balance}></TokenBalance>)}
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
