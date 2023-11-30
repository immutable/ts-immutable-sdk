import { BottomSheet, Select } from '@biom3/react';
import { FormControlWrapper } from 'components/FormComponents/FormControlWrapper/FormControlWrapper';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { useState } from 'react';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { BridgeWalletItem } from './BridgeWalletItem';
import { walletItemListStyles } from './WalletSelectorStyles';

interface WalletSelectorProps {
  testId: string;
  type: 'to' | 'from',
  showWalletSelectorTarget: boolean;
  walletOptions: WalletProviderName[];
  showDrawer: boolean;
  setShowDrawer: (show: boolean) => void;
  onWalletItemClick: (name: WalletProviderName) => Promise<void>;
}
export function WalletSelector({
  testId,
  type,
  walletOptions,
  showWalletSelectorTarget,
  showDrawer,
  setShowDrawer,
  onWalletItemClick,
}: WalletSelectorProps) {
  const { to, from } = text.views[XBridgeWidgetViews.BRIDGE_WALLET_SELECTION];
  const walletSelectorText = type === 'from' ? from : to;
  const [walletItemLoading, setWalletItemLoading] = useState(false);

  const handleWalletItemClick = async (name: WalletProviderName) => {
    setWalletItemLoading(true);
    try {
      await onWalletItemClick(name);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setWalletItemLoading(false);
    }
  };

  return (
    <BottomSheet
      headerBarTitle={walletSelectorText.walletSelectorHeading}
      size="full"
      onCloseBottomSheet={() => {
        if (walletItemLoading) return;
        setShowDrawer(false);
      }}
      visible={showDrawer}
    >
      {showWalletSelectorTarget
          && (
          <BottomSheet.Target>
            <FormControlWrapper
              testId={`${testId}-${type}-wallet-form-control`}
              textAlign="left"
            >
              <Select
                testId={`${testId}-${type}-wallet-select`}
                defaultLabel={walletSelectorText.selectDefaultText}
                size="large"
                targetClickOveride={() => setShowDrawer(true)}
              />
            </FormControlWrapper>
          </BottomSheet.Target>
          )}
      <BottomSheet.Content sx={walletItemListStyles}>
        {walletOptions.map((walletProviderName) => (
          <BridgeWalletItem
            key={walletProviderName}
            testId={`${testId}-${type}`}
            loading={walletItemLoading}
            walletProviderName={walletProviderName}
            onWalletClick={handleWalletItemClick}
          />
        ))}
      </BottomSheet.Content>
    </BottomSheet>
  );
}
