import {
  Body, Box, ButtCon, Drawer, Heading,
} from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { BrowserProvider } from 'ethers';
import { TransferAssetsL1WarningHero } from '../../../components/Hero/TransferAssetsL1WarningHero';
import { WalletAddress } from './WalletAddress/WalletAddress';

export function TransferAssetsL1Warning({
  provider,
  showL1Warning,
  setShowL1Warning,
}: {
  provider?: BrowserProvider;
  showL1Warning: boolean;
  setShowL1Warning: (show: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <Drawer size="full" visible={showL1Warning} showHeaderBar={false}>
      <Drawer.Content>
        <ButtCon
          icon="Close"
          variant="tertiary"
          sx={{
            pos: 'absolute',
            top: 'base.spacing.x5',
            left: 'base.spacing.x5',
            backdropFilter: 'blur(30px)',
          }}
          onClick={() => setShowL1Warning(false)}
        />
        <TransferAssetsL1WarningHero />
        <Box sx={{ px: 'base.spacing.x6' }}>
          <Heading
            sx={{
              marginTop: 'base.spacing.x6',
              marginBottom: 'base.spacing.x2',
              textAlign: 'center',
            }}
          >
            {t('views.SETTINGS.transferAssetsL1Warning.heading')}
          </Heading>
          <Body
            size="medium"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: 'base.color.text.body.secondary',
              marginBottom: 'base.spacing.x13',
            }}
          >
            {t('views.SETTINGS.transferAssetsL1Warning.body')}
          </Body>
          <WalletAddress
            provider={provider}
            showL1Warning={showL1Warning}
            setShowL1Warning={setShowL1Warning}
          />
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}
