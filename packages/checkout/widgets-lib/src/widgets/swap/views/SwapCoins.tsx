import { Box } from '@biom3/react';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { sendSwapWidgetCloseEvent } from '../SwapWidgetEvents';
import { text } from '../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { SwapForm } from '../components/SwapForm';

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

  console.log(
    'SwapCoinsData: ',
    fromAmount,
    toAmount,
    fromContractAddress,
    toContractAddress,
  );

  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          showBack
          title={header.title}
          onCloseButtonClick={() => sendSwapWidgetCloseEvent()}
        />
      )}
      footer={<FooterLogo />}
      footerBackgroundColor="base.color.translucent.container.200"
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
