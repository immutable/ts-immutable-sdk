import { Drawer, Select } from '@biom3/react';
import { FormControlWrapper } from 'components/FormComponents/FormControlWrapper/FormControlWrapper';
import { useState } from 'react';
import { EIP1193Provider } from 'mipd';
import { EIP6963ProviderDetail } from 'mipd/src/types';
import { motion } from 'framer-motion';
import { WalletItem } from './WalletItem';
import { walletItemListStyles } from './WalletDrawerStyles';
import { WalletConnectItem } from './WalletConnectItem';
import { useAnimation } from '../../../lib/hooks/useAnimation';
import { useWalletConnect } from '../../../lib/hooks/useWalletConnect';
import { WalletChangeEvent } from './WalletDrawerEvents';

interface WalletDrawerProps {
  testId: string;
  drawerText: {
    heading: string;
    defaultText?: string;
  },
  showWalletSelectorTarget: boolean;
  walletOptions: EIP6963ProviderDetail<EIP1193Provider>[];
  showDrawer: boolean;
  setShowDrawer: (show: boolean) => void;
  onWalletChange: (event: WalletChangeEvent) => Promise<void>;
}
export function WalletDrawer({
  testId,
  drawerText,
  walletOptions,
  showWalletSelectorTarget,
  showDrawer,
  setShowDrawer,
  onWalletChange,
}: WalletDrawerProps) {
  const { isWalletConnectEnabled, openWalletConnectModal, walletConnectProviderInfo } = useWalletConnect();
  const [walletItemLoading, setWalletItemLoading] = useState(false);
  const { listVariants, listItemVariants } = useAnimation();
  const { heading, defaultText } = drawerText;

  const handleWalletItemClick = async (providerDetail: EIP6963ProviderDetail<EIP1193Provider>) => {
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
          const walletChangeEvent : WalletChangeEvent = {
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
        restoreSession: true,
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
        {walletOptions.map((providerDetail, index) => (
          <>
            <WalletItem
              key={providerDetail.info.rdns}
              testId={testId}
              loading={walletItemLoading}
              providerDetail={providerDetail}
              onWalletItemClick={handleWalletItemClick}
              rc={(
                <motion.div variants={listItemVariants} custom={index} />
              )}
            />
            {isWalletConnectEnabled && (index === walletOptions.length - 1) && (
              <motion.div
                variants={listItemVariants}
                custom={walletOptions.length}
                key="walletconnect"
              >
                <WalletConnectItem
                  key="walletconnect"
                  testId={`${testId}-wallet-list-walletconnect`}
                  loading={walletItemLoading}
                  onWalletItemClick={handleWalletConnectClick}
                />
              </motion.div>
            )}
          </>
        ))}
      </Drawer.Content>
    </Drawer>
  );
}
