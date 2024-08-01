import { Box, Button, Link } from '@biom3/react';
import { Trans, useTranslation } from 'react-i18next';
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
        <Trans
          i18nKey={t(`views.SERVICE_UNAVAILABLE_ERROR_VIEW.body.${service}`)}
          components={{
            quickswapLink: <Link
              size="small"
              rc={<a target="_blank" href="https://quickswap.exchange" rel="noreferrer" />}
            />,
            immutableSupport: <Link
              size="small"
              rc={<a target="_blank" href="https://support.immutable.com/" rel="noreferrer" />}
            />,
          }}
        />
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
