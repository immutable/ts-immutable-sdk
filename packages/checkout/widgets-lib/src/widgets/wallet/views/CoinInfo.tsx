import { useContext, useEffect } from 'react';
import { Link } from '@biom3/react';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { text } from '../../../resources/text/textConfig';
import { WalletWidgetViews } from '../../../context/view-context/WalletViewContextTypes';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { IMXCoinsHero } from '../../../components/Hero/IMXCoinsHero';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { isPassportProvider } from '../../../lib/providerUtils';
import { FAQS_LINK } from '../../../lib';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';

export function CoinInfo() {
  const { connectLoaderState: { provider } } = useContext(ConnectLoaderContext);
  const coinInfoText = text.views[WalletWidgetViews.COIN_INFO];
  const isPassport = isPassportProvider(provider);
  const { heading, body } = coinInfoText.metamask;
  const {
    heading: passportHeading, body1, body2, linkText,
  } = coinInfoText.passport;

  const { page } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.WALLET,
      screen: 'CoinInfo',
    });
  }, []);

  return (
    <SimpleLayout
      testId="coin-info"
      header={<HeaderNavigation showBack transparent />}
      footer={<FooterLogo />}
      heroContent={<IMXCoinsHero />}
      floatHeader
    >
      {!isPassport && <SimpleTextBody heading={heading}>{body}</SimpleTextBody>}
      {isPassport && (
      <SimpleTextBody heading={passportHeading}>
        {body1}
        <Link onClick={() => window.open(FAQS_LINK)}>{linkText}</Link>
        {body2}
      </SimpleTextBody>
      )}
    </SimpleLayout>
  );
}
