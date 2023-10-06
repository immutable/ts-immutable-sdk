import { mount } from 'cypress/react18';
import { createRef } from 'react';
import { before, cy, expect } from 'local-cypress';
import { Passport } from '@imtbl/passport';
import { ImmutableConnect } from './connect/ConnectWebComponent';
import { cyIntercept } from '../lib/testUtils';

describe('ImmutableWebComponent', () => {
  before(() => {
    window.customElements.define('imtbl-connect', ImmutableConnect);
  });

  beforeEach(() => {
    cyIntercept();
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
