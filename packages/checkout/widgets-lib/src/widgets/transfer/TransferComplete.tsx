import {
  Stack, Box, Heading, Link, Button,
} from '@biom3/react';
import { BlockExplorerService } from '@imtbl/checkout-sdk';
import { useRive } from '@rive-app/react-canvas-lite';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { getRemoteRive } from '../../lib/utils';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { TransferCompleteState } from './context';

export function TransferComplete({
  config,
  viewState,
  onContinue,
}: {
  config: StrongCheckoutWidgetsConfig;
  viewState: TransferCompleteState;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  const { RiveComponent } = useRive({
    src: getRemoteRive(config.environment, '/swapping_coins.riv'),
    stateMachines: 'State',
    autoplay: true,
  });

  const explorerLink = useMemo(
    () =>
      BlockExplorerService.getTransactionLink(
        viewState.chainId,
        viewState.receipt.hash,
      ),
    [viewState.chainId, viewState.receipt.hash],
  );

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
          <Link rc={<a target="_blank" href={explorerLink} rel="noreferrer" />}>
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
