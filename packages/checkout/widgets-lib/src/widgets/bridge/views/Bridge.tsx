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

export interface BridgeProps {
  amount: string | undefined;
  fromContractAddress: string | undefined;
  setTransactionResponse: (response: TransactionResponse) => void;
}

export function Bridge({ amount, fromContractAddress, setTransactionResponse }: BridgeProps) {
  const { bridgeState } = useContext(BridgeContext);
  const { provider } = bridgeState;

  const updateTransactionResponse = (
    response: TransactionResponse,
  ) => {
    setTransactionResponse(response);
  };
  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          showBack
          title="Move coins"
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent()}
        />
      )}
      footer={<FooterLogo />}
      footerBackgroundColor="base.color.translucent.container.200"
    >
      <Box sx={{ paddingX: 'base.spacing.x2' }}>
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
