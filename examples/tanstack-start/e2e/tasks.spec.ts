import { expect, type Page, test } from "@playwright/test";

// ─── Helpers ───

/**
 * Waits for React to finish hydrating the SSR page.
 *
 * TanStack Start renders pages server-side, so the HTML (including button
 * disabled states) is present before React attaches event handlers.
 * Without this wait, clicks can fire on "dead" SSR markup.
 *
 * Detects hydration by polling for React's internal `__reactFiber$` property
 * on DOM elements — only set after `hydrateRoot` completes.
 */
async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () => {
      return Object.getOwnPropertyNames(document.body).some((k) =>
        k.startsWith("__reactFiber$")
      );
    },
    undefined,
    { timeout: 15_000 }
  );
}

/**
 * Clicks the "Filter" button, types the column name to narrow the list,
 * then clicks the first matching AutocompleteItem to open Phase 2.
 *
 * Base UI Autocomplete items don't expose role="option" reliably, so we
 * target them via the data-slot attribute added by the local wrapper.
 */
async function openFilter(page: Page, columnName: string) {
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  await page.getByPlaceholder("Filter columns...").fill(columnName);
  await page.locator('[data-slot="autocomplete-item"]').first().click();
}

// ─── Existing tests ───

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
});

test.describe("Tasks page", () => {
  test("table renders correctly", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible();
    await expect(page.getByText(/\d+ tasks total/)).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();

    const rows = page.getByRole("table").getByRole("row");
    // header row + at least 1 data row
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThanOrEqual(2);

    await expect(page.getByText(/Page 1 of \d+/)).toBeVisible();
  });

  test("pagination — next and previous", async ({ page }) => {
    await waitForHydration(page);

    const firstPageBtn = page.getByRole("button", { name: "First page" });
    const prevPageBtn = page.getByRole("button", { name: "Previous page" });
    const nextPageBtn = page.getByRole("button", { name: "Next page" });

    await expect(firstPageBtn).toBeDisabled();
    await expect(prevPageBtn).toBeDisabled();
    await expect(nextPageBtn).toBeEnabled();

    await nextPageBtn.click();
    await page.waitForURL((url) => url.searchParams.get("page") === "2");
    await expect(page.getByText(/Page 2 of \d+/)).toBeVisible();

    await prevPageBtn.click();
    await page.waitForURL((url) => !url.searchParams.has("page"));
    await expect(page.getByText(/Page 1 of \d+/)).toBeVisible();
  });

  test("pagination — first and last page", async ({ page }) => {
    await waitForHydration(page);

    const firstPageBtn = page.getByRole("button", { name: "First page" });
    const lastPageBtn = page.getByRole("button", { name: "Last page" });
    const nextPageBtn = page.getByRole("button", { name: "Next page" });

    const pageText = page.getByText(/Page \d+ of (\d+)/);
    await expect(pageText).toBeVisible();
    const totalPages = await pageText
      .textContent()
      .then((t) => t?.match(/of (\d+)/)?.[1]);

    await lastPageBtn.click();
    await page.waitForURL((url) => url.searchParams.get("page") === totalPages);
    await expect(
      page.getByText(`Page ${totalPages} of ${totalPages}`)
    ).toBeVisible();
    await expect(nextPageBtn).toBeDisabled();
    await expect(lastPageBtn).toBeDisabled();

    await firstPageBtn.click();
    await page.waitForURL((url) => !url.searchParams.has("page"));
    await expect(page.getByText(/Page 1 of \d+/)).toBeVisible();
  });
});

// ─── Rows per page tests ───

/**
 * Shadcn's Select renders a <button role="combobox">, not a native <select>.
 * Open it by clicking the trigger, then click the option in the listbox.
 */
async function selectRowsPerPage(page: Page, value: string) {
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: value, exact: true }).click();
}

test.describe("pagination — rows per page", () => {
  test("default value is 10", async ({ page }) => {
    await expect(page.getByRole("combobox")).toContainText("10");
  });

  test("changing to 20 updates URL and renders up to 20 rows", async ({
    page,
  }) => {
    await selectRowsPerPage(page, "20");
    await page.waitForURL((url) => url.searchParams.get("perPage") === "20");

    const rows = page.getByRole("table").getByRole("row");
    // header + up to 20 data rows
    expect(await rows.count()).toBeLessThanOrEqual(21);
    await expect(page.getByRole("combobox")).toContainText("20");
  });

  test("changing to 50 updates URL", async ({ page }) => {
    await selectRowsPerPage(page, "50");
    await page.waitForURL((url) => url.searchParams.get("perPage") === "50");
    await expect(page.getByRole("combobox")).toContainText("50");
  });

  test("seeding via URL shows correct value in select", async ({ page }) => {
    await page.goto("/?perPage=30");
    await waitForHydration(page);

    await expect(page.getByRole("combobox")).toContainText("30");
  });

  test("changing page size resets to page 1", async ({ page }) => {
    const nextPageBtn = page.getByRole("button", { name: "Next page" });
    await nextPageBtn.click();
    await page.waitForURL((url) => url.searchParams.get("page") === "2");

    await selectRowsPerPage(page, "20");
    await page.waitForURL((url) => url.searchParams.get("perPage") === "20");

    await expect(page.getByText(/Page 1 of \d+/)).toBeVisible();
  });
});

// ─── Filter helpers ───

/**
 * Switches the operator on the active filter chip.
 * Clicks the current operator button to open the dropdown menu,
 * then clicks the target operator radio item.
 */
async function changeOperator(
  page: Page,
  currentLabel: string,
  targetLabel: string
) {
  await page.getByRole("button", { name: currentLabel, exact: true }).click();
  await page
    .getByRole("menuitemradio", { name: targetLabel, exact: true })
    .click();
}

/**
 * Adds a text filter with the given value and waits for URL update.
 */
async function addTextFilter(page: Page, value: string) {
  await openFilter(page, "Title");
  await page.getByPlaceholder("Filter Title...").fill(value);
  await page.getByPlaceholder("Filter Title...").press("Enter");
  await page.waitForURL(/filters=/);
}

/**
 * Fills a Base UI NumberField input.
 *
 * Base UI NumberField renders two inputs: a visible `input[type="text"]`
 * (role="textbox", used for display/interaction) and a hidden
 * `input[type="number"]` (role="spinbutton", managed internally by Base UI).
 * Playwright's `fill` on the spinbutton times out because it is not directly
 * interactive — we must target the textbox inside the active dialog instead.
 */
async function fillNumberField(page: Page, value: string) {
  const input = page.getByRole("dialog").getByRole("textbox");
  await input.fill(value);
}

/**
 * Clicks an option value item inside an open autocomplete checkbox list.
 * Phase 2 option/multiOption selectors use AutocompleteCheckboxItem,
 * which carries data-slot="autocomplete-checkbox-item".
 */
async function selectOptionValue(page: Page, value: string) {
  await page
    .locator('[data-slot="autocomplete-checkbox-item"]')
    .filter({ hasText: value })
    .click();
}

/**
 * Adds a priority filter by selecting a value and waits for URL update.
 */
async function addOptionFilter(page: Page, column: string, value: string) {
  await openFilter(page, column);
  await selectOptionValue(page, value);
  await page.keyboard.press("Escape");
  await expect(page.getByPlaceholder("Filter columns...")).not.toBeVisible();
  await page.waitForURL(/filters=/);
}

// ─── Filter tests ───

test.describe("filter — text (Title)", () => {
  test("contains (default)", async ({ page }) => {
    await addTextFilter(page, "auth");

    await page.waitForURL(/filters=/);
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("does not contain", async ({ page }) => {
    await addTextFilter(page, "auth");
    await changeOperator(page, "Contains", "Does not contain");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("is", async ({ page }) => {
    await addTextFilter(page, "Task 1: Fix bug in auth");
    await changeOperator(page, "Contains", "Is");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("is not", async ({ page }) => {
    await addTextFilter(page, "Task 1: Fix bug in auth");
    await changeOperator(page, "Contains", "Is not");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("is empty", async ({ page }) => {
    await addTextFilter(page, "placeholder");
    await changeOperator(page, "Contains", "Is empty");

    // Valueless operator — no input shown, filter applies immediately
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("is not empty", async ({ page }) => {
    await addTextFilter(page, "placeholder");
    await changeOperator(page, "Contains", "Is not empty");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("remove via chip", async ({ page }) => {
    await addTextFilter(page, "task");

    await page.getByRole("button", { name: "Remove filter" }).click();
    await page.waitForURL((url) => !url.toString().includes("filters="));
    await expect(
      page.getByRole("button", { name: "Remove filter" })
    ).not.toBeVisible();
  });
});

test.describe("filter — option (Priority)", () => {
  test("is (default)", async ({ page }) => {
    await addOptionFilter(page, "Priority", "High");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("is not", async ({ page }) => {
    await addOptionFilter(page, "Priority", "High");
    await changeOperator(page, "Is", "Is not");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("is any of (auto-switches when selecting multiple values)", async ({
    page,
  }) => {
    // Add first value
    await addOptionFilter(page, "Priority", "High");

    // Open value popover and add a second value
    await page.getByRole("button", { name: "High", exact: true }).click();
    await selectOptionValue(page, "Urgent");
    await page.keyboard.press("Escape");

    // Operator auto-switches from "Is" to "Is any of" when 2+ values
    await expect(
      page.getByRole("button", { name: "Is any of", exact: true })
    ).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("is none of", async ({ page }) => {
    // Add first value
    await addOptionFilter(page, "Priority", "High");

    // Open value popover and add a second value
    await page.getByRole("button", { name: "High", exact: true }).click();
    await selectOptionValue(page, "Urgent");
    await page.keyboard.press("Escape");

    await changeOperator(page, "Is any of", "Is none of");

    await expect(page.getByRole("table")).toBeVisible();
  });
});

test.describe("filter — multiOption (Status)", () => {
  test("include (default — single value)", async ({ page }) => {
    await addOptionFilter(page, "Status", "In Progress");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("exclude", async ({ page }) => {
    await addOptionFilter(page, "Status", "Done");
    await changeOperator(page, "Include", "Exclude");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("include any of (auto-switches with multiple values)", async ({
    page,
  }) => {
    await addOptionFilter(page, "Status", "In Progress");

    // Open value popover and add a second value
    await page
      .getByRole("button", { name: "In Progress", exact: true })
      .click();
    await selectOptionValue(page, "Done");
    await page.keyboard.press("Escape");

    await expect(
      page.getByRole("button", { name: "Include any of", exact: true })
    ).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("exclude if all", async ({ page }) => {
    await addOptionFilter(page, "Status", "In Progress");

    await page
      .getByRole("button", { name: "In Progress", exact: true })
      .click();
    await selectOptionValue(page, "Done");
    await page.keyboard.press("Escape");

    await changeOperator(page, "Include any of", "Exclude if all");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("include all of", async ({ page }) => {
    await addOptionFilter(page, "Status", "In Progress");

    await page
      .getByRole("button", { name: "In Progress", exact: true })
      .click();
    await selectOptionValue(page, "Done");
    await page.keyboard.press("Escape");

    await changeOperator(page, "Include any of", "Include all of");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("exclude if any of", async ({ page }) => {
    await addOptionFilter(page, "Status", "In Progress");

    await page
      .getByRole("button", { name: "In Progress", exact: true })
      .click();
    await selectOptionValue(page, "Done");
    await page.keyboard.press("Escape");

    await changeOperator(page, "Include any of", "Exclude if any of");

    await expect(page.getByRole("table")).toBeVisible();
  });
});

test.describe("filter — date (Created At)", () => {
  test("is (default)", async ({ page }) => {
    await openFilter(page, "Created At");
    await page.getByRole("gridcell").locator("button").first().click();

    await page.waitForURL(/filters=/);
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("is not", async ({ page }) => {
    await openFilter(page, "Created At");
    await page.getByRole("gridcell").locator("button").first().click();
    await page.waitForURL(/filters=/);

    await changeOperator(page, "Is", "Is not");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("after", async ({ page }) => {
    await openFilter(page, "Created At");
    await page.getByRole("gridcell").locator("button").first().click();
    await page.waitForURL(/filters=/);

    await changeOperator(page, "Is", "After");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("before", async ({ page }) => {
    await openFilter(page, "Created At");
    await page.getByRole("gridcell").locator("button").first().click();
    await page.waitForURL(/filters=/);

    await changeOperator(page, "Is", "Before");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("between (via URL)", async ({ page }) => {
    const filter = encodeURIComponent(
      JSON.stringify([
        {
          filterId: "test",
          columnId: "createdAt",
          type: "date",
          operator: "is between",
          values: ["2026-01-15", "2026-02-15"],
        },
      ])
    );
    await page.goto(`/?filters=${filter}`);
    await waitForHydration(page);

    await expect(
      page.getByRole("button", { name: "Between", exact: true })
    ).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();

    // Can switch to "Not between" from "Between"
    await changeOperator(page, "Between", "Not between");
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("not between (via URL)", async ({ page }) => {
    const filter = encodeURIComponent(
      JSON.stringify([
        {
          filterId: "test",
          columnId: "createdAt",
          type: "date",
          operator: "is not between",
          values: ["2026-01-15", "2026-02-15"],
        },
      ])
    );
    await page.goto(`/?filters=${filter}`);
    await waitForHydration(page);

    await expect(
      page.getByRole("button", { name: "Not between", exact: true })
    ).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });
});

test.describe("filter — number (Est. Hours)", () => {
  test("is (default)", async ({ page }) => {
    await openFilter(page, "Est. Hours");
    await fillNumberField(page, "5");
    await page.keyboard.press("Enter");

    await page.waitForURL(/filters=/);
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("is not", async ({ page }) => {
    await openFilter(page, "Est. Hours");
    await fillNumberField(page, "5");
    await page.keyboard.press("Enter");
    await page.waitForURL(/filters=/);

    await changeOperator(page, "Is", "Is not");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("greater than", async ({ page }) => {
    await openFilter(page, "Est. Hours");
    await fillNumberField(page, "10");
    await page.keyboard.press("Enter");
    await page.waitForURL(/filters=/);

    await changeOperator(page, "Is", "Greater than");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("greater than or equal to", async ({ page }) => {
    await openFilter(page, "Est. Hours");
    await fillNumberField(page, "10");
    await page.keyboard.press("Enter");
    await page.waitForURL(/filters=/);

    await changeOperator(page, "Is", "Greater than or equal to");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("less than", async ({ page }) => {
    await openFilter(page, "Est. Hours");
    await fillNumberField(page, "20");
    await page.keyboard.press("Enter");
    await page.waitForURL(/filters=/);

    await changeOperator(page, "Is", "Less than");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("less than or equal to", async ({ page }) => {
    await openFilter(page, "Est. Hours");
    await fillNumberField(page, "20");
    await page.keyboard.press("Enter");
    await page.waitForURL(/filters=/);

    await changeOperator(page, "Is", "Less than or equal to");

    await expect(page.getByRole("table")).toBeVisible();
  });

  test("between (via URL — not reachable from single-value operator menu)", async ({
    page,
  }) => {
    // "is between" is only reachable via auto-switch, so seed via URL
    const filter = encodeURIComponent(
      JSON.stringify([
        {
          filterId: "test",
          columnId: "estimatedHours",
          type: "number",
          operator: "is between",
          values: [5, 20],
        },
      ])
    );
    await page.goto(`/?filters=${filter}`);
    await waitForHydration(page);

    await expect(
      page.getByRole("button", { name: "Between", exact: true })
    ).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();

    // Can switch to "Not between" from "Between"
    await changeOperator(page, "Between", "Not between");
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("not between (via URL)", async ({ page }) => {
    const filter = encodeURIComponent(
      JSON.stringify([
        {
          filterId: "test",
          columnId: "estimatedHours",
          type: "number",
          operator: "is not between",
          values: [5, 20],
        },
      ])
    );
    await page.goto(`/?filters=${filter}`);
    await waitForHydration(page);

    await expect(
      page.getByRole("button", { name: "Not between", exact: true })
    ).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });
});

// ─── View Options helpers ───

async function openViewOptions(page: Page) {
  await page.getByRole("button", { name: "View", exact: true }).click();
  await expect(page.getByPlaceholder("Search columns...")).toBeVisible();
}

function viewItem(page: Page, label: string) {
  return page
    .locator('[data-slot="autocomplete-checkbox-item"]')
    .filter({ hasText: label });
}

// ─── View Options tests ───

test.describe("DataTableViewOptions", () => {
  test("opens the popover when the View button is clicked", async ({
    page,
  }) => {
    await openViewOptions(page);
    await expect(page.getByPlaceholder("Search columns...")).toBeVisible();
  });

  test("lists all hideable columns", async ({ page }) => {
    await openViewOptions(page);

    // The "select" column (enableHiding: false, no accessorFn) is excluded.
    // The remaining 6 accessor columns should all appear.
    for (const label of [
      "ID",
      "Title",
      "Priority",
      "Status",
      "Created At",
      "Est. Hours",
    ]) {
      await expect(viewItem(page, label)).toBeVisible();
    }
  });

  test("shows exactly 6 hideable columns", async ({ page }) => {
    await openViewOptions(page);

    const items = page.locator('[data-slot="autocomplete-checkbox-item"]');
    await expect(items).toHaveCount(6);
  });

  test("search input filters the column list", async ({ page }) => {
    await openViewOptions(page);

    await page.getByPlaceholder("Search columns...").fill("title");

    await expect(viewItem(page, "Title")).toBeVisible();
    // Non-matching columns should disappear
    await expect(viewItem(page, "Priority")).not.toBeVisible();
    await expect(viewItem(page, "Status")).not.toBeVisible();
  });

  test("shows empty state when no columns match the search", async ({
    page,
  }) => {
    await openViewOptions(page);

    await page.getByPlaceholder("Search columns...").fill("xxxxxxxxxx");
    await expect(
      page.locator('[data-slot="autocomplete-empty"]')
    ).toBeVisible();
    await expect(page.getByText("No columns found.")).toBeVisible();
  });

  test("all columns are checked (visible) by default", async ({ page }) => {
    await openViewOptions(page);

    const indicators = page.locator(
      '[data-slot="autocomplete-checkbox-item-indicator"]'
    );
    await expect(indicators).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      // A CheckIcon svg is rendered inside the indicator when checked=true
      await expect(indicators.nth(i).locator("svg")).toBeVisible();
    }
  });

  test("toggling a column off hides it from the table", async ({ page }) => {
    const titleHeader = page.getByRole("columnheader", { name: "Title" });
    await expect(titleHeader).toBeVisible();

    await openViewOptions(page);
    await viewItem(page, "Title").click();

    await page.keyboard.press("Escape");
    await expect(page.getByPlaceholder("Search columns...")).not.toBeVisible();

    await expect(titleHeader).not.toBeVisible();
  });

  test("toggling a column back on restores it in the table", async ({
    page,
  }) => {
    await openViewOptions(page);

    const item = viewItem(page, "Title");
    // Toggle off, then immediately back on — popover stays open
    await item.click();
    await item.click();

    await page.keyboard.press("Escape");
    await expect(page.getByPlaceholder("Search columns...")).not.toBeVisible();

    await expect(
      page.getByRole("columnheader", { name: "Title" })
    ).toBeVisible();
  });

  test("closing and reopening the popover retains column visibility state", async ({
    page,
  }) => {
    // Hide "Priority"
    await openViewOptions(page);
    await viewItem(page, "Priority").click();

    // Close
    await page.keyboard.press("Escape");
    await expect(page.getByPlaceholder("Search columns...")).not.toBeVisible();

    // Reopen: the Priority indicator should have no checkmark svg
    await openViewOptions(page);
    const priorityIndicator = viewItem(page, "Priority").locator(
      '[data-slot="autocomplete-checkbox-item-indicator"]'
    );
    await expect(priorityIndicator.locator("svg")).not.toBeVisible();
  });

  test("can hide multiple columns in one popover session", async ({ page }) => {
    await openViewOptions(page);

    await viewItem(page, "Priority").click();
    await viewItem(page, "Status").click();

    await page.keyboard.press("Escape");

    await expect(
      page.getByRole("columnheader", { name: "Priority" })
    ).not.toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Status" })
    ).not.toBeVisible();
    // Other columns remain
    await expect(
      page.getByRole("columnheader", { name: "Title" })
    ).toBeVisible();
  });
});

// ─── Filter composition tests ───

test.describe("filter — join operator", () => {
  test("toggle And/Or when multiple filters active", async ({ page }) => {
    await addTextFilter(page, "task");

    await addOptionFilter(page, "Priority", "High");

    const andBtn = page.getByRole("button", { name: "And", exact: true });
    const orBtn = page.getByRole("button", { name: "Or", exact: true });

    await expect(andBtn).toBeVisible();
    await expect(orBtn).toBeVisible();

    // Switch to Or
    await orBtn.click();
    await page.waitForURL(/joinOperator=or/);

    // Switch back to And (default — gets stripped from URL)
    await andBtn.click();
    await page.waitForURL((url) => !url.toString().includes("joinOperator=or"));
  });
});

test.describe("filter — clear all", () => {
  test("clears all active filters", async ({ page }) => {
    await addTextFilter(page, "task");

    await addOptionFilter(page, "Priority", "High");

    // Clear all
    await page.getByRole("button", { name: "Clear all" }).click();
    await page.waitForURL((url) => !url.toString().includes("filters="));
    await expect(
      page.getByRole("button", { name: "Clear all" })
    ).not.toBeVisible();
  });
});

// ─── ActionBar tests ───

test.describe("ActionBar — row selection", () => {
  test("appears when a row checkbox is clicked", async ({ page }) => {
    const actionBar = page.locator('[data-slot="action-bar"]');
    await expect(actionBar).not.toBeVisible();

    // Click first data row checkbox
    await page.getByLabel("Select row").first().click();

    await expect(actionBar).toBeVisible();
    await expect(page.getByText("1 selected")).toBeVisible();
  });

  test("updates count when multiple rows are selected", async ({ page }) => {
    const checkboxes = page.getByLabel("Select row");

    await checkboxes.nth(0).click();
    await expect(page.getByText("1 selected")).toBeVisible();

    await checkboxes.nth(1).click();
    await expect(page.getByText("2 selected")).toBeVisible();

    await checkboxes.nth(2).click();
    await expect(page.getByText("3 selected")).toBeVisible();
  });

  test("appears with all rows selected via header checkbox", async ({
    page,
  }) => {
    await page.getByLabel("Select all").click();

    const actionBar = page.locator('[data-slot="action-bar"]');
    await expect(actionBar).toBeVisible();
    // Default page size is 10
    await expect(page.getByText("10 selected")).toBeVisible();
  });

  test("clear selection button dismisses the action bar", async ({ page }) => {
    await page.getByLabel("Select row").first().click();

    const actionBar = page.locator('[data-slot="action-bar"]');
    await expect(actionBar).toBeVisible();

    await page.getByRole("button", { name: "Clear selection" }).click();
    await expect(actionBar).not.toBeVisible();
  });

  test("Escape key dismisses the action bar", async ({ page }) => {
    await page.getByLabel("Select row").first().click();

    const actionBar = page.locator('[data-slot="action-bar"]');
    await expect(actionBar).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(actionBar).not.toBeVisible();
  });

  test("deselecting all rows hides the action bar", async ({ page }) => {
    const firstCheckbox = page.getByLabel("Select row").first();

    await firstCheckbox.click();
    await expect(page.locator('[data-slot="action-bar"]')).toBeVisible();

    // Uncheck the same row
    await firstCheckbox.click();
    await expect(page.locator('[data-slot="action-bar"]')).not.toBeVisible();
  });

  test("shows Export and Delete buttons", async ({ page }) => {
    await page.getByLabel("Select row").first().click();

    const actionBar = page.locator('[data-slot="action-bar"]');
    await expect(actionBar).toBeVisible();

    await expect(
      actionBar.getByRole("button", { name: "Export" })
    ).toBeVisible();
    await expect(
      actionBar.getByRole("button", { name: "Delete" })
    ).toBeVisible();
  });
});
