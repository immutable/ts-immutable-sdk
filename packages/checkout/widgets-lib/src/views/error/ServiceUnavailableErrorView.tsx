import { useTranslation } from 'react-i18next';
import { Box, Button, Link } from '@biom3/react';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SimpleTextBody } from '../../components/Body/SimpleTextBody';
import { NoServiceHero } from '../../components/Hero/NoServiceHero';
import { FooterLogo } from '../../components/Footer/FooterLogo';
import { ServiceType } from './serviceTypes';

export interface ServiceUnavailableErrorViewProps {
  service: ServiceType;
  onCloseClick: () => void;
  primaryActionText?: string;
  onPrimaryButtonClick?: () => void;
  secondaryActionText?: string;
  onSecondaryButtonClick?: () => void;
}

export function ServiceUnavailableErrorView({
  service,
  onCloseClick,
  primaryActionText,
  onPrimaryButtonClick,
  secondaryActionText,
  onSecondaryButtonClick,
}: ServiceUnavailableErrorViewProps) {
  const { t } = useTranslation();

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
      <SimpleTextBody heading={t(`views.SERVICE_UNAVAILABLE_ERROR_VIEW.heading.${service}`)}>
        {t('views.SERVICE_UNAVAILABLE_ERROR_VIEW.body')}
        <Link
          size="small"
          rc={<a target="_blank" href={t('views.SERVICE_UNAVAILABLE_ERROR_VIEW.ctaLinkUrl')} rel="noreferrer" />}
        >
          {t('views.SERVICE_UNAVAILABLE_ERROR_VIEW.ctaLinkText')}
        </Link>
        {t('views.SERVICE_UNAVAILABLE_ERROR_VIEW.cta')}
      </SimpleTextBody>

      <Box
        testId="button-container"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >

        {primaryActionText && onPrimaryButtonClick && (
        <Box
          sx={{
            paddingX: 'base.spacing.x4',
            paddingBottom: 'base.spacing.x2',
          }}
        >
          <Button
            sx={{ width: '100%' }}
            testId="primary-action-button"
            variant="primary"
            size="large"
            onClick={onPrimaryButtonClick}
          >
            {primaryActionText}
          </Button>
        </Box>
        )}

        {secondaryActionText && onSecondaryButtonClick && (
        <Box
          sx={{
            paddingX: 'base.spacing.x4',
            paddingBottom: 'base.spacing.x2',
          }}
        >
          <Button
            sx={{ width: '100%' }}
            testId="secondary-action-button"
            variant="secondary"
            size="large"
            onClick={onSecondaryButtonClick}
          >
            {secondaryActionText}
          </Button>
        </Box>
        )}
      </Box>
    </SimpleLayout>
  );
}
