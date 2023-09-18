import { mount } from 'cypress/react18';
import { createRef } from 'react';
import { before, cy, expect } from 'local-cypress';
import { Passport } from '@imtbl/passport';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { ImmutableConnect } from './connect/ConnectWebComponent';
import { ImmutableBridge } from './bridge/BridgeWebComponent';
import { cyIntercept, cySmartGet } from '../lib/testUtils';

describe('ImmutableWebComponent', () => {
  before(() => {
    cyIntercept();
    window.customElements.define('imtbl-connect', ImmutableConnect);
  });

  it('should mount the web component into the DOM and inject Passport using JS', () => {
    const reference = createRef<ImmutableConnect>();
    const testPassportInstance = {
      connectEvm: cy.stub(),
    } as any as Passport;
    mount(
      <imtbl-connect ref={reference} />,
    ).then(() => {
      (document.getElementsByTagName('imtbl-connect')[0] as ImmutableConnect)?.addPassportOption(testPassportInstance);
    }).then(() => {
      expect(
        (document.getElementsByTagName('imtbl-connect')[0] as ImmutableConnect).passport,
      ).to.eq(testPassportInstance);
    });
  });
});

describe('BridgeWebComponent with Passport', () => {
  before(() => {
    window.customElements.define('imtbl-bridge', ImmutableBridge);
  });

  beforeEach(() => {
    cyIntercept();
  });

  it('should show BridgeComingSoon screen when mounting bridge widget with passport provider', () => {
    const reference = createRef<ImmutableBridge>();
    const testPassportProvider = {
      provider: { isPassport: true } as ExternalProvider,
    } as any as Web3Provider;

    mount(
      <imtbl-bridge ref={reference} />,
    ).then(() => {
      (document.getElementsByTagName('imtbl-bridge')[0] as ImmutableBridge)?.setProvider(testPassportProvider);
    }).then(() => {
      expect(
        (document.getElementsByTagName('imtbl-bridge')[0] as ImmutableConnect).provider,
      ).to.eq(testPassportProvider);

      cySmartGet('bridge-coming-soon').should('be.visible');
    });
  });

  it('should show BridgeComingSoon screen when mounting bridge widget with passport walletProvider', () => {
    const reference = createRef<ImmutableBridge>();
    const testPassportInstance = {
      connectEvm: cy.stub().returns({
        isPassport: true,
        request: cy.stub(),
      }),
    } as any as Passport;
    mount(
      <imtbl-bridge ref={reference} />,
    ).then(() => {
      (document.getElementsByTagName('imtbl-bridge')[0] as ImmutableBridge)?.addPassportOption(testPassportInstance);
    }).then(() => {
      reference.current?.setAttribute('walletProvider', WalletProviderName.PASSPORT);
    });

    cySmartGet('bridge-coming-soon').should('be.visible');
  });
});
