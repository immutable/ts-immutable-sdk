# Passport SDK - Passport Setup with Next.js Example

This example demonstrates various ways to initialize and configure the Immutable Passport SDK within a Next.js application. It showcases how different configuration options can affect Passport's behavior, particularly around UI overlays and logout modes.

Each configuration is presented on its own dedicated page, accessible from the home page.

Refer to the official [Passport Setup Documentation](https://docs.immutable.com/products/zkEVM/passport/setup) for more details.

## Getting Started

### Prerequisites

- Node.js v20 or later
- pnpm (or npm/yarn)

### Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/immutable/ts-immutable-sdk.git
    cd ts-immutable-sdk/examples/passport/passport-setup-with-nextjs
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**

    Copy the example environment file:

    ```bash
    cp .env.example .env
    ```

    Log in to the [Immutable Hub](https://hub.immutable.com/), create a new project (or use an existing one) for Immutable zkEVM Testnet.

    Navigate to the "Passport" section within your project environment:

    *   Create a new Passport Client:
        *   **Application Type:** Web
        *   **Application Name:** Passport Setup Example (or similar)
        *   **Redirect URLs:** `http://localhost:3000/redirect`
        *   **Logout URLs:** `http://localhost:3000/logout`
    *   Navigate to the "API Keys" section.

    Update the `.env` file with your:

    *   `NEXT_PUBLIC_CLIENT_ID`: Your Passport Client ID.
    *   `NEXT_PUBLIC_PUBLISHABLE_KEY`: Your Publishable API Key.

## Running the Example

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Click the links to navigate to pages demonstrating each Passport setup configuration.

## Project Structure

-   `/src/app/page.tsx`: Main landing page with links to each configuration test page.
-   `/src/app/passport-setup-default/page.tsx`: Page for the default configuration.
-   `/src/app/passport-setup-disabled-overlays/page.tsx`: Page for the disabled overlays configuration.
-   `/src/app/passport-setup-minimal-scopes/page.tsx`: Page for the minimal scopes configuration.
-   `/src/app/passport-setup-all-scopes/page.tsx`: Page for the all scopes configuration.
-   `/src/app/passport-setup-silent-logout/page.tsx`: Page for the silent logout configuration.
-   `/src/app/passport-setup-generic-overlay-disabled/page.tsx`: Page for the generic overlay disabled configuration.
-   `/src/app/passport-setup-blocked-overlay-disabled/page.tsx`: Page for the blocked overlay disabled configuration.
-   `/src/app/redirect/page.tsx`: Handles the Passport login callback.
-   `/src/app/logout/page.tsx`: Handles the Passport logout redirect.
-   `/src/app/utils/setupDefault.ts`: Contains the various `Passport` instance initializations with different configurations.
-   `/src/app/utils/wrapper.tsx`: Provides the application context, including the Passport provider.

## Key Configurations Demonstrated

The example app allows you to test the following configurations, each on its own dedicated page accessed via the home page links:

-   **Default Configuration** (`/passport-setup-default`)
-   **Popup Overlays Disabled** (`/passport-setup-disabled-overlays`)
-   **Minimal Scopes** (`/passport-setup-minimal-scopes`)
-   **All Scopes** (`/passport-setup-all-scopes`)
-   **Silent Logout Mode** (`/passport-setup-silent-logout`)
-   **Generic Popup Overlay Disabled** (`/passport-setup-generic-overlay-disabled`)
-   **Blocked Popup Overlay Disabled** (`/passport-setup-blocked-overlay-disabled`)

By logging in and out on each page, you can observe the specific behavior of that Passport instance configuration.

## Feature Management

### Adding New Features/Configurations
To add a new configuration example:
1. Add the new Passport instance initialization to `src/app/utils/setupDefault.ts`.
2. Create a new directory `src/app/passport-setup-{key}` (e.g., `passport-setup-new-config`).
3. Create a `page.tsx` file within the new directory, copying the structure from an existing configuration page (like `passport-setup-default/page.tsx`).
4. Update the new `page.tsx` to import and use the correct Passport instance from `setupDefault.ts` and set the correct `description`.
5. Add the new route key, description, and path to `instanceRoutes` in `src/app/page.tsx` to generate the link.

### Updating Features
To update an existing configuration's behavior:
1. Modify the corresponding Passport instance initialization in `src/app/utils/setupDefault.ts`.
2. Update the logic within the specific configuration's page file (e.g., `src/app/passport-setup-default/page.tsx`) if necessary.

This comprehensive guide will help you safely add or update feature implementations while respecting existing code and manual edits. 