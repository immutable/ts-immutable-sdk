import { BottomSheet, Select } from '@biom3/react';
import { FormControlWrapper } from 'components/FormComponents/FormControlWrapper/FormControlWrapper';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { useContext, useState } from 'react';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { BridgeWalletItem } from './BridgeWalletItem';
import { walletItemListStyles } from './FromWalletSelectorStyles';
import { XBridgeContext } from '../context/XBridgeContext';

interface FromWalletSelectorProps {
  testId: string;
  showFromWalletTarget: boolean;
  showDrawer: boolean;
  setShowDrawer: (show: boolean) => void;
  onFromWalletClick: (name: WalletProviderName) => Promise<void>;
}
export function FromWalletSelector({
  testId,
  showFromWalletTarget,
  showDrawer,
  setShowDrawer,
  onFromWalletClick,
}: FromWalletSelectorProps) {
  const { bridgeState: { checkout } } = useContext(XBridgeContext);
  const { from } = text.views[XBridgeWidgetViews.BRIDGE_WALLET_SELECTION];
  const [walletItemLoading, setWalletItemLoading] = useState(false);

  const handleFromWalletClick = async (name: WalletProviderName) => {
    setWalletItemLoading(true);
    try {
      await onFromWalletClick(name);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setWalletItemLoading(false);
    }
  };

  return (
    <BottomSheet
      headerBarTitle={from.walletSelectorHeading}
      size="full"
      onCloseBottomSheet={() => {
        if (walletItemLoading) return;
        setShowDrawer(false);
      }}
      visible={showDrawer}
    >
      {showFromWalletTarget
          && (
          <BottomSheet.Target>
            <FormControlWrapper
              testId={`${testId}-from-wallet-form-control`}
              textAlign="left"
            >
              <Select
                testId={`${testId}-from-wallet-select`}
                defaultLabel={from.selectDefaultText}
                size="large"
                targetClickOveride={() => setShowDrawer(true)}
              />
            </FormControlWrapper>
          </BottomSheet.Target>
          )}
      <BottomSheet.Content sx={walletItemListStyles}>
        <BridgeWalletItem
          key={WalletProviderName.METAMASK}
          testId={testId}
          loading={walletItemLoading}
          walletProviderName={WalletProviderName.METAMASK}
          onWalletClick={handleFromWalletClick}
        />
        {checkout.passport && (
        <BridgeWalletItem
          key={WalletProviderName.PASSPORT}
          testId={testId}
          loading={walletItemLoading}
          walletProviderName={WalletProviderName.PASSPORT}
          onWalletClick={handleFromWalletClick}
        />
        )}
      </BottomSheet.Content>
    </BottomSheet>
  );
}
