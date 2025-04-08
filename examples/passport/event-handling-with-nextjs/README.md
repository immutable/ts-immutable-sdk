# Immutable Passport Event Handling with Next.js

This example demonstrates how to handle events from the Immutable Passport SDK in a Next.js application.

## Getting Started

1. Clone the repository
2. Install dependencies
```bash
npm install
```
3. Create a `.env` file with your Immutable Hub credentials:
```bash
NEXT_PUBLIC_PUBLISHABLE_KEY=<YOUR_PUBLISHABLE_KEY>
NEXT_PUBLIC_CLIENT_ID=<YOUR_CLIENT_ID>
```
4. Run the development server:
```bash
npm run dev
```

## Features

- Event handling for Passport SDK events
- Login and logout functionality
- Real-time event logging
- Handles authentication redirects

## Events Demonstrated

- LOGIN_SUCCESS
- LOGIN_FAILURE
- LOGOUT_SUCCESS
- LOGOUT_FAILURE
- NETWORK_CHANGED
- ACCOUNT_CHANGED 