import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading and creation links", async ({ page }) => {
    await expect(page).toHaveTitle("Orderbook SDK - Create listing with NextJS");
    await expect(page.getByRole("heading", { name: "Orderbook - Create Listing" })).toBeVisible();
    await expect(page.getByTestId("create-listing-with-erc721")).toBeVisible();
    await expect(page.getByTestId("create-listing-with-erc1155")).toBeVisible();
  });
});

test.describe("create listing with ERC721", () => {
  test("loads creation screen", async ({ page }) => {
    await page.getByTestId("create-listing-with-erc721").click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("create listing with ERC1155", () => {
  test("loads creation screen", async ({ page }) => {
    await page.getByTestId("create-listing-with-erc1155").click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
