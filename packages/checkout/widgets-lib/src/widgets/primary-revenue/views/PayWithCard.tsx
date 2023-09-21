/* eslint-disable no-console */
import { BiomeCombinedProviders, Box } from '@biom3/react';
// import { useContext } from 'react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { Passport } from '@imtbl/passport';
import { useContext, useEffect, useState } from 'react';
import { WidgetTheme } from '../../../lib';
// import {
//   SharedViews,
//   ViewContext,
// } from '../../../context/view-context/ViewContext';
// import { LoadingView } from '../../../views/loading/LoadingView';
// import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';
// import { text } from '../../../resources/text/textConfig';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { TransakIframe } from '../components/TransakIframe';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';

export interface PayWithCardProps {
  config: StrongCheckoutWidgetsConfig;
  passport: Passport | undefined;
}

export function PayWithCard({ config, passport }: PayWithCardProps) {
  const { theme } = config;
  // const { initialLoadingText } = text.views[PrimaryRevenueWidgetViews.PAY_WITH_CARD];
  // const { viewState } = useContext(ViewContext);

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const [email, setEmail] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isPassport, setIsPassport] = useState<boolean>(false);

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { provider } = connectLoaderState;

  useEffect(() => {
    (async () => {
      setIsPassport(!!(provider?.provider as any)?.isPassport);
      setWalletAddress(await provider!.getSigner().getAddress());
      setEmail((await passport?.getUserInfo())?.email || '');
    })();
  }, []);

  const onOpen = () => {
    console.log('onOpen');
  };

  const onOrderCreated = () => {
    console.log('onOrderCreated');
  };

  const onOrderProcessing = () => {
    console.log('onOrderProcessing');
  };

  const onOrderCompleted = () => {
    console.log('onOrderCompleted');
  };

  const onOrderFailed = () => {
    console.log('onOrderFailed');
  };

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <Box>
        <SimpleLayout
          header={(
            <HeaderNavigation
              showBack
              title="Pay with Card"
              onCloseButtonClick={() => {}}
            />
          )}
          footerBackgroundColor="base.color.translucent.emphasis.200"
        >
          <TransakIframe
            id="123"
            src="http://www.google.com/"
            email={email}
            walletAddress={walletAddress}
            isPassportWallet={isPassport}
            onOpen={onOpen}
            onOrderCreated={onOrderCreated}
            onOrderProcessing={onOrderProcessing}
            onOrderCompleted={onOrderCompleted}
            onOrderFailed={onOrderFailed}
          />
        </SimpleLayout>
      </Box>
    </BiomeCombinedProviders>
  );
}
