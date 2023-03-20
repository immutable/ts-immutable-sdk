import { Badge, BiomeThemeProvider, Box, Button } from "@biom3/react";
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
import { WalletWidgetStyle, WidgetBodyStyle, WidgetHeaderStyle } from "./WalletStyles";
import { NetworkCurrencyMap, ProviderIdentifiedNetwork, NetworkNameMap } from "../../types/constants";
import { utils } from "ethers";
import { NetworkStatus } from "./components/NetworkStatus";
import { TotalTokenBalance } from "./components/TotalTokenBalance";
import { TokenBalanceList } from "./components/TokenBalanceList";
import { BalanceInfo } from "./components/BalanceItem";

interface TokensData {
  contractAddress:string;
}
export function WalletWidget(props:WalletWidgetProps) {
  const { params } = props;
  const [provider, setProvider] = useState<Web3Provider>();
  const [network, setNetwork] = useState<EthersNetwork>();
  const [networkName, setNetworkName] = useState<string>("");
  const [tokenBalances, setTokenBalances] = useState<BalanceInfo[]>();
  const [tokens, setTokens] = useState<TokensData[]>();
  const [ totalFiatAmount, setTotalFiatAmount] = useState(0.0);
  const checkout = new CheckoutSDK();

  const getProvider = useCallback(async() => {
    const providerPreference = params.providerPreference ?? ConnectionProviders.METAMASK;
    const prov: Web3Provider = await checkout.connect({
      providerPreference
    });
    setProvider(prov);
  }, [provider]);

  const getNetwork = useCallback(async() => {
    const providerNetwork = await provider?.getNetwork();
    setNetwork(providerNetwork);
  }, [provider]);

  const getTokens = useCallback(() => {
    //todo: fetch tokens for the connected network
        const ethTokens = [
          {contractAddress:'0xccC8cb5229B0ac8069C51fd58367Fd1e622aFD97'},
          {contractAddress:'0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF'}
        ];
        const goTokens = [
          {contractAddress:'0xeD578CD4Cce52DBDAc10DC00fEA1335257dFabAe'},
          {contractAddress:'0x1FACDD0165489f373255A90304650E15481b2c85'}
        ];
        const networkName = getNetworkName(network);
        setNetworkName(networkName)
        switch (networkName) {
          case NetworkNameMap[ProviderIdentifiedNetwork.GOERLI]:
            setTokens(goTokens);
            break;
          case NetworkNameMap[ProviderIdentifiedNetwork.HOMESTEAD]:
            setTokens(ethTokens);
            break;
          default: setTokens([])
        }
      }, [provider, network]);

  useEffect(()=>{
    getProvider();
  }, []);

  useEffect(()=>{
    getNetwork();
  }, [getNetwork]);

  useEffect(() => {
    getTokens();
  }, [network]);

  useEffect(()=>{
    const getTokenBalances = async () => {
      if(provider === undefined || network === undefined || tokens?.length === 0){
        return;
      }
      const totalBalance = 0;

      const walletAddress = await provider.getSigner().getAddress();
      const tokenBalances: BalanceInfo[] = [];
      //get balance for native currency
      const nativeCurrencyBalance = await checkout.getBalance({
        provider,
        walletAddress
      });
      const nativeFormattedBalance = utils.formatUnits(nativeCurrencyBalance, 18);
        tokenBalances.push({
          balance: nativeFormattedBalance,
          name: NetworkCurrencyMap[networkName as Network],
          fiatAmount: '1214.78',
        });

      if (tokens !== undefined && tokens.length > 0) {
        for (const token of tokens) {
          const balanceResult = await checkout.getERC20Balance({
            provider,
            walletAddress,
            contractAddress: token.contractAddress
          });
          tokenBalances.push({
            balance: balanceResult.formattedBalance,
            fiatAmount: '23.50', // todo: fetch fiat price from coinGecko apis
            name: balanceResult.symbol,
            description: balanceResult.name
          });
          //totalBalance += //todo: use fiat price fetched above
        }
      }
      setTokenBalances(tokenBalances);
      setTotalFiatAmount(totalBalance);
    }
    getTokenBalances();
  }, [network, provider, tokens])

  const getNetworkName = (networkParam: EthersNetwork | undefined): string => {
    if(networkParam === undefined){
      return '';
    }
    const networkName = networkParam.name as ProviderIdentifiedNetwork;

    if(!Object.values(ProviderIdentifiedNetwork).includes(networkName)){
      return networkParam.name;
    }
    return NetworkNameMap[networkName];
  }

  const switchNetwork = async (network:Network) =>{
    await checkout.switchNetwork({
      network: network,
      provider: provider
    } as SwitchNetworkParams);
    setTokens([]);
    await getProvider();
  }

  return(
    <BiomeThemeProvider theme={{base: onDarkBase}}>
      <Box sx={WalletWidgetStyle}>
        <Box sx={WidgetHeaderStyle}>
          <NetworkStatus networkName={networkName} />
          <Button size={'small'} sx={{alignSelf:'flex-end'}}
            testId='close-button'
            onClick={() => console.log('closing wallet widget')}>x</Button>
        </Box>
        <TotalTokenBalance totalBalance={totalFiatAmount} />
        <Box sx={WidgetBodyStyle}>
          <TokenBalanceList balanceInfoItems={tokenBalances} />
        </Box>
        <Box sx={{display: 'flex', direction: 'row', justifyContent: 'space-between'}}>
          {NetworkNameMap[ProviderIdentifiedNetwork.GOERLI] !== networkName &&
          (<Button size={'small'}
                  testId='goerli-network-button'
                  onClick={() => switchNetwork(Network.GOERLI)}>
            <Badge isAnimated={false} />
            Switch to Goerli</Button>)}
          {NetworkNameMap[ProviderIdentifiedNetwork.HOMESTEAD] !== networkName && (
          <Button size={'small'}
            testId='eth-network-button'
            onClick={() => switchNetwork(Network.ETHEREUM)}>
            <Badge isAnimated={false} />
            Switch to Ethereum</Button>)}
          {NetworkNameMap[ProviderIdentifiedNetwork.MATIC] !== networkName && (
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
