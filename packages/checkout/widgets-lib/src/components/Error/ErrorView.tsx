import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { FooterButton } from '../Footer/FooterButton';
import { HeaderNavigation } from '../Header/HeaderNavigation';
import { SatelliteHero } from '../Hero/SatelliteHero';
import { SimpleTextBody } from '../Body/SimpleTextBody';
import { Link } from '@biom3/react';
import { BaseViews } from '../../context/ViewContext';
import { text } from '../../resources/text/textConfig';

export interface ErrorViewProps {
  actionText: string;
  onActionClick: () => void;
  errorEventAction?: () => void;
  onCloseClick: () => void;
}

export const ErrorView = ({
  actionText,
  onActionClick,
  errorEventAction,
  onCloseClick,
}: ErrorViewProps) => {
  const errorText = text.views[BaseViews.ERROR];

  if (typeof errorEventAction === 'function') errorEventAction();

  const onErrorActionClick = () =>
    typeof onActionClick === 'function' && onActionClick();

  return (
    <SimpleLayout
      header={
        <HeaderNavigation
          showBack={true}
          transparent={true}
          onCloseButtonClick={onCloseClick}
        />
      }
      footer={
        <FooterButton
          actionText={actionText}
          onActionClick={onErrorActionClick}
        />
      }
      heroContent={<SatelliteHero />}
      floatHeader={true}
    >
      <SimpleTextBody heading={errorText.heading}>
        {errorText.body[0]}{' '}
        <Link size="small" href="https://support.immutable.com/en/">
          {errorText.body[1]}
        </Link>{' '}
        {errorText.body[2]}
      </SimpleTextBody>
    </SimpleLayout>
  );
};
