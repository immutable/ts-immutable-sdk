import { ChainId, ChainName } from '@imtbl/checkout-sdk';
import { MenuItem } from '@biom3/react';
import { Environment } from '@imtbl/config';
import { getChainImage } from '../../../lib/utils';

export interface BridgeNetworkProps {
  testId: string;
  chainId: ChainId;
  chainName: ChainName;
  onNetworkClick: (chainId: ChainId) => Promise<void>;
  environment: Environment;
}
export function NetworkItem({
  testId,
  chainId,
  chainName,
  onNetworkClick,
  environment,
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
      <MenuItem.FramedImage
        use={<img src={getChainImage(environment, chainId)} alt={chainName} />}
      />
      <MenuItem.Label size="medium">{chainName}</MenuItem.Label>
    </MenuItem>
  );
}
