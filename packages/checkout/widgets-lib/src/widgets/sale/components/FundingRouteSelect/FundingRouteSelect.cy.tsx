import { BiomeCombinedProviders } from '@biom3/react';
import {
  BridgeFundingStep,
  ChainId, FundingRoute, FundingStepType, ItemType, SwapFundingStep,
} from '@imtbl/checkout-sdk';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';
import { mount } from 'cypress/react18';
import { BigNumber, utils } from 'ethers';
import { cy, describe } from 'local-cypress';
import { CustomAnalyticsProvider } from '../../../../context/analytics-provider/CustomAnalyticsProvider';
import { cySmartGet } from '../../../../lib/testUtils';
import { StrongCheckoutWidgetsConfig } from '../../../../lib/withDefaultWidgetConfig';
import { FundingRouteSelect } from './FundingRouteSelect';

describe.skip('FundingRouteSelect View', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  const config: StrongCheckoutWidgetsConfig = {
    environment: Environment.SANDBOX,
    theme: WidgetTheme.DARK,
    isBridgeEnabled: true,
    isSwapEnabled: true,
    isOnRampEnabled: true,
  };

  const bridgeFundingStep: BridgeFundingStep = {
    type: FundingStepType.BRIDGE,
    chainId: ChainId.SEPOLIA,
    fundingItem: {
      type: ItemType.NATIVE,
      fundsRequired: {
        amount: BigNumber.from(1),
        formattedAmount: '1',
      },
      userBalance: {
        balance: BigNumber.from(1),
        formattedBalance: '1',
      },
      token: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
    },
    fees: {
      approvalGasFees: {
        amount: BigNumber.from(0),
        formattedAmount: '0',
      },
      bridgeGasFees: {
        amount: BigNumber.from(0),
        formattedAmount: '0',
      },
      bridgeFees: [{
        amount: BigNumber.from(0),
        formattedAmount: '0',
      }],
    },
  };

  const swapFundingStep: SwapFundingStep = {
    type: FundingStepType.SWAP,
    chainId: ChainId.IMTBL_ZKEVM_TESTNET,
    fundingItem: {
      type: ItemType.ERC20,
      fundsRequired: {
        amount: BigNumber.from(1),
        formattedAmount: utils.formatUnits(BigNumber.from(1), 18),
      },
      userBalance: {
        balance: BigNumber.from(10),
        formattedBalance: '10',
      },
      token: {
        name: 'ERC20',
        symbol: 'USDC',
        decimals: 18,
        address: '0xERC20_2',
      },
    },
    fees: {
      approvalGasFees: {
        amount: BigNumber.from(0),
        formattedAmount: '0',
      },
      swapGasFees: {
        amount: BigNumber.from(0),
        formattedAmount: '0',
      },
      swapFees: [{
        amount: BigNumber.from(0),
        formattedAmount: '0',
      }],
    },
  };

  describe('single option available', () => {
    const fundingRoutes: FundingRoute[] = [
      {
        priority: 1,
        steps: [bridgeFundingStep],
      },
    ];
    beforeEach(() => {
      mount(
        <CustomAnalyticsProvider widgetConfig={config}>
          <BiomeCombinedProviders>
            <FundingRouteSelect fundingRoutes={fundingRoutes} onFundingRouteSelected={() => {}} />
          </BiomeCombinedProviders>
        </CustomAnalyticsProvider>,

      );
    });
    it('should display first option, without chevron', () => {
      cySmartGet('funding-route-menu-item').should('exist');
      cySmartGet('funding-route-menu-item').should('contain.text', 'ETH');

      cySmartGet('funding-route-menu-item__intentIcon').should('not.exist');
    });

    it('clicking should not open bottom sheet', () => {
      cySmartGet('funding-route-menu-item').click();

      cySmartGet('bottomSheet').should('not.exist');
    });
  });

  describe('multiple options available', () => {
    const fundingRoutes = [
      {
        priority: 1,
        steps: [bridgeFundingStep],
      },
      {
        priority: 2,
        steps: [swapFundingStep],
      },
    ];
    beforeEach(() => {
      mount(
        <CustomAnalyticsProvider widgetConfig={config}>
          <BiomeCombinedProviders>
            <FundingRouteSelect fundingRoutes={fundingRoutes} onFundingRouteSelected={() => {}} />
          </BiomeCombinedProviders>
        </CustomAnalyticsProvider>,

      );
    });
    it('should display first option, with chevron', () => {
      cySmartGet('funding-route-menu-item').should('exist');
      cySmartGet('funding-route-menu-item').should('contain.text', 'ETH');

      cySmartGet('funding-route-menu-item__intentIcon').should('exist');
    });

    it('clicking should open bottom sheet', () => {
      cySmartGet('funding-route-menu-item').click();

      cySmartGet('bottomSheet').should('exist');
    });

    it('selecting an item inside the bottom sheet should change selected option', () => {
      cySmartGet('funding-route-menu-item').should('contain.text', 'ETH');
      cySmartGet('funding-route-menu-item').click();

      cySmartGet('bottomSheet').should('exist');
      cySmartGet('bottomSheet').find('[data-testId="funding-route-menu-item"]').should('have.length', 2);
      cySmartGet('bottomSheet').find('[data-testId="funding-route-menu-item"]')
        .eq(0).should('have.class', 'selected');
      cySmartGet('bottomSheet').find('[data-testId="funding-route-menu-item"]')
        .eq(1).should('not.have.class', 'selected');
      cySmartGet('bottomSheet').find('[data-testId="funding-route-menu-item"]')
        .eq(1).click();

      cySmartGet('bottomSheet').should('not.exist');

      cySmartGet('funding-route-menu-item').should('contain.text', 'USDC');

      cySmartGet('funding-route-menu-item').click();
      cySmartGet('bottomSheet').find('[data-testId="funding-route-menu-item"]')
        .eq(0).should('not.have.class', 'selected');
      cySmartGet('bottomSheet').find('[data-testId="funding-route-menu-item"]')
        .eq(1).should('have.class', 'selected');
    });
  });
});
