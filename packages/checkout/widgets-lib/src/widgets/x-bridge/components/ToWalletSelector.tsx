import { BottomSheet, Select } from '@biom3/react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { FormControlWrapper } from 'components/FormComponents/FormControlWrapper/FormControlWrapper';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { useState } from 'react';
import { text } from 'resources/text/textConfig';
import { BridgeWalletItem } from './BridgeWalletItem';
import { walletItemListStyles } from './FromWalletSelectorStyles';

interface ToWalletSelectorProps {
  testId: string;
  showToWalletTarget: boolean;
  showDrawer: boolean;
  setShowDrawer: (show: boolean) => void;
  onToWalletClick: (name: WalletProviderName) => Promise<void>;
  showPassportOption: boolean;
}

export function ToWalletSelector({
  testId,
  showToWalletTarget,
  showDrawer,
  setShowDrawer,
  onToWalletClick,
  showPassportOption,
}:ToWalletSelectorProps) {
  const { to } = text.views[XBridgeWidgetViews.BRIDGE_WALLET_SELECTION];
  const [walletItemLoading, setWalletItemLoading] = useState(false);

  const handleToWalletClick = async (name: WalletProviderName) => {
    setWalletItemLoading(true);
    try {
      await onToWalletClick(name);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setWalletItemLoading(false);
    }
  };
  return (
    <BottomSheet
      headerBarTitle={to.walletSelectorHeading}
      size="full"
      onCloseBottomSheet={() => {
        if (walletItemLoading) return;
        setShowDrawer(false);
      }}
      visible={showDrawer}
    >
      {/** !isToWalletAndNetworkSelected */}
      { showToWalletTarget && (
      <BottomSheet.Target>
        <FormControlWrapper
          testId={`${testId}-to-wallet-form-control`}
          textAlign="left"
        >
          <Select
            testId={`${testId}-to-wallet-select`}
            defaultLabel={to.selectDefaultText}
            size="large"
            targetClickOveride={() => setShowDrawer(true)}
          />
        </FormControlWrapper>
      </BottomSheet.Target>
      )}
      <BottomSheet.Content sx={walletItemListStyles}>
        <BridgeWalletItem
          key={WalletProviderName.METAMASK}
          testId={`${testId}-to`}
          loading={walletItemLoading}
          walletProviderName={WalletProviderName.METAMASK}
          onWalletClick={handleToWalletClick}
        />

        {/** conditionally show To Wallet Passport option */}
        {showPassportOption && (
        <BridgeWalletItem
          key={WalletProviderName.PASSPORT}
          testId={`${testId}-to`}
          loading={walletItemLoading}
          walletProviderName={WalletProviderName.PASSPORT}
          onWalletClick={handleToWalletClick}
        />
        )}
      </BottomSheet.Content>
    </BottomSheet>
  );
}
