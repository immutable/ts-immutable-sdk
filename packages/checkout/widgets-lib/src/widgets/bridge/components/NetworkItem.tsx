import { ChainId, ChainName } from '@imtbl/checkout-sdk';
import { MenuItem } from '@biom3/react';
import { networkIcon } from '../../../lib';
import { networkItemStyles } from './NetworkItemStyles';

export interface BridgeNetworkProps {
  testId: string;
  chainId: ChainId;
  chainName: ChainName;
  onNetworkClick: (chainId: ChainId) => Promise<void>;
}
export function NetworkItem({
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
      <MenuItem.Label size="medium">{chainName}</MenuItem.Label>
    </MenuItem>
  );
}
