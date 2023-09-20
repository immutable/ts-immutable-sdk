import { Link } from '@biom3/react';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { FooterButton } from '../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SatelliteHero } from '../../components/Hero/SatelliteHero';
import { SimpleTextBody } from '../../components/Body/SimpleTextBody';
import { text } from '../../resources/text/textConfig';
import { SharedViews } from '../../context/view-context/ViewContext';

export interface ErrorViewProps {
  actionText: string;
  onActionClick: () => void;
  errorEventAction?: () => void;
  errorEventActionLoading?: boolean
  onCloseClick: () => void;
}

export function ErrorView({
  actionText,
  onActionClick,
  errorEventAction,
  errorEventActionLoading = false,
  onCloseClick,
}: ErrorViewProps) {
  const errorText = text.views[SharedViews.ERROR_VIEW];

  if (typeof errorEventAction === 'function') errorEventAction();

  const onErrorActionClick = () => typeof onActionClick === 'function' && onActionClick();

  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          transparent
          onCloseButtonClick={onCloseClick}
        />
      )}
      footer={(
        <FooterButton
          loading={errorEventActionLoading}
          actionText={actionText}
          onActionClick={onErrorActionClick}
        />
      )}
      heroContent={<SatelliteHero />}
      floatHeader
      testId="error-view"
    >
      <SimpleTextBody heading={errorText.heading}>
        {errorText.body[0]}
        {' '}
        <Link
          size="small"
          rc={
            <a href="https://support.immutable.com/en/" />
          }
        >
          {errorText.body[1]}
        </Link>
        {' '}
        {errorText.body[2]}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
