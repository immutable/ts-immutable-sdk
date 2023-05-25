import { Box } from '@biom3/react';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { BridgeForm } from '../components/BridgeForm';
import { text } from '../../../resources/text/textConfig';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';

export interface BridgeProps {
  amount: string | undefined;
  fromContractAddress: string | undefined;
}

export function Bridge({ amount, fromContractAddress }: BridgeProps) {
  const { header } = text.views[BridgeWidgetViews.BRIDGE];

  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          title={header.title}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent()}
        />
      )}
      footer={<FooterLogo />}
      footerBackgroundColor="base.color.translucent.container.200"
    >
      <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      >
        <BridgeForm
          defaultAmount={amount}
          defaultTokenAddress={fromContractAddress}
        />
      </Box>
    </SimpleLayout>
  );
}
