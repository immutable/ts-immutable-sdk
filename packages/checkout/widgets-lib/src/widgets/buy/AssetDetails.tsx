import { Body, Box, Heading } from '@biom3/react';
// TODO: Fix circular dependency
// eslint-disable-next-line import/no-cycle
import { GetAssetResponse, GetOrderResponse } from './BuyWidget';
import Fees from './Fees';

interface AssetDetailsProps {
  order: GetOrderResponse;
  asset: GetAssetResponse;
}

export default function AssetDetails({ order, asset }: AssetDetailsProps) {
  return (
    <Box sx={{ display: 'flex', mt: 'base.spacing.x5' }}>
      <img src={asset.image} alt="Asset" height="200px" />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Body testId="collection_name" size="small">
          {asset.collection.name}
        </Body>
        <Heading testId="asset_name" size="small">
          {asset.name}
        </Heading>
        <Box
          sx={{ display: 'flex', mt: 'base.spacing.x1', alignItems: 'center' }}
        >
          <img src={order.buy.token.icon} alt="icon" height="12px" />
          <Heading
            testId="buy_amount"
            size="xSmall"
            sx={{ ml: 'base.spacing.x2' }}
          >
            {order.buy.amount.formatted}
          </Heading>
        </Box>
        <Fees fees={order.buyFees} />
      </Box>
    </Box>
  );
}
