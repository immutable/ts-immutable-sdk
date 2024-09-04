import { Link } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { FooterButton } from '../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SatelliteHero } from '../../components/Hero/SatelliteHero';
import { SimpleTextBody } from '../../components/Body/SimpleTextBody';

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
  const { t } = useTranslation();

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
      <SimpleTextBody heading={t('views.ERROR_VIEW.heading')}>
        {t('views.ERROR_VIEW.body', { returnObjects: true })[0]}
        {' '}
        <Link
          size="small"
          rc={
            <a href="https://support.immutable.com/hc" />
          }
        >
          {t('views.ERROR_VIEW.body', { returnObjects: true })[1]}
        </Link>
        {' '}
        {t('views.ERROR_VIEW.body', { returnObjects: true })[2]}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
