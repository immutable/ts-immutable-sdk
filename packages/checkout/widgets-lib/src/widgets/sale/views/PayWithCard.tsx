import { useContext, useMemo } from 'react';
import { Box } from '@biom3/react';

import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { WithCard } from '../components/WithCard';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';

export function PayWithCard() {
  const { viewDispatch } = useContext(ViewContext);

  const handleGoBack = useMemo(() => () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SaleWidgetViews.PAYMENT_METHODS,
        },
      },
    });
  }, []);

  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          showBack
          onBackButtonClick={() => handleGoBack()}
        />
        )}
      footerBackgroundColor="base.color.translucent.emphasis.200"
    >
      <Box
        style={{
          display: 'block',
          position: 'relative',
          maxWidth: '420px',
          height: '565px',
          backgroundColor: 'white',
          borderRadius: '1%',
          overflow: 'hidden',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <WithCard />
      </Box>
    </SimpleLayout>
  );
}
