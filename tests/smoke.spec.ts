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
  // Scope this to the form: browser extensions may add unrelated global alerts.
  await expect(page.locator("form").getByRole("alert")).toHaveCount(0);
});

test("find mentor keeps the free-text situation field bounded and validates an empty submission", async ({ page }) => {
  await page.goto("/find-mentor");
  const context = page.getByLabel("What's going on?");
  await context.fill("a".repeat(6001));
  await expect(context).toHaveValue("a".repeat(6000));
  await context.fill("");
  await page.getByRole("button", { name: /Find my matches/i }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("Give us a little more context");
});

test("mobile navigation opens, exposes its links, and closes after navigation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Toggle menu" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const navigation = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(navigation.getByRole("link", { name: "AI mentor" })).toBeVisible();
  await navigation.getByRole("link", { name: "AI mentor" }).click();
  await expect(page).toHaveURL("/ai-mentor");
  await expect(page.getByRole("button", { name: "Toggle menu" })).toHaveCount(0);
});

test("AI mentor page renders a bounded chat field without requiring credentials", async ({ page }) => {
  await page.goto("/ai-mentor/arjun-mehta");
  await expect(page.getByRole("heading", { name: "Arjun Mehta" })).toBeVisible();
  await expect(page.getByPlaceholder("Ask Arjun Mehta anything…")).toHaveAttribute("maxlength", "4000");
});

test("articles loads and opens the first article", async ({ page }) => {
  await page.goto("/articles");
  const firstArticle = page.locator('a[href^="/articles/"]').first();
  await expect(firstArticle).toBeVisible();
  await firstArticle.click();
  await expect(page).toHaveURL(/\/articles\/[^/]+$/);
  await expect(page.locator("h1")).toBeVisible();
});

test("mentor profile handles a missing public record", async ({ page }) => {
  await page.goto("/mentors/not-a-real-mentor");
  await expect(page.getByRole("heading", { name: "Mentor not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse mentors" })).toBeVisible();
});
