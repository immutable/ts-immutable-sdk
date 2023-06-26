/* eslint-disable @typescript-eslint/naming-convention */
import { mount } from 'cypress/react18';
import { describe } from 'local-cypress';
import { Environment } from '@imtbl/config';
import { CryptoFiat } from '@imtbl/cryptofiat';
import { CryptoFiatProvider } from './CryptoFiatProvider';
import { CryptoFiatTestComponent } from './test-components/CryptoFiatTestComponent';
import { FiatSymbols } from './CryptoFiatContext';

describe('Crypto Fiat Provider', () => {
  beforeEach(() => {
    cy.stub(CryptoFiat.prototype, 'convert')
      .as('cryptoFiatStub')
      .resolves({});
  });

  it('should get crypto fiat conversions', () => {
    mount(
      <CryptoFiatProvider
        environment={Environment.SANDBOX}
      >
        <CryptoFiatTestComponent
          tokenSymbols={['USDC', 'ETH', 'IMX']}
        />
      </CryptoFiatProvider>,
    );

    cy.get('@cryptoFiatStub').should(
      'have.been.calledWith',
      {
        fiatSymbol: FiatSymbols.USD,
        tokenSymbols: ['USDC', 'ETH', 'IMX'],
      },
    );
  });

  it('should get crypto fiat conversions with eth and imx added', () => {
    mount(
      <CryptoFiatProvider
        environment={Environment.SANDBOX}
      >
        <CryptoFiatTestComponent
          tokenSymbols={['USDC']}
        />
      </CryptoFiatProvider>,
    );

    cy.get('@cryptoFiatStub').should(
      'have.been.calledWith',
      {
        fiatSymbol: FiatSymbols.USD,
        tokenSymbols: ['USDC', 'ETH', 'IMX'],
      },
    );
  });
});
