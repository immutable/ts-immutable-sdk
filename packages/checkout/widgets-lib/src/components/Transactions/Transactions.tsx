import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import {
  useCallback,
  useContext, useEffect, useMemo, useState,
} from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { text } from 'resources/text/textConfig';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { Box } from '@biom3/react';
import { isPassportProvider } from 'lib/providerUtils';
import { Web3Provider } from '@ethersproject/providers';
import {
  ChainId,
  Checkout, TokenInfo, WalletProviderName,
} from '@imtbl/checkout-sdk';
import { sendBridgeWidgetCloseEvent } from '../../widgets/bridge/BridgeWidgetEvents';
import { TransactionsInProgress } from './TransactionsInProgress';
import { Shimmer } from './Shimmer';
import {
  supportBoxContainerStyle,
  transactionsContainerStyle,
  transactionsListContainerStyle,
  transactionsListStyle,
} from './TransactionsStyles';
import { EmptyStateNotConnected } from './EmptyStateNotConnected';
import { SupportMessage } from './SupportMessage';

type TransactionsProps = {
  checkout: Checkout
};

export function Transactions({ checkout }: TransactionsProps) {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { layoutHeading } = text.views[BridgeWidgetViews.TRANSACTIONS];

  const [loading, setLoading] = useState(true);

  const [knownTokenMap, setKnownTokenMap] = useState<Map<ChainId, TokenInfo[]> | undefined>(undefined);

  const [provider, setProvider] = useState<Web3Provider | undefined>(undefined);

  const chains = useMemo(() => Array.from(checkout.config.networkMap.keys()), []);

  const walletAddress = useCallback(async () => await provider?.getSigner().getAddress(), [provider]);
  const isPassport = isPassportProvider(provider);

  // const getBalanceByChainID = async (web3provider: Web3Provider, chain: number) => {
  //   const address = await walletAddress();
  //   const data = await checkout.getAllBalances({
  //     provider: web3provider,
  //     walletAddress: address!,
  //     chainId: chain,
  //   });
  //   return data.balances;
  // };

  const allTokens = useCallback(async () => {
    const tokenMap: Map<ChainId, TokenInfo[]> = new Map();

    if (!checkout || !provider || !walletAddress || !chains) return tokenMap;

    await Promise.all(chains.map(async (chain) => {
      const allowedTokens = (await checkout.config.remote.getTokensConfig(chain)).allowed;
      if (allowedTokens) {
        const tokens: TokenInfo[] = [];
        tokens.push(...allowedTokens);
        tokenMap.set(chain, tokens);
      }
    }));

    // const promises: Promise<GetBalanceResult[]>[] = [];
    // chains.forEach((chain) => promises.push(getBalanceByChainID(provider, chain)));
    //
    // const allBalances = await Promise.allSettled(promises);
    //
    // const values: GetBalanceResult[] = [];
    // allBalances.forEach((b) => {
    //   if (b.status === 'fulfilled') values.push(...b.value);
    // });

    return tokenMap;
  }, [checkout, provider, walletAddress, chains]);

  useEffect(() => {
    (async () => {
      const p = await checkout.createProvider({ walletProviderName: WalletProviderName.METAMASK });
      setProvider(p.provider);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const tokens = await allTokens();
      setKnownTokenMap(tokens);
      setLoading(false);
    })();
  }, [walletAddress, chains]);

  useEffect(() => console.log(knownTokenMap), [knownTokenMap]);

  return (
    <SimpleLayout
      testId="bridge-view"
      header={(
        <HeaderNavigation
          showBack
          title={layoutHeading}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box
        sx={transactionsContainerStyle}
      >
        <Box
          sx={transactionsListContainerStyle}
        >
          {
            !provider
              ? <EmptyStateNotConnected />
              : (
                <Box sx={transactionsListStyle(isPassport)}>
                  {loading ? <Shimmer /> : <TransactionsInProgress checkout={checkout} />}
                </Box>
              )
          }
        </Box>
        {provider && (
          <Box
            sx={supportBoxContainerStyle}
          >
            <SupportMessage
              checkout={checkout}
              isPassport={isPassport}
            />
          </Box>
        )}
      </Box>
    </SimpleLayout>
  );
}
