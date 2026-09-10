import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "The right conversation can change what comes next." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Find a mentor/i }).first()).toBeVisible();
});

test("find mentor loads and accepts the required context", async ({ page }) => {
  await page.goto("/find-mentor");
  const context = page.getByLabel("What's going on?");
  await expect(context).toBeVisible();
  await context.fill("I am exploring my next career direction and want practical guidance from someone with relevant experience.");
  await expect(page.getByRole("button", { name: /Find my matches/i })).toBeEnabled();
  await expect(page.locator('[role="alert"]')).toHaveCount(0);
});

test("articles loads and opens the first article", async ({ page }) => {
  await page.goto("/articles");
  const firstArticle = page.locator('a[href^="/articles/"]').first();
  await expect(firstArticle).toBeVisible();
  await firstArticle.click();
  await expect(page).toHaveURL(/\/articles\/[^/]+$/);
  await expect(page.locator("h1")).toBeVisible();
});
