import { TransactionResponse } from '@ethersproject/providers';
import { useContext, useState } from 'react';
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
}

export function Bridge({ amount, fromContractAddress }: BridgeProps) {
  const { bridgeState } = useContext(BridgeContext);
  const { provider } = bridgeState;

  const [transactionResponse, setTransactionResponse] = useState<
  TransactionResponse | undefined
  >();
  console.log(`Transaction response hash: ${transactionResponse?.hash}`);
  /**
   * When we switch network, we need to refresh the provider object to avoid errors
   * After a switch network, update the new toNetwork and associated native currency
   */
  // const handleSelectNetwork = useCallback(
  //   async (selectedOption: OptionKey) => {
  //     console.log(`selected option: ${selectedOption}`);
  //     console.log('handle select network');
  //     // if (!provider) return;
  //     // const switchNetworkResponse = await checkout.switchNetwork({
  //     //   provider,
  //     //   chainId: selectedOption as ChainId,
  //     // });
  //     // const connectResult = await checkout.connect({ providerPreference });
  //     // setProvider(connectResult.provider);
  //     // setSelectedNetwork(switchNetworkResponse.network.chainId as OptionKey);
  //     // const toNetworkOption = bridgingNetworks.filter(
  //     //   (network) => network.toString() !== switchNetworkResponse.network.name.toString(),
  //     // );
  //     // setToNetwork(toNetworkOption[0]);
  //     // setNativeCurrencySymbol(connectResult.network.nativeCurrency.symbol);
  //   },
  //   [checkout, provider],
  // );

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
