import {
  Box, Icon, Body, EllipsizedText, FramedImage,
} from '@biom3/react';
import { ChainSlug } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { networkName } from '../../lib';
import { getChainIdBySlug } from '../../lib/chains';
import { Transaction } from '../../lib/clients';
import { getChainImage } from '../../lib/utils';

export interface TransactionDetailsProps {
  transaction: Transaction;
  environment: Environment;
}

export function TransactionDetails({ transaction, environment }: TransactionDetailsProps) {
  const fromChain = getChainIdBySlug(transaction.details.from_chain as ChainSlug);
  const toChain = getChainIdBySlug(transaction.details.to_chain as ChainSlug);
  return (
    <Box sx={{
      display: 'flex',
      px: 'base.spacing.x4',
      gap: 'base.spacing.x2',
    }}
    >
      <FramedImage
        sx={{
          w: 'base.icon.size.400',
          h: 'base.icon.size.400',
        }}
        use={(
          <img
            src={getChainImage(environment, fromChain)}
            alt={networkName[fromChain]}
          />
        )}
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
      <FramedImage
        sx={{
          w: 'base.icon.size.400',
          h: 'base.icon.size.400',
        }}
        use={(
          <img
            src={getChainImage(environment, toChain)}
            alt={networkName[toChain]}
          />
        )}
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
