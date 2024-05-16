import {
  Box, Icon, Body, EllipsizedText,
} from '@biom3/react';
import { ChainSlug } from '@imtbl/checkout-sdk';
import { logoColour, networkIcon, networkName } from '../../lib';
import { getChainIdBySlug } from '../../lib/chains';
import { Transaction } from '../../lib/clients';

export interface TransactionDetailsProps {
  transaction: Transaction;
}

export function TransactionDetails({ transaction }: TransactionDetailsProps) {
  const fromChain = getChainIdBySlug(transaction.details.from_chain as ChainSlug);
  const toChain = getChainIdBySlug(transaction.details.to_chain as ChainSlug);
  return (
    <Box sx={{
      display: 'flex',
      px: 'base.spacing.x4',
      gap: 'base.spacing.x2',
    }}
    >
      <Icon
        icon={networkIcon[fromChain] as any}
        sx={{
          w: 'base.icon.size.250',
          fill: logoColour[fromChain],
        }}
        variant="bold"
      />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: '1',
      }}
      >
        <Body size="xxSmall" sx={{ color: 'base.color.translucent.standard.900' }}>
          {networkName[fromChain]}
        </Body>
        <EllipsizedText
          size="xxSmall"
          sx={{ color: 'base.color.translucent.standard.600' }}
          text={transaction.details.from_address}
        />
      </Box>
      <Box sx={{ flexGrow: '1' }} />
      <Icon
        icon="ArrowForward"
        sx={{
          w: 'base.icon.size.250',
          fill: 'base.color.brand.4',
        }}
      />
      <Box sx={{ flexGrow: '1' }} />
      <Icon
        icon={networkIcon[toChain] as any}
        sx={{
          w: 'base.icon.size.250',
          fill: logoColour[toChain],
        }}
        variant="bold"
      />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: '1',
      }}
      >
        <Body size="xxSmall" sx={{ color: 'base.color.translucent.standard.900' }}>
          {networkName[toChain]}
        </Body>
        <EllipsizedText
          size="xxSmall"
          sx={{ color: 'base.color.translucent.standard.600' }}
          text={transaction.details.to_address}
        />
      </Box>
    </Box>
  );
}
