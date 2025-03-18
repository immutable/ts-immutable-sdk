import {
  Stack, Box, Heading, Body,
} from '@biom3/react';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas-lite';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { getRemoteRive } from '../../lib/utils';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';

export function AwaitingApproval({ config }: { config: StrongCheckoutWidgetsConfig }) {
  const { t } = useTranslation();

  const { RiveComponent, rive } = useRive({
    src: getRemoteRive(config.environment, '/purchasing_items.riv'),
    stateMachines: 'State',
    autoplay: true,
  });

  const input = useStateMachineInput(rive, 'State', 'mode');

  useEffect(() => {
    if (!input) return;
    input.value = 2;
  }, [input]);

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
          <Heading sx={{ my: 'base.spacing.x4', mx: 'base.spacing.x4' }}>
            {t('views.TRANSFER.content.waitingForYouToApproveTxn')}
          </Heading>
          <Body rc={<div />}>
            {t('views.TRANSFER.content.waitingForYouToApproveTxnDescription')}
          </Body>
        </Box>
      </Stack>
    </SimpleLayout>
  );
}
