import {
  Body,
  Box,
  Button,
  Drawer,
  Heading,
} from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { RouteData } from '../../lib/squid/types';
import { NoGasHero } from '../Hero/NoGasHero';

export function NotEnoughGasDrawer({
  visible,
  routeData,
  onTryAgainClick,
  onToolkitClick,
}: {
  visible: boolean;
  routeData?: RouteData;
  onTryAgainClick: () => void;
  onToolkitClick: () => void;
}) {
  const { t } = useTranslation();
  const tokenName = routeData?.route.route.estimate.gasCosts[0].token.name;

  return (
    <Drawer
      size="full"
      visible={visible}
      showHeaderBar={false}
    >
      <Drawer.Content sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      >
        <NoGasHero />

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 'base.spacing.x8',
        }}
        >
          <Heading
            size="small"
            sx={{ textAlign: 'center', paddingX: 'base.spacing.x6', marginBottom: 'base.spacing.x3' }}
          >
            {t('views.ADD_TOKENS.noGasDrawer.heading', { token: tokenName })}
          </Heading>

          <Body sx={{
            color: 'base.color.text.body.secondary',
            textAlign: 'center',
            paddingX: 'base.spacing.x6',
          }}
          >
            {t('views.ADD_TOKENS.noGasDrawer.body')}
          </Body>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            paddingX: 'base.spacing.x6',
            width: '100%',
            mb: 'base.spacing.x2',
          }}
        >
          <Button
            sx={{ width: '100%', mb: 'base.spacing.x4' }}
            testId="non-passport-cta-button"
            variant="primary"
            size="large"
            onClick={onTryAgainClick}
          >
            {t('views.ADD_TOKENS.noGasDrawer.primaryAction')}
          </Button>

          <Button
            sx={{ width: '100%', marginBottom: 'base.spacing.x10' }}
            testId="non-passport-cta-button"
            variant="tertiary"
            size="large"
            onClick={onToolkitClick}
          >
            {t('views.ADD_TOKENS.noGasDrawer.secondaryAction', { token: tokenName })}
          </Button>
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}
