import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { text } from '../../../resources/text/textConfig';
import { WalletWidgetViews } from '../../../context/view-context/WalletViewContextTypes';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { IMXCoinsHero } from '../../../components/Hero/IMXCoinsHero';

export function CoinInfo() {
  const { heading, body } = text.views[WalletWidgetViews.COIN_INFO];

  return (
    <SimpleLayout
      testId="coin-info"
      header={<HeaderNavigation showBack transparent />}
      footer={<FooterLogo />}
      heroContent={<IMXCoinsHero />}
      floatHeader
    >
      <SimpleTextBody heading={heading}>{body}</SimpleTextBody>
    </SimpleLayout>
  );
}
