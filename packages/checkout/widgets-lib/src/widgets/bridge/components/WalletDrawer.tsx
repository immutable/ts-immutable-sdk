import { Drawer, Select } from '@biom3/react';
import { FormControlWrapper } from 'components/FormComponents/FormControlWrapper/FormControlWrapper';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { useState } from 'react';
import { WalletItem } from './WalletItem';
import { walletItemListStyles } from './WalletDrawerStyles';

interface WalletDrawerProps {
  testId: string;
  drawerText: {
    heading: string;
    defaultText?: string;
  },
  showWalletSelectorTarget: boolean;
  walletOptions: WalletProviderName[];
  showDrawer: boolean;
  setShowDrawer: (show: boolean) => void;
  onWalletItemClick: (name: WalletProviderName | string) => Promise<void>;
}
export function WalletDrawer({
  testId,
  drawerText,
  walletOptions,
  showWalletSelectorTarget,
  showDrawer,
  setShowDrawer,
  onWalletItemClick,
}: WalletDrawerProps) {
  const [walletItemLoading, setWalletItemLoading] = useState(false);

  const { heading, defaultText } = drawerText;

  const handleWalletItemClick = async (name: WalletProviderName | string) => {
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
      headerBarTitle={heading}
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
              testId={`${testId}-wallet-form-control`}
              textAlign="left"
            >
              <Select
                testId={`${testId}-wallet-select`}
                defaultLabel={defaultText ?? ''}
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
            testId={testId}
            loading={walletItemLoading}
            walletProviderName={walletProviderName}
            onWalletClick={handleWalletItemClick}
          />
        ))}
      </Drawer.Content>
    </Drawer>
  );
}
