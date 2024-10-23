import { Page } from "@playwright/test";

export type CheckoutVersionConfig = {
  compatibleVersionMarkers: string[];
};

export const interceptCheckoutVersionConfig = async (page: Page, checkoutWidgetsVersion: CheckoutVersionConfig) => {
  return page.route('https://checkout-api.sandbox.immutable.com/v1/config', async (route) => {
    const response = await route.fetch();
    const json = await response.json();

    // Modify the compatibleVersionMarkers
    json.checkoutWidgetsVersion = checkoutWidgetsVersion;

    // Fulfill the request with the modified JSON
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(json),
    });

    console.log(`
    Checkout config successfully intercepted:
    Request:    ${route.request().url()}
    Modified:   checkoutWidgetsVersion = ${JSON.stringify(checkoutWidgetsVersion)}
    ------------------------------
    `);
  });
};