import { ChainId, ChainName } from '@imtbl/checkout-sdk';
import { MenuItem } from '@biom3/react';
import { networkItemStyles } from './BridgeNetworkItemStyles';

const networkIcon = {
  [ChainId.IMTBL_ZKEVM_DEVNET]: 'Immutable',
  [ChainId.IMTBL_ZKEVM_MAINNET]: 'Immutable',
  [ChainId.IMTBL_ZKEVM_TESTNET]: 'Immutable',
  [ChainId.ETHEREUM]: 'EthToken',
  [ChainId.SEPOLIA]: 'EthToken',
};
export interface BridgeNetworkProps {
  testId: string;
  chainId: ChainId;
  chainName: ChainName
  onNetworkClick: (chainId: ChainId) => Promise<void>;
}
export function BridgeNetworkItem({
  testId,
  chainId,
  chainName,
  onNetworkClick,
}: BridgeNetworkProps) {
  return (
    <MenuItem
      testId={`${testId}-network-list-${chainId}`}
      size="medium"
      emphasized
      onClick={async () => {
        await onNetworkClick(chainId);
      }}
      sx={{ marginBottom: 'base.spacing.x1' }}
    >
      <MenuItem.FramedIcon
        icon={networkIcon[chainId] as any}
        circularFrame
        sx={networkItemStyles(chainId)}
      />
      <MenuItem.Label size="medium">
        {chainName}
      </MenuItem.Label>
    </MenuItem>
  );
}
