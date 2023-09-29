import { BiomeCombinedProviders } from '@biom3/react';
import { mount } from 'cypress/react18';
import { cy, describe } from 'local-cypress';
import { ChainId } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { cySmartGet } from '../../../../lib/testUtils';
import { FundingRouteSelect } from './FundingRouteSelect';

describe('FundingRouteSelect View', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  describe('single option available', () => {
    const fundingRoutes = [
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
    ];
    beforeEach(() => {
      mount(
        <BiomeCombinedProviders>
          <FundingRouteSelect fundingRoutes={fundingRoutes} onFundingRouteSelected={() => {}} />
        </BiomeCombinedProviders>,
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
              symbol: 'USDC',
              decimals: 18,
              address: '0xERC20_2',
            },
          },
        }],
      },
    ];
    beforeEach(() => {
      mount(
        <BiomeCombinedProviders>
          <FundingRouteSelect fundingRoutes={fundingRoutes} onFundingRouteSelected={() => {}} />
        </BiomeCombinedProviders>,
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
