import { ChainId, ChainName } from '@imtbl/checkout-sdk';
import { MenuItem } from '@biom3/react';

export interface BridgeNetworkProps {
  chainId: ChainId;
  chainName: ChainName
  onNetworkClick: (chainId: ChainId) => void;
}
export function BridgeNetworkItem(props: BridgeNetworkProps) {
  const { chainId, chainName, onNetworkClick } = props;

  const logoColour = {
    [ChainId.IMTBL_ZKEVM_DEVNET]: 'base.color.text.link.primary',
    [ChainId.IMTBL_ZKEVM_TESTNET]: 'base.color.text.link.primary',
    [ChainId.IMTBL_ZKEVM_MAINNET]: 'base.color.text.link.primary',
    [ChainId.ETHEREUM]: 'base.color.accent.5',
    [ChainId.SEPOLIA]: 'base.color.accent.5',
  };

  // todo: add corresponding network symbols
  const networkIcon = {
    [ChainId.IMTBL_ZKEVM_DEVNET]: 'Immutable',
    [ChainId.IMTBL_ZKEVM_MAINNET]: 'Immutable',
    [ChainId.IMTBL_ZKEVM_TESTNET]: 'Immutable',
    [ChainId.ETHEREUM]: 'EthToken',
    [ChainId.SEPOLIA]: 'EthToken',
  };

  return (
    <MenuItem
      testId={`network-list-${chainName}`}
      size="medium"
      emphasized
      onClick={() => onNetworkClick(chainId)}
      sx={{ marginBottom: 'base.spacing.x1' }}
    >
      <MenuItem.FramedIcon
        icon={networkIcon[chainId] as any}
        sx={{
          minWidth: 'base.icon.size.500',
          padding: 'base.spacing.x1',
          backgroundColor: logoColour[chainId],
          borderRadius: '50%',
        }}
      />
      <MenuItem.Label size="medium">
        {chainName}
      </MenuItem.Label>
    </MenuItem>
  );
}
