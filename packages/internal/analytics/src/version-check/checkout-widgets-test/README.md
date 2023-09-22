# Checkout Widgets (Manual) Test Site

This is a manual test site for the checkout widgets. It is used to test the `sdkVersionCheck` function called by checkout widgets in a local environment.

The run the site, you need to start a local web server to host the built JS bundle, and another web server to host the test website.

## Usage

1. Update the target endpoint the checkout bundle will send version check requests to.

    - Find the `packages/internal/analytics/version-check/versionCheck.ts` file.
    - Update the `imtblApi` variable (near the top of the file) to point to the endpoint you want to send the version check requests to.
    - Suggest using something like `https://webhook.site/` or a local webserver setup to log requests.

2. Build the SDK:

    ```bash
    # from the root of the SDK repo
    yarn build
    ```

2. Start the JS bundle server:

    ```bash
    # in the packages/internal/analytics directory start the JS server
    start:checkout-js-server
    ```

3. Open a browser and navigate to `http://127.0.0.1:8080/browser/checkout.js` to confirm the JS bundle is hosted correctly.
  
    - Search for `"checkout-widgets","0.0.0"` in the JS bundle to confirm the version number is correct.
    - It should be `0.0.0` because the version number for the SDK is not updated in the `package.json` file.

4. Start a web server to host the built JS bundle:

    ```bash
    # in the packages/internal/analytics directory
    start:checkout-web-server
    ```

5. Open a browser and navigate to `http://127.0.0.1:8081/` to confirm the test site is hosted correctly.

    - You should see a title that says `Welcome to the Checkout Widgets Test Page` and the `Connect a wallet` widget loaded on the page.

6. Check the version check request was sent to the endpoint you configured in step 2.

## Cleanup

Remember to revert the changes to the `packages/internal/analytics/version-check/versionCheck.ts` file.
