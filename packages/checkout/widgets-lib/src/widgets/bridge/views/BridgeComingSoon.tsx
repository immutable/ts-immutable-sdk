import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { ImmutablePlanetHero } from '../../../components/Hero/ImmutablePlanetHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { text } from '../../../resources/text/textConfig';

interface BridgeComingSoonProps {
  onCloseEvent: () => void;
}

export function BridgeComingSoon({ onCloseEvent }: BridgeComingSoonProps) {
  const { heading, body, actionText } = text.views[BridgeWidgetViews.BRIDGE_COMING_SOON];
  return (
    <SimpleLayout
      testId="bridge-coming-soon"
      header={<HeaderNavigation transparent onCloseButtonClick={onCloseEvent} />}
      heroContent={<ImmutablePlanetHero />}
      floatHeader
      footer={<FooterButton actionText={actionText} onActionClick={onCloseEvent} />}
    >
      <SimpleTextBody heading={heading}>
        {body}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
