import { Drawer, Select } from '@biom3/react';
import { FormControlWrapper } from 'components/FormComponents/FormControlWrapper/FormControlWrapper';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { useState } from 'react';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { WalletItem } from './WalletItem';
import { walletItemListStyles } from './WalletDrawerStyles';

interface WalletDrawerProps {
  testId: string;
  type: 'to' | 'from',
  showWalletSelectorTarget: boolean;
  walletOptions: WalletProviderName[];
  showDrawer: boolean;
  setShowDrawer: (show: boolean) => void;
  onWalletItemClick: (name: WalletProviderName) => Promise<void>;
}
export function WalletDrawer({
  testId,
  type,
  walletOptions,
  showWalletSelectorTarget,
  showDrawer,
  setShowDrawer,
  onWalletItemClick,
}: WalletDrawerProps) {
  const { toFormInput, fromFormInput } = text.views[XBridgeWidgetViews.WALLET_NETWORK_SELECTION];
  const walletSelectorText = type === 'from' ? fromFormInput : toFormInput;
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
    <Drawer
      headerBarTitle={walletSelectorText.walletSelectorHeading}
      size="full"
      onCloseDrawer={() => {
        if (walletItemLoading) return;
        setShowDrawer(false);
      }}
      visible={showDrawer}
    >
      {showWalletSelectorTarget
          && (
          <Drawer.Target>
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
          </Drawer.Target>
          )}
      <Drawer.Content sx={walletItemListStyles}>
        {walletOptions.map((walletProviderName) => (
          <WalletItem
            key={walletProviderName}
            testId={`${testId}-${type}`}
            loading={walletItemLoading}
            walletProviderName={walletProviderName}
            onWalletClick={handleWalletItemClick}
          />
        ))}
      </Drawer.Content>
    </Drawer>
  );
}
