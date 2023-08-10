import { mount } from 'cypress/react18';
import { createRef } from 'react';
import { cy, expect } from 'local-cypress';
import { Passport } from '@imtbl/passport';
import { ImmutableConnect } from './connect/ConnectWebComponent';

describe('ImmutableWebComponent', () => {
  beforeEach(() => {
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
      (document.getElementsByTagName('imtbl-connect')[0] as ImmutableConnect)?.setPassport(testPassportInstance);
    }).then(() => {
      expect(
        (document.getElementsByTagName('imtbl-connect')[0] as ImmutableConnect).passport,
      ).to.eq(testPassportInstance);
    });
  });
});
