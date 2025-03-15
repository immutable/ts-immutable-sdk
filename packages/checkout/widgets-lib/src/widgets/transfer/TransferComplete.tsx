import {
  Stack, Box, Heading, Link, Button,
} from '@biom3/react';
import { ChainId, BlockExplorerService } from '@imtbl/checkout-sdk';
import { useRive } from '@rive-app/react-canvas-lite';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { getRemoteRive } from '../../lib/utils';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';

export function TransferComplete({
  config,
  chainId,
  onContinue,
  txHash,
}: {
  config: StrongCheckoutWidgetsConfig;
  chainId: ChainId;
  onContinue: () => void;
  txHash: string;
}) {
  const { t } = useTranslation();
  const { RiveComponent } = useRive({
    src: getRemoteRive(config.environment, '/swapping_coins.riv'),
    stateMachines: 'State',
    autoplay: true,
  });

  const explorerLink = useMemo(() => BlockExplorerService.getTransactionLink(chainId, txHash), [chainId, txHash]);

  return (
    <SimpleLayout containerSx={{ bg: 'transparent' }}>
      <Stack
        justifyContent="space-between"
        sx={{
          height: '100%',
          mb: 'base.spacing.x10',
          textAlign: 'center',
        }}
      >
        <Box>
          <Box sx={{ height: '240px' }} rc={<RiveComponent />} />
          <Heading sx={{ mb: 'base.spacing.x4', mx: 'base.spacing.x4' }}>
            {t('views.TRANSFER.content.tokensSentSuccessfully')}
          </Heading>
          <Link
            rc={(
              <a
                target="_blank"
                href={explorerLink}
                rel="noreferrer"
              />
            )}
          >
            {t('views.TRANSFER.content.seeTransactionOnImmutableZkEVM')}
          </Link>
        </Box>
        <Box sx={{ mx: 'base.spacing.x4' }}>
          <Button sx={{ width: '100%' }} onClick={onContinue} size="large">
            {t('views.TRANSFER.form.continueButtonText')}
          </Button>
        </Box>
      </Stack>
    </SimpleLayout>
  );
}
