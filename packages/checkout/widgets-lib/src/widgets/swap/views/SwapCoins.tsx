import { Box } from '@biom3/react';
import { useContext, useMemo } from 'react';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { sendSwapWidgetCloseEvent } from '../SwapWidgetEvents';
import { text } from '../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { SwapForm } from '../components/SwapForm';
import { SharedViews, ViewContext } from '../../../context/view-context/ViewContext';

export interface SwapCoinsProps {
  fromAmount?: string;
  toAmount?: string;
  fromContractAddress?: string;
  toContractAddress?: string;
}

export function SwapCoins({
  fromAmount,
  toAmount,
  fromContractAddress,
  toContractAddress,
}: SwapCoinsProps) {
  const { header } = text.views[SwapWidgetViews.SWAP];
  const { viewState } = useContext(ViewContext);

  const showBackButton = useMemo(() => viewState.history.length > 2
  && viewState.history[viewState.history.length - 2].type === SharedViews.TOP_UP_VIEW, [viewState.history]);

  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          showBack={showBackButton}
          title={header.title}
          onCloseButtonClick={() => sendSwapWidgetCloseEvent()}
        />
      )}
      footer={<FooterLogo />}
      footerBackgroundColor="base.color.translucent.emphasis.200"
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <SwapForm data={{
          fromAmount,
          toAmount,
          fromContractAddress,
          toContractAddress,
        }}
        />
      </Box>
    </SimpleLayout>
  );
}
