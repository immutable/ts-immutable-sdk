import { TokenInfo } from '@imtbl/checkout-sdk';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { BridgeHero } from '../../../components/Hero/BridgeHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { text } from '../../../resources/text/textConfig';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';

export function MoveInProgress({ token }: { token: TokenInfo }) {
  const { heading, body1, body2 } = text.views[BridgeWidgetViews.IN_PROGRESS];

  return (
    <SimpleLayout
      testId="move-in-progress-view"
      header={(
        <HeaderNavigation
          transparent
          onCloseButtonClick={sendBridgeWidgetCloseEvent}
        />
      )}
      footer={(
        <FooterLogo />
      )}
      heroContent={<BridgeHero />}
      floatHeader
    >
      <SimpleTextBody heading={heading}>
        {body1(token.symbol)}
        <br />
        <br />
        {body2}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
