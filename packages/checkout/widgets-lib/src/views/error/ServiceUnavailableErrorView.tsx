import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SimpleTextBody } from '../../components/Body/SimpleTextBody';
import { text } from '../../resources/text/textConfig';
import { SharedViews } from '../../context/view-context/ViewContext';
import { NoServiceHero } from '../../components/Hero/NoServiceHero';
import { FooterLogo } from '../../components/Footer/FooterLogo';

export interface ServiceUnavailableErrorViewProps {
  service: string;
  onCloseClick: () => void;
}

export function ServiceUnavailableErrorView({
  service,
  onCloseClick,
}: ServiceUnavailableErrorViewProps) {
  const errorText = text.views[SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW];

  return (
    <SimpleLayout
      header={
        <HeaderNavigation transparent onCloseButtonClick={onCloseClick} />
      }
      heroContent={<NoServiceHero />}
      floatHeader
      footer={<FooterLogo />}
      testId="service-unavailable-error-view"
    >
      <SimpleTextBody heading={errorText.heading(service)}>
        {errorText.body}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
