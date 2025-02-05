import { useState } from 'react';
import { Box, LoadingOverlay } from '@biom3/react';

import { useTranslation } from 'react-i18next';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { WithCard } from '../components/WithCard';

interface PayWithCardProps {
  onCloseButtonClick?: () => void;
  onError?: () => void;
}

export function PayWithCard({
  onCloseButtonClick,
  onError,
}: PayWithCardProps) {
  const [initialised, setInitialised] = useState(false);
  const { t } = useTranslation();

  const onInit = () => setInitialised(true);

  const onOrderFailed = () => {
    onError?.();
  };

  return (
    <SimpleLayout
      header={
        initialised && (
          <HeaderNavigation
            onCloseButtonClick={() => onCloseButtonClick?.()}
          />
        )
      }
    >
      <>
        <LoadingOverlay visible={!initialised}>
          <LoadingOverlay.Content>
            <LoadingOverlay.Content.LoopingText
              text={[t('views.PAY_WITH_CARD.loading')]}
            />
          </LoadingOverlay.Content>
        </LoadingOverlay>
        <Box
          style={{
            display: 'block',
            position: 'relative',
            maxWidth: '420px',
            height: '565px',
            borderRadius: '1%',
            overflow: 'hidden',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <WithCard
            onInit={onInit}
            onOrderFailed={onOrderFailed}
          />
        </Box>
      </>
    </SimpleLayout>
  );
}
