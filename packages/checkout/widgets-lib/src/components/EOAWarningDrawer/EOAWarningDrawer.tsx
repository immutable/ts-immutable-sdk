import {
  Box,
  Button,
  Divider,
  Drawer,
  Heading,
} from '@biom3/react';
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
            WARNING
          </Divider>
          <Box sx={{ px: 'base.spacing.x4' }}>
            <Heading
              size="small"
              sx={{
                mb: 'base.spacing.x8',
                textAlign: 'center',
              }}
            >
              You could lose sight of your assets if you don’t deliver them to Passport
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
              Deliver to Passport instead
            </Button>

            <Button
              sx={{ width: '100%', marginBottom: 'base.spacing.x10' }}
              testId="non-passport-cta-button"
              variant="tertiary"
              size="large"
              onClick={onProceedClick}
            >
              Proceed anyway
            </Button>
          </Box>
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}
