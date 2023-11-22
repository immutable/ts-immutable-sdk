import {
  BottomSheet, Box, Heading, Select,
} from '@biom3/react';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { FormControlWrapper } from 'components/FormComponents/FormControlWrapper/FormControlWrapper';
import { useContext, useState } from 'react';
import { WalletItem } from 'widgets/connect/components/WalletItem';
import { WalletProviderName, CheckoutErrorType } from '@imtbl/checkout-sdk';
import { brigdeWalletWrapperStyles } from './BridgeWalletFormStyles';
import { XBridgeContext } from '../context/XBridgeContext';

interface BridgeWalletFormProps {
  testId: string;
}
export function BridgeWalletForm({
  testId,
}: BridgeWalletFormProps) {
  const { bridgeState: { checkout } } = useContext(XBridgeContext);
  const { heading, from } = text.views[XBridgeWidgetViews.BRIDGE_WALLET_SELECTION];

  const [fromWalletDrawerOpen, setFromWalletDrawerOpen] = useState(false);

  async function handleWalletConnection(walletProviderName: WalletProviderName) {
    let provider;
    try {
      const createResult = await checkout.createProvider({ walletProviderName });
      provider = createResult.provider;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to create ${walletProviderName} provider`);
    }

    // check if connected
    let connected = false;
    try {
      const { isConnected } = await checkout.checkIsWalletConnected({ provider });
      connected = isConnected;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('failed to check connection');
      throw err;
    }

    if (!connected) {
      // try to connect
      try {
        const { provider: connectedProvider } = await checkout.connect({ provider });
        provider = connectedProvider;
        connected = true;
      } catch (err: any) {
        if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
          // eslint-disable-next-line no-console
          console.error('user rejected request');
        }
      }
    }

    if (connected) {
      setFromWalletDrawerOpen(false);
      // should then check / open from network drawer
    }
  }

  return (
    <Box sx={brigdeWalletWrapperStyles}>
      <Heading
        testId={`${testId}-heading`}
        size="small"
        weight="regular"
        sx={{ paddingTop: 'base.spacing.x10', paddingBottom: 'base.spacing.x4' }}
      >
        {heading}
      </Heading>
      <Heading size="xSmall" sx={{ paddingBottom: 'base.spacing.x2' }}>{from.heading}</Heading>

      {/** FROM WALLET SELECTOR */}
      <BottomSheet
        headerBarTitle={from.walletSelectorHeading}
        size="full"
        onCloseBottomSheet={() => setFromWalletDrawerOpen(false)}
        visible={fromWalletDrawerOpen}
      >
        <BottomSheet.Target>
          <FormControlWrapper
            testId={`${testId}-from-select-form-control`}
            textAlign="left"
          >
            <Select
              defaultLabel={from.selectDefaultText}
              size="large"
              targetClickOveride={() => setFromWalletDrawerOpen(true)}
            />
          </FormControlWrapper>
        </BottomSheet.Target>
        <BottomSheet.Content>
          <WalletItem
            onWalletClick={(name) => handleWalletConnection(name)}
            wallet={{ walletProviderName: WalletProviderName.METAMASK }}
            key={WalletProviderName.METAMASK}
          />
          {checkout.passport && (
          <WalletItem
            key={WalletProviderName.PASSPORT}
            wallet={{ walletProviderName: WalletProviderName.PASSPORT }}
            onWalletClick={(name) => handleWalletConnection(name)}
          />
          )}
        </BottomSheet.Content>
      </BottomSheet>
    </Box>
  );
}
