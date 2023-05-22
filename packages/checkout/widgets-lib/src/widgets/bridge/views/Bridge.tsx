import { TransactionResponse } from '@ethersproject/providers';
import { useContext } from 'react';
import { Box } from '@biom3/react';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { BridgeContext } from '../context/BridgeContext';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { BridgeForm } from '../components/BridgeForm';
import { BridgeButton } from '../components/BridgeButton';
import { text } from '../../../resources/text/textConfig';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';

export interface BridgeProps {
  amount: string | undefined;
  fromContractAddress: string | undefined;
  setTransactionResponse: (response: TransactionResponse) => void;
}

export function Bridge({ amount, fromContractAddress, setTransactionResponse }: BridgeProps) {
  const { bridgeState } = useContext(BridgeContext);
  const { provider } = bridgeState;
  const { header } = text.views[BridgeWidgetViews.BRIDGE];

  const updateTransactionResponse = (
    response: TransactionResponse,
  ) => {
    setTransactionResponse(response);
  };
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
      <Box sx={{ paddingX: 'base.spacing.x4' }}>
        {provider && (
        <BridgeForm
          defaultAmount={amount}
          defaultTokenAddress={fromContractAddress}
        />
        )}
      </Box>

      {provider && (
      <BridgeButton
        updateTransactionResponse={updateTransactionResponse}
      />
      )}
    </SimpleLayout>
  );
}
