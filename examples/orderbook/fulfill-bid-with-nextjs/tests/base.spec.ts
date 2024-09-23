import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page", () => {
  test("has title, heading and fulfillment links", async ({ page }) => {
    await expect(page).toHaveTitle("Orderbook SDK - Fulfill bid with NextJS");
    await expect(page.getByRole("heading", { name: "Orderbook - Fulfill bid" })).toBeVisible();
    await expect(page.getByTestId("fulfill-bid-with-erc721")).toBeVisible();
    await expect(page.getByTestId("fulfill-bid-with-erc1155")).toBeVisible();
  });
});

test.describe("fulfill bid with ERC721", () => {
  test("loads fulfillment screen", async ({ page }) => {
    await page.getByTestId("fulfill-bid-with-erc721").click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("fulfill bid with ERC1155", () => {
  test("loads fulfillment screen", async ({ page }) => {
    await page.getByTestId("fulfill-bid-with-erc1155").click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
