# Treeverse Issues - Local Reproduction Guide

This branch allows you to **reproduce** the three Treeverse issues (SDK 2.12.7) locally. After reproducing each bug, you can **cherry-pick the fixes** from the `BSB-31` branch to verify the corrections.

See `docs/TREEVERSE_ISSUES_ANALYSIS.md` for the full root-cause analysis.

---

## Prerequisites

- Node 20+
- pnpm

```bash
pnpm install
```

---

## Issue 1: Passport login popup opens automatically on page load

**Bug:** Login popup appears immediately when the page loads, instead of only when the user clicks "Connect Wallet".

### How to reproduce

1. **Start the Passport sample app:**
   ```bash
   pnpm --filter @imtbl/passport-sdk-sample-app run dev-with-sdk
   ```

2. **Open** http://localhost:3000

3. **Select "Sandbox"** (not Default) in the environment selector on the initial page.

4. **Observe:** The "Treeverse Flow Simulation (Issue 1)" section appears. On this branch (without the fix), when the page loads, `connectEvm()` triggers `getUserOrLogin()` which opens the login popup immediately.

5. **Expected (bug):** Popup opens on page load.

6. **To verify the fix:** Cherry-pick the fix commits from `BSB-31` (wallet + passport packages). After the fix, no popup on load; popup opens only when clicking "Manual: eth_requestAccounts" or Connect Wallet.

---

## Issue 2: UI does not update after successful login (redirect)

**Bug:** After OAuth redirect, the navbar still shows "Connect Wallet" instead of the wallet address. UI only updates after a full page refresh.

### How to reproduce

1. **Start the Passport sample app:**
   ```bash
   pnpm --filter @imtbl/passport-sdk-sample-app run dev-with-sdk
   ```

2. **Open** http://localhost:3000

3. **Select "Sandbox"** in the environment selector.

4. **Click "Login (Google)"** (or Login (Apple), Login (Facebook)) — the buttons **without** the "Popup" prefix.

5. **Complete OAuth** — you will be redirected to Immutable's OAuth, then back to `/login/redirect-callback`.

6. **Observe:** The redirect-callback page shows "Provider connected" but the wallet address remains **empty**. The `ZkEvmProvider` does not listen for `LOGGED_IN`, so it never emits `ACCOUNTS_CHANGED`.

7. **Expected (bug):** Wallet address is empty.

8. **To verify the fix:** Cherry-pick the fix from `BSB-31` (wallet package). After the fix, the wallet address should appear immediately after `loginCallback`.

---

## Issue 3: Checkout widget stuck in "Crunching Numbers" when paying with IMX

**Bug:** The checkout widget hangs indefinitely on "Crunching Numbers" when paying with IMX on testnet.

### How to reproduce (two scenarios)

#### Scenario A: Simulated routing hang

1. **Build and start the checkout sample app:**
   ```bash
   pnpm build
   pnpm --filter @imtbl/checkout-widgets-sample-app run start
   ```

2. **Open** http://localhost:3000/checkout

3. **Enable "Simulate Issue 3"** — check the checkbox at the top of the page, or add `?simulateIssue3=1` to the URL.

4. **Select "SALE"** in the "Select a Flow" dropdown.

5. **Connect Passport.** Select **IMX** as payment currency.

6. **Click pay with tokens.**

7. **Expected (bug):** The widget hangs indefinitely on "Crunching Numbers" (routing calculator never completes).

#### Scenario B: Mock primary-sales (triggers "Failed to map item requirements")

1. **Build and start** (same as above).

2. **Open** http://localhost:3000/checkout**?mockPrimarySales=1**

3. **Select "SALE"** in the dropdown. Connect Passport. Select **IMX** as payment.

4. **Click pay with tokens.**

5. **Expected (bug):** `CheckoutError: Failed to map item requirements` — the mock returns tIMX with zero address; the code uses `ERC20ItemRequirement` which fails for non-contract addresses.

### To verify the fix

1. **Cherry-pick the checkout fix** from `BSB-31`:
   ```bash
   git cherry-pick <commit-hash-of-checkout-widgets-fix>
   ```

2. **Rebuild:**
   ```bash
   pnpm build
   ```

3. **Scenario A:** With "Simulate Issue 3" enabled, the loading should eventually clear (or timeout). The `smartCheckout` try/finally fix ensures `onComplete` is always called.

4. **Scenario B:** With `?mockPrimarySales=1`, the flow should complete normally. The `NativeItemRequirement` fix handles native tokens with zero address.

---

## Summary of fix commits (BSB-31)

| Issue | Fix location | Commit to cherry-pick |
|-------|--------------|------------------------|
| 1 | wallet, passport | Parâmetro `silent` em `GetUserFunction` |
| 2 | wallet | Listener `LOGGED_IN` no ZkEvmProvider |
| 3 | checkout-widgets | `NativeItemRequirement` para tokens nativos; `smartCheckout` try/finally |

Use `git log BSB-31` to find the relevant commit hashes for cherry-picking.
