import { useContext, useEffect } from 'react';
import { Link } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { IMXCoinsHero } from '../../../components/Hero/IMXCoinsHero';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { isPassportProvider } from '../../../lib/provider';
import { FAQS_LINK } from '../../../lib';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';

export function CoinInfo() {
  const { t } = useTranslation();
  const { connectLoaderState: { provider } } = useContext(ConnectLoaderContext);
  const isPassport = isPassportProvider(provider);

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
      {!isPassport && (
        <SimpleTextBody heading={t('views.COIN_INFO.metamask.heading')}>
          {t('views.COIN_INFO.metamask.body')}
        </SimpleTextBody>
      )}
      {isPassport && (
      <SimpleTextBody heading={t('views.COIN_INFO.passport.heading')}>
        {t('views.COIN_INFO.passport.body1')}
        <Link onClick={() => window.open(FAQS_LINK)}>{t('views.COIN_INFO.passport.linkText')}</Link>
        {t('views.COIN_INFO.passport.body2')}
      </SimpleTextBody>
      )}
    </SimpleLayout>
  );
}
