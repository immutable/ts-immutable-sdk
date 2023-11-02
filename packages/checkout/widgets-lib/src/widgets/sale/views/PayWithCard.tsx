import { useEffect, useState } from 'react';
import { Box } from '@biom3/react';

import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { WithCard } from '../components/WithCard';
import { useSaleContext } from '../context/SaleContextProvider';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { useSaleEvent } from '../hooks/useSaleEvents';

export function PayWithCard() {
  const { sendPageView } = useSaleEvent();
  const { goBackToPaymentMethods } = useSaleContext();
  const [initialised, setInitialised] = useState(false);

  const onInit = () => setInitialised(true);

  useEffect(() => sendPageView(SaleWidgetViews.PAY_WITH_CARD), []);

  return (
    <SimpleLayout
      header={
        initialised && (
          <HeaderNavigation
            onCloseButtonClick={() => goBackToPaymentMethods()}
          />
        )
      }
      footer={<FooterLogo hideLogo={initialised} />}
    >
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
        <WithCard onInit={onInit} />
      </Box>
    </SimpleLayout>
  );
}
