import { Box } from '@biom3/react';
import { ChainId } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import {
  FundWithSmartCheckoutSubViews,
} from '../../../context/view-context/PrimaryRevenueViewContextTypes';
import { LoadingView } from '../../../views/loading/LoadingView';
import { FundingRouteExecute } from '../components/FundingRouteExecute/FundingRouteExecute';
import { FundingRouteSelect } from '../components/FundingRouteSelect/FundingRouteSelect';

type FundWithSmartCheckoutProps = {
  subView: FundWithSmartCheckoutSubViews;
};

export function FundWithSmartCheckout({ subView }: FundWithSmartCheckoutProps) {
  // const { signResponse } = useSharedContext();
  // const signResponse = { todo: 'get a real signresponse' } as any; // todo add to shared context
  const smartCheckoutResponse = {
    fundingRoutes: [
      {
        priority: 1,
        steps: [{
          type: 'BRIDGE',
          chainId: ChainId.SEPOLIA,
          asset: {
            balance: BigNumber.from(1),
            formattedBalance: '1',
            token: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        }],
      },
      {
        priority: 2,
        steps: [{
          type: 'SWAP',
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          asset: {
            balance: BigNumber.from(10),
            formattedBalance: '10',
            token: {
              name: 'ERC20',
              symbol: 'ERC20',
              decimals: 18,
              address: '0xERC20_2',
            },
          },
        }],
      },
    ],
  }; // todo add to shared context

  return (
    <Box>
      <p>
        hello world from FundWithSmartCheckout
      </p>
      { subView === FundWithSmartCheckoutSubViews.INIT && (
        <LoadingView loadingText="todo loading text" />
      )}
      { subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT && (
        <FundingRouteSelect fundingRoutes={smartCheckoutResponse?.fundingRoutes} />
      )}
      { subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_EXECUTE && (
        <FundingRouteExecute />
      )}
    </Box>
  );
}
