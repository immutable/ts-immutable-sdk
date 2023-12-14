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
import { Box, Link, MenuItem } from '@biom3/react';
import { isPassportProvider } from 'lib/providerUtils';
import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout, GetBalanceResult, TokenInfo, WalletProviderName,
} from '@imtbl/checkout-sdk';
import { sendBridgeWidgetCloseEvent } from '../../widgets/bridge/BridgeWidgetEvents';
import { TransactionsInProgress } from './SectionInProgress';
import { Shimmer } from './Shimmer';
import { transactionsListStyle } from './indexStyles';
import { EmptyStateNotConnected } from './EmptyStateNotConnected';

type TransactionsProps = {
  checkout: Checkout
};

export function Transactions({ checkout }: TransactionsProps) {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { layoutHeading, passportDashboard } = text.views[BridgeWidgetViews.TRANSACTIONS];

  const [loading, setLoading] = useState(true);
  const [knownTokens, setKnownTokens] = useState<TokenInfo[] | undefined>(undefined);

  const [provider, setProvider] = useState<Web3Provider | undefined>(undefined);

  const chains = useMemo(() => Array.from(checkout.config.networkMap.keys()), []);

  const walletAddress = useCallback(async () => await provider?.getSigner().getAddress(), [provider]);
  const isPassport = isPassportProvider(provider);

  const getBalanceByChainID = async (web3provider: Web3Provider, chain: number) => {
    const address = await walletAddress();
    const data = await checkout.getAllBalances({
      provider: web3provider,
      walletAddress: address!,
      chainId: chain,
    });
    return data.balances;
  };

  const allTokens = useCallback(async () => {
    if (!checkout || !provider || !walletAddress || !chains) return [];

    const promises: Promise<GetBalanceResult[]>[] = [];
    chains.forEach((chain) => promises.push(getBalanceByChainID(provider, chain)));

    const allBalances = await Promise.allSettled(promises);

    const values: GetBalanceResult[] = [];
    allBalances.forEach((b) => {
      if (b.status === 'fulfilled') values.push(...b.value);
    });

    return values.map((v) => v.token);
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
      setKnownTokens(tokens);
      setLoading(false);
    })();
  }, [walletAddress, chains]);

  useEffect(() => console.log(knownTokens), [knownTokens]);

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
      <Box sx={{ px: 'base.spacing.x4' }}>
        {
          !provider
            ? <EmptyStateNotConnected />
            : (
              <Box sx={transactionsListStyle(isPassport)}>
                {loading ? <Shimmer /> : <TransactionsInProgress />}
              </Box>
            )
        }
        {isPassport && (
        <MenuItem emphasized>
          <MenuItem.Label sx={{ fontWeight: 'normal' }}>
            {passportDashboard}
            {' '}
            <Link size="small" rc={<a href="https://passport.immutable.com" />}>
              Passport
            </Link>
          </MenuItem.Label>
        </MenuItem>
        )}
      </Box>
    </SimpleLayout>
  );
}
