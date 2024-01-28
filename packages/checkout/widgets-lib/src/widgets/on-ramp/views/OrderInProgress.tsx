import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { sendOnRampWidgetCloseEvent } from '../OnRampWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { SpendingCapHero } from '../../../components/Hero/SpendingCapHero';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';

export function OrderInProgress() {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { t } = useTranslation();

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
      <SimpleTextBody heading={t('views.ONRAMP.IN_PROGRESS.content.heading')}>
        {t('views.ONRAMP.IN_PROGRESS.content.body1')}
        <br />
        <br />
        {t('views.ONRAMP.IN_PROGRESS.content.body2')}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
