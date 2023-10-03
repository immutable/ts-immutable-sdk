/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box } from '@biom3/react';
import { ChainId } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import {
  useContext,
  useMemo, useState,
} from 'react';
import {
  FundWithSmartCheckoutSubViews, PrimaryRevenueWidgetViews,
} from '../../../context/view-context/PrimaryRevenueViewContextTypes';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { LoadingView } from '../../../views/loading/LoadingView';
import {
  FundingRouteExecute,
} from '../components/FundingRouteExecute/FundingRouteExecute';
import { FundingRouteSelect } from '../components/FundingRouteSelect/FundingRouteSelect';
import { FundingRoute } from './smartCheckoutTypes';

const MOCK_ROUTES = [
  {
    priority: 1,
    steps: [
      {
        type: 'SWAP',
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        asset: {
          balance: BigNumber.from(10),
          formattedBalance: '10',
          token: {
            name: 'ERC20',
            symbol: 'USDC',
            decimals: 18,
            address: '0xERC20_2',
          },
        },
      }, {
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
          symbol: 'USDC',
          decimals: 18,
          address: '0xERC20_2',
        },
      },
    }],
  },
];

type FundWithSmartCheckoutProps = {
  subView: FundWithSmartCheckoutSubViews;
};

export function FundWithSmartCheckout({ subView }: FundWithSmartCheckoutProps) {
  const { viewDispatch } = useContext(ViewContext);
  const [selectedFundingRoute, setSelectedFundingRoute] = useState<FundingRoute | undefined>(undefined);
  const [fundingRouteStepIndex, setFundingRouteStepIndex] = useState<number>(0);

  const onFundingRouteSelected = (fundingRoute: FundingRoute) => {
    setSelectedFundingRoute(fundingRoute);
  };

  const fundingRouteStep = useMemo(() => {
    if (!selectedFundingRoute) {
      return undefined;
    }
    return selectedFundingRoute.steps[fundingRouteStepIndex];
  }, [selectedFundingRoute, fundingRouteStepIndex]);

  const onFundingRouteExecuted = () => {
    if (!selectedFundingRoute) {
      return;
    }
    if (fundingRouteStepIndex === selectedFundingRoute.steps.length - 1) {
      // Reached the end - exit FundWithSmartCheckout
      console.log('@@@@@ FundWithSmartCheckout - all steps completed');
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: PrimaryRevenueWidgetViews.FUND_WITH_SMART_CHECKOUT,
            data: {
              subView: FundWithSmartCheckoutSubViews.DONE,
            },
          },
        },
      });
    } else {
      setFundingRouteStepIndex(fundingRouteStepIndex + 1);
    }
  };

  return (
    <Box>
      <p>
        hello world from FundWithSmartCheckout
      </p>
      { subView === FundWithSmartCheckoutSubViews.INIT && (
        <LoadingView loadingText="todo loading text" />
      )}
      { subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT && (
        <FundingRouteSelect
          onFundingRouteSelected={onFundingRouteSelected}
          fundingRoutes={MOCK_ROUTES}
        />
      )}
      { subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_EXECUTE && (
        <FundingRouteExecute
          onFundingRouteExecuted={onFundingRouteExecuted}
          fundingRouteStep={fundingRouteStep!}
        />
      )}
      { subView === FundWithSmartCheckoutSubViews.DONE && (
      <p>
        FundWithSmartCheckout done!
      </p>
      )}
    </Box>
  );
}
