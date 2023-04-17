import {Badge, BiomeThemeProvider, Body, Box, Button} from "@biom3/react";
import {BaseTokens, onDarkBase, onLightBase} from "@biom3/design-tokens";

import {WidgetTheme, Network} from "@imtbl/checkout-ui-types";

import {
  ChainId,
  Checkout,
  ConnectionProviders,
  ConnectResult,
  SwitchNetworkParams
} from "@imtbl/checkout-sdk-web";

import {useCallback, useEffect, useMemo, useState} from "react";
import {Web3Provider} from "@ethersproject/providers";
import {WalletWidgetStyle, WidgetBodyStyle, WidgetHeaderStyle} from "./WalletStyles";
import {NetworkStatus} from "./components/NetworkStatus";
import {TotalTokenBalance} from "./components/TotalTokenBalance";
import {TokenBalanceList} from "./components/TokenBalanceList";
import {BalanceInfo} from "./components/BalanceItem";
import {sendNetworkSwitchEvent, sendWalletWidgetCloseEvent} from "./WalletWidgetEvents";

export interface WalletWidgetProps {
  params: WalletWidgetParams;
  theme: WidgetTheme;
}

export interface WalletWidgetParams {
  providerPreference?: ConnectionProviders;
}

export function WalletWidget(props:WalletWidgetProps) {
  const { params, theme } = props;
  const biomeTheme:BaseTokens = (theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()) ? onLightBase : onDarkBase

  const [provider, setProvider] = useState<Web3Provider>();
  const [networkName, setNetworkName] = useState<string>("");
  const [tokenBalances, setTokenBalances] = useState<BalanceInfo[]>();
  const [ totalFiatAmount, setTotalFiatAmount] = useState(0.0);
  const[isLoading, setIsLoading] = useState(false);
  const checkout = useMemo(() => new Checkout(), []);

  const getTokenBalances = useCallback(async (checkout: Checkout, provider: Web3Provider, networkName: string, chainId: ChainId) => {
    const totalBalance = 0;
    const walletAddress = await provider.getSigner().getAddress();
    const getAllBalancesResult = await checkout.getAllBalances({
      provider,
      walletAddress,
      chainId
    });
    
    const tokenBalances: BalanceInfo[] = [];
    getAllBalancesResult.balances.forEach((balance) => {
      tokenBalances.push({
        id: networkName + '-' + balance.token.symbol,
        balance: balance.formattedBalance,
        fiatAmount: '23.50', // todo: fetch fiat price from coinGecko apis
        symbol: balance.token.symbol,
        description: balance.token.name
      })
    });

    setTokenBalances(tokenBalances);
    setTotalFiatAmount(totalBalance);
  }, []);

  const getProvider = useCallback(async() => {
    if(checkout) {
      const providerPreference = params.providerPreference ?? ConnectionProviders.METAMASK;
      
      const connectResult: ConnectResult = await checkout.connect({
        providerPreference
      });

      const networkName = connectResult.network.name as Network;
      const chainId = connectResult.network.chainId as ChainId;
      await getTokenBalances(checkout, connectResult.provider, networkName, chainId);

      setNetworkName(networkName);
      setProvider(connectResult.provider);
    }
  }, [checkout, params.providerPreference, getTokenBalances]);

  useEffect(() => {
    getProvider();
  }, [getProvider]);

  const switchNetwork = async (chainId: ChainId) => {
    setIsLoading(true);
    try{
      const switchedNetwork = await checkout.switchNetwork({
        provider: provider,
        chainId: chainId
      } as SwitchNetworkParams);
      await getProvider();
      sendNetworkSwitchEvent(switchedNetwork.network);
    } catch(err) {
      // user proably rejected the switch network request
      // should we do anything here...
    } finally {
      setIsLoading(false);
    }
  }

  return(
    <BiomeThemeProvider theme={{base: biomeTheme}}>
      <Box sx={WalletWidgetStyle}>
        <Box sx={WidgetHeaderStyle}>
          <NetworkStatus networkName={networkName} />
          <Button size={'small'} sx={{alignSelf:'flex-end'}}
            testId='close-button'
            onClick={() => sendWalletWidgetCloseEvent()}>x</Button>
        </Box>
        <TotalTokenBalance totalBalance={totalFiatAmount} />
        <Box sx={WidgetBodyStyle}>
          {!isLoading && <TokenBalanceList balanceInfoItems={tokenBalances} />}
          {isLoading && <Box sx={{width: '100%', height: '100px'}}><Body>Loading</Body></Box>}
        </Box>
        {networkName && (<Box sx={{display: 'flex', direction: 'row', justifyContent: 'space-between'}}>
          {Network.GOERLI !== networkName &&
          (<Button size={'small'}
                  testId='goerli-network-button'
                  onClick={() => switchNetwork(ChainId.GOERLI)}>
            <Badge isAnimated={false} />
            Switch to Goerli</Button>)}
          {Network.ETHEREUM !== networkName && (
          <Button size={'small'}
            testId='eth-network-button'
            onClick={() => switchNetwork(ChainId.ETHEREUM)}>
            <Badge isAnimated={false} />
            Switch to Ethereum</Button>)}
          {Network.POLYGON !== networkName && (
          <Button size={'small'}
            testId='polygon-network-button'
            onClick={() => switchNetwork(ChainId.POLYGON)}>
            <Badge isAnimated={false} />
            Switch to Polygon</Button>)}
        </Box>)}
      </Box>
    </BiomeThemeProvider>
  )
}
