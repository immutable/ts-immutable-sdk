import { useState } from 'react';
import { Box } from '@biom3/react';

import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { WithCard } from '../components/WithCard';
import { useSaleContext } from '../context/SaleContextProvider';
import { FooterLogo } from '../../../components/Footer/FooterLogo';

export function PayWithCard() {
  const { goBackToPaymentMethods } = useSaleContext();
  const [initialised, setInitialised] = useState(false);

  const onInit = () => setInitialised(true);

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
