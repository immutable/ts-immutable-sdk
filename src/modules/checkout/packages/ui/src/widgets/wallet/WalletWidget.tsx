import { Badge, BiomeThemeProvider, Body, Box, Button, Heading } from "@biom3/react";
import { onDarkBase } from "@biom3/design-tokens";

import { WalletWidgetProps } from "../../types";
import {
  CheckoutSDK,
  ConnectionProviders,
  Network,
  SwitchNetworkParams
} from "@imtbl/checkout-sdk-web";
import { useCallback, useEffect, useState } from "react";
import { Network as EthersNetwork, Web3Provider } from "@ethersproject/providers";
import { WalletWidgetStyle, WidgetBodyStyle, WidgetHeaderStyle, WidgetSubHeadingStyle } from "./WalletStyles";
import { NetworkName, NetworkNameMap } from "../../types/constants";
import { BalanceInfo, TokenBalance } from "./components/tokenBalance";
import { utils } from "ethers";

interface TokensData {
  name:string;
  contractAddress:string;
}
export function WalletWidget(props:WalletWidgetProps) {
  const { params } = props;
  const [provider, setProvider] = useState<Web3Provider>();
  const [network, setNetwork] = useState<EthersNetwork>();
  const [tokenBalances, setTokenBalances] = useState<BalanceInfo[]>();
  const [tokens, setTokens] = useState<TokensData[]>();
  const [ totalFiatAmount, setTotalFiatAmount] = useState(0.0);
  const checkout = new CheckoutSDK();

  const getNetwork = useCallback(async() => {
    const network = await provider?.getNetwork();
    setNetwork(network);
    }, [provider])


  useEffect(()=>{
    getNetwork();
  }, [getNetwork]);

  const getProvider = useCallback(async() => {
    const providerPreference = params.providerPreference ?? ConnectionProviders.METAMASK;
    const prov: Web3Provider = await checkout.connect({
      providerPreference
    });
    setProvider(prov);
  }, [provider])

  useEffect(()=>{
    getProvider();
  }, [])

  const getTokens = useCallback(async() => {
//todo: fetch tokens for the connected network
    const ethTokens = [
      {name:'GODS', contractAddress:'0xccC8cb5229B0ac8069C51fd58367Fd1e622aFD97'},
      {name:'IMX', contractAddress:'0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF'}
    ];
    const goTokens = [
      {name:'GODS', contractAddress:'0xeD578CD4Cce52DBDAc10DC00fEA1335257dFabAe'},
      {name:'IMX', contractAddress:'0x1FACDD0165489f373255A90304650E15481b2c85'}
    ];
    const networkName = getNetworkName();
    switch (networkName) {
      case NetworkNameMap[NetworkName.GOERLI]:
        setTokens(goTokens);
        break;
      case NetworkNameMap[NetworkName.HOMESTEAD]:
        setTokens(ethTokens);
        break;
      default: setTokens([])
    }
  }, [provider])

  useEffect(()=>{
    getProvider();
  }, [])

  useEffect(()=>{
    const getTokenBalances = async () => {
      if(provider === undefined){
        return '';
      }
      const walletAddress = await provider.getSigner().getAddress();
      const tokenBalances: BalanceInfo[] = [{
        name:'LOL',
        description:'lol coins',
        balance: '20.25',
        fiatAmount:'23.50'
      },
      {
        name:'ROFL',
        balance: '200',
        fiatAmount:'3'
      }];

      const totalBalance = 26.50;
      if (tokens !== undefined && tokens.length > 0) {
        for (const token of tokens) {
          const balanceResult = await checkout.getERC20Balance({
            provider,
            walletAddress,
            contractAddress: token.contractAddress
          });
          if (balanceResult.formattedBalance === '0.0') continue;
          tokenBalances.push({
            balance: balanceResult.formattedBalance,
            fiatAmount: '23.50', // todo: fetch fiat price from coinGecko apis
            name: balanceResult.symbol,
            description: balanceResult.name
          });
          //totalBalance += //todo: use fiat price fetched above
        }
      }
      //get balance for native currency
      const nativeCurrencyBalance = await checkout.getBalance({
        provider,
        walletAddress
      });
      const nativeFormattedBalance = utils.formatUnits(nativeCurrencyBalance, 18);
      if (nativeFormattedBalance !== '0.0') {
        tokenBalances.push({
          balance: nativeFormattedBalance,
          name: 'NATIVE',
          fiatAmount: 'n/a',
        });
      }
      console.log(tokenBalances)
      setTokenBalances(tokenBalances);
      setTotalFiatAmount(totalBalance);
    }
    getTokenBalances();
  }, [network])
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
    await getProvider();
    await getTokens();
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
            <Body sx={{alignSelf:'flex-end'}} size={'medium'}> Value:${totalFiatAmount}</Body>
          </Box>
        </Box>
        <Box sx={WidgetBodyStyle}>
            {tokenBalances?.map((balance) =>
              <TokenBalance key={balance.name} params={balance}></TokenBalance>)}
          { tokenBalances?.length==2 && (<Body>No tokens found</Body>)}
        </Box>
        <Box sx={WidgetSubHeadingStyle}>
          {NetworkNameMap[NetworkName.GOERLI]!==getNetworkName() &&
          (<Button size={'small'}
                  testId='goerli-network-button'
                  onClick={() => switchNetwork(Network.GOERLI)}>
            <Badge isAnimated={false} />
            Switch to Goerli</Button>)}
          {NetworkNameMap[NetworkName.HOMESTEAD]!==getNetworkName() && (
          <Button size={'small'}
                  testId='eth-network-button'
                  onClick={() => switchNetwork(Network.ETHEREUM)}>
            <Badge isAnimated={false} />
            Switch to Ethereum</Button>)}
          {NetworkNameMap[NetworkName.MATIC]!==getNetworkName() && (
          <Button size={'small'}
                  testId='poly-network-button'
                  onClick={() => switchNetwork(Network.POLYGON)}>
            <Badge isAnimated={false} />
            Switch to Polygon</Button>)}
        </Box>
      </Box>
    </BiomeThemeProvider>
  )

}
