import { Box, Button, Heading } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SanctionsHero } from '../../components/Hero/SanctionsHero';

export interface ServiceUnavailableErrorViewProps {
  onCloseClick: () => void;
  onBackButtonClick?: () => void;
}

export function ServiceUnavailableErrorView({
  onCloseClick,
  onBackButtonClick,
}: ServiceUnavailableErrorViewProps) {
  const { t } = useTranslation();

  return (
    <SimpleLayout
      header={
        <HeaderNavigation transparent onCloseButtonClick={onCloseClick} />
      }
      heroContent={<SanctionsHero />}
      floatHeader
      testId="service-unavailable-error-view"
    >
      <Box
        sx={{
          textAlign: 'center',
          fontSize: 'base.type.size.x10',
          paddingLeft: 'base.spacing.x20',
          paddingRight: 'base.spacing.x20',
        }}
      >
        <Heading size="medium">{t('views.SERVICE_UNAVAILABLE_SANCTIONS_ERROR_VIEW.heading')}</Heading>
      </Box>

      <Box
        testId="button-container"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >

        {onBackButtonClick && (
          <Box
            sx={{
              paddingX: 'base.spacing.x4',
              paddingBottom: 'base.spacing.x15',
            }}
          >
            <Button
              sx={{ width: '100%' }}
              testId="primary-action-button"
              variant="secondary"
              size="large"
              onClick={onBackButtonClick}
            >
              {t('views.SERVICE_UNAVAILABLE_SANCTIONS_ERROR_VIEW.actionText')}
            </Button>
          </Box>
        )}
      </Box>
    </SimpleLayout>
  );
}
