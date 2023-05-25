import { Box } from '@biom3/react';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { sendSwapWidgetCloseEvent } from '../SwapWidgetEvents';
import { text } from '../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { SwapForm } from '../components/SwapForm';

export interface SwapCoinsProps {
  amount?: string;
  fromContractAddress?: string;
  toContractAddress?: string;
}

export function SwapCoins({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  amount,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fromContractAddress,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toContractAddress,
}: SwapCoinsProps) {
  const { header } = text.views[SwapWidgetViews.SWAP];

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
        <SwapForm />
      </Box>
    </SimpleLayout>
  );
}
