import { cy } from "local-cypress";
import { GeoblockLoader } from "./GeoblockLoader";
import { mount } from "cypress/react18";
import { Checkout } from "@imtbl/checkout-sdk";

describe('GeoblockLoader', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  it('should show loading view while waiting for promise', () => {
    const checkout = {
      isSwapAvailable: () => new Promise(() => {}),
    } as Checkout;

    mount(
      <GeoblockLoader
        widget={<div id="inner-widget">Inner Widget</div>}
        serviceUnavailableView={<div id="unavailable-view">Service Unavailable</div>}
        loadingView={<div id="loading-view">Loading</div>}
        checkout={checkout}
      />
    );

    cy.get('#loading-view').should('exist');
    cy.get('#unavailable-view').should('not.exist');
    cy.get('#inner-widget').should('not.exist');
  });

  it('should load swap widget if service is available', () => {
    const checkout = {
      isSwapAvailable: () => Promise.resolve(true),
    } as Checkout;

    mount(
      <GeoblockLoader
        widget={<div id="inner-widget">Inner Widget</div>}
        serviceUnavailableView={<div id="unavailable-view">Service Unavailable</div>}
        loadingView={<div id="loading-view">Loading</div>}
        checkout={checkout}
      />
    );

    cy.get('#inner-widget').should('exist');
    cy.get('#unavailable-view').should('not.exist');
    cy.get('#loading-view').should('not.exist');
  });

  it('should show service unavailable view if service is unavailable', () => {
    const checkout = {
      isSwapAvailable: () => Promise.resolve(false),
    } as Checkout;

    mount(
      <GeoblockLoader
        widget={<div id="inner-widget">Inner Widget</div>}
        serviceUnavailableView={<div id="unavailable-view">Service Unavailable</div>}
        loadingView={<div id="loading-view">Loading</div>}
        checkout={checkout}
      />
    );

    cy.get('#unavailable-view').should('exist');
    cy.get('#inner-widget').should('not.exist');
    cy.get('#loading-view').should('not.exist');
  });

  it('should show service unavailable view if error thrown', () => {
    const checkout = {
      isSwapAvailable: () => Promise.reject(),
    } as Checkout;

    mount(
      <GeoblockLoader
        widget={<div id="inner-widget">Inner Widget</div>}
        serviceUnavailableView={<div id="unavailable-view">Service Unavailable</div>}
        loadingView={<div id="loading-view">Loading</div>}
        checkout={checkout}
      />
    );

    cy.get('#unavailable-view').should('exist');
    cy.get('#inner-widget').should('not.exist');
    cy.get('#loading-view').should('not.exist');
  });
});