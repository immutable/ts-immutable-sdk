import {
  Drawer, MenuItem, MenuItemProps, Select,
} from '@biom3/react';
import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { EIP1193Provider, EIP6963ProviderDetail } from '@imtbl/checkout-sdk';
import { FormControlWrapper } from '../FormComponents/FormControlWrapper/FormControlWrapper';
import { WalletItem } from './WalletItem';
import { walletItemListStyles } from './WalletDrawerStyles';
import { WalletConnectItem } from './WalletConnectItem';
import { useWalletConnect } from '../../lib/hooks/useWalletConnect';
import { WalletChangeEvent } from './WalletDrawerEvents';
import { listItemVariants, listVariants } from '../../lib/animation/listAnimation';
import { walletConnectProviderInfo } from '../../lib/walletConnect';

interface WalletDrawerProps {
  testId: string;
  drawerText: {
    heading: string;
    defaultText?: string;
  },
  showWalletConnect?: boolean;
  showWalletSelectorTarget?: boolean;
  walletOptions: EIP6963ProviderDetail[];
  showDrawer: boolean;
  setShowDrawer: (show: boolean) => void;
  onWalletChange: (event: WalletChangeEvent) => Promise<void>;
  menuItemSize?: MenuItemProps['size'];
  bottomSlot?: ReactNode;
  disabledOptions?: {
    label: string;
    rdns: string;
  }[];
}
export function WalletDrawer({
  testId,
  drawerText,
  walletOptions,
  showWalletConnect = true,
  showWalletSelectorTarget = false,
  showDrawer,
  setShowDrawer,
  onWalletChange,
  menuItemSize,
  bottomSlot,
  disabledOptions,
}: WalletDrawerProps) {
  const { isWalletConnectEnabled, openWalletConnectModal } = useWalletConnect();
  const [walletItemLoading, setWalletItemLoading] = useState(false);
  const { heading, defaultText } = drawerText;

  const handleWalletItemClick = async (providerDetail: EIP6963ProviderDetail) => {
    setWalletItemLoading(true);
    try {
      await onWalletChange({
        walletType: 'injected',
        provider: providerDetail.provider,
        providerDetail,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setWalletItemLoading(false);
    }
  };

  const handleWalletConnectClick = async () => {
    try {
      await openWalletConnectModal({
        connectCallback: (ethereumProvider) => {
          const walletChangeEvent: WalletChangeEvent = {
            walletType: 'walletconnect',
            provider: ethereumProvider as EIP1193Provider,
            providerDetail: {
              provider: ethereumProvider as EIP1193Provider,
              info: {
                ...walletConnectProviderInfo,
              },
            },
          };
          onWalletChange(walletChangeEvent);
        },
        restoreSession: false,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
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
      <Drawer.Content
        sx={walletItemListStyles}
        rc={(
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
          />
        )}
      >
        {walletOptions.map((providerDetail, index) => {
          const unavailableIndex = disabledOptions?.findIndex(
            ({ rdns }) => rdns === providerDetail.info.rdns,
          ) ?? -1;

          const unavalable = unavailableIndex > -1;

          const badge = unavalable
            ? (
              <MenuItem.Badge
                variant="dark"
                badgeContent={disabledOptions?.[unavailableIndex]?.label ?? 'no funds'}
              />
            )
            : undefined;

          return (
            <WalletItem
              key={providerDetail.info.rdns}
              testId={testId}
              loading={walletItemLoading}
              providerInfo={providerDetail.info}
              onWalletItemClick={() => handleWalletItemClick(providerDetail)}
              rc={(
                <motion.div variants={listItemVariants} custom={index} />
              )}
              size={menuItemSize}
              badge={badge}
              disabled={unavalable}
            />
          );
        })}
        {isWalletConnectEnabled && showWalletConnect && (
          <motion.div
            variants={listItemVariants}
            custom={walletOptions.length}
            key="walletconnect"
          >
            <WalletConnectItem
              size={menuItemSize}
              loading={walletItemLoading}
              onWalletItemClick={handleWalletConnectClick}
            />
          </motion.div>
        )}
        {bottomSlot && (
          <motion.div
            variants={listItemVariants}
            custom={walletOptions.length + 1}
            key="bottom-slot-item"
          >
            {bottomSlot}
          </motion.div>
        )}
      </Drawer.Content>
    </Drawer>
  );
}
