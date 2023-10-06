import { useContext } from 'react';
import { OnRampWidgetViews } from '../../../context/view-context/OnRampViewContextTypes';
import { text } from '../../../resources/text/textConfig';
import { sendOnRampWidgetCloseEvent } from '../OnRampWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { SpendingCapHero } from '../../../components/Hero/SpendingCapHero';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';

export function OrderInProgress() {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { heading, body1, body2 } = text.views[OnRampWidgetViews.ONRAMP][OnRampWidgetViews.IN_PROGRESS].content;

  return (
    <SimpleLayout
      testId="order-in-progress-view"
      header={(
        <HeaderNavigation
          transparent
          onCloseButtonClick={() => sendOnRampWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={(
        <FooterLogo />
      )}
      heroContent={<SpendingCapHero />}
      floatHeader
    >
      <SimpleTextBody heading={heading}>
        {body1}
        <br />
        <br />
        {body2}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
