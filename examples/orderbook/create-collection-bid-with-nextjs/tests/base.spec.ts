import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading and creation links", async ({ page }) => {
    await expect(page).toHaveTitle("Orderbook SDK - Create collection bid with NextJS");
    await expect(page.getByRole("heading", { name: "Orderbook - Create Collection Bid" })).toBeVisible();
    await expect(page.getByTestId("create-collection-bid-with-erc721")).toBeVisible();
    await expect(page.getByTestId("create-collection-bid-with-erc1155")).toBeVisible();
  });
});

test.describe("create collection bid with ERC721", () => {
  test("loads creation screen", async ({ page }) => {
    await page.getByTestId("create-collection-bid-with-erc721").click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("create collection bid with ERC1155", () => {
  test("loads creation screen", async ({ page }) => {
    await page.getByTestId("create-collection-bid-with-erc1155").click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
