import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SimpleTextBody } from '../../components/Body/SimpleTextBody';
import { text } from '../../resources/text/textConfig';
import { SharedViews } from '../../context/view-context/ViewContext';
import { NoServiceHero } from '../../components/Hero/NoServiceHero';
import { FooterLogo } from '../../components/Footer/FooterLogo';

export interface SwapUnavailableErrorViewProps {
  onCloseClick: () => void;
}

export function SwapUnavailableErrorView({
  onCloseClick,
}: SwapUnavailableErrorViewProps) {
  const errorText = text.views[SharedViews.SWAP_UNAVAILABLE_ERROR_VIEW];

  return (
    <SimpleLayout
      header={
        <HeaderNavigation transparent onCloseButtonClick={onCloseClick} />
      }
      heroContent={<NoServiceHero />}
      floatHeader
      footer={<FooterLogo />}
      testId="swap-unavailable-error-view"
    >
      <SimpleTextBody heading={errorText.heading}>
        {errorText.body}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
