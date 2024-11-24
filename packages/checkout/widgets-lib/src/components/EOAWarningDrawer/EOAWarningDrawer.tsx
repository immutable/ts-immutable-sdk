import {
  Box,
  Button,
  Divider,
  Drawer,
  Heading,
} from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { WarningHero } from '../Hero/WarningHero';

export function EOAWarningDrawer({
  visible,
  onProceedClick,
  onCloseDrawer,
}: {
  visible: boolean;
  onProceedClick: () => void;
  onCloseDrawer: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Drawer
      size="threeQuarter"
      visible={visible}
      showHeaderBar={false}
    >
      <Drawer.Content>
        <Box
          sx={{ mx: 'base.spacing.x6', mt: 'base.spacing.x10' }}
        >
          <WarningHero />
          <Divider
            size="xSmall"
            textAlign="center"
            sx={{ mb: 'base.spacing.x2' }}
          >
            {t('drawers.eoaWarning.dividerText')}
          </Divider>
          <Box sx={{ px: 'base.spacing.x4' }}>
            <Heading
              size="small"
              sx={{
                mb: 'base.spacing.x8',
                textAlign: 'center',
              }}
            >
              {t('drawers.eoaWarning.heading')}
            </Heading>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
            }}
          >
            <Button
              sx={{ width: '100%', mb: 'base.spacing.x2' }}
              testId="non-passport-cta-button"
              variant="primary"
              size="large"
              onClick={onCloseDrawer}
            >
              {t('drawers.eoaWarning.passportButtonText')}
            </Button>

            <Button
              sx={{ width: '100%', marginBottom: 'base.spacing.x10' }}
              testId="non-passport-cta-button"
              variant="tertiary"
              size="large"
              onClick={onProceedClick}
            >
              {t('drawers.eoaWarning.proceedButtonText')}
            </Button>
          </Box>
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}
