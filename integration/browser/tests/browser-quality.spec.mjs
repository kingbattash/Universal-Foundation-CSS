import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const widths=[320,768,1440];
const paths={
  editorial:"/examples/project-theme/preview-editorial.html",
  operations:"/examples/project-theme/preview-operations.html",
};
const wcagTags=["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"];
const waitForStyles=async(page)=>{
  await page.evaluate(async()=>{await document.fonts.ready;});
};
const horizontalOverflow=async(page)=>page.evaluate(()=>{
  const html=document.documentElement;
  return {scroll:html.scrollWidth,client:html.clientWidth,overflow:html.scrollWidth-html.clientWidth};
});
async function assertNoDocumentOverflow(page,context){
  const result=await horizontalOverflow(page);
  expect(result.overflow,context+": "+JSON.stringify(result)).toBeLessThanOrEqual(2);
}
async function scanForAxeViolations(page,context){
  const result=await new AxeBuilder({page}).withTags(wcagTags).analyze();
  const failures=result.violations.map(v=>({
    id:v.id,impact:v.impact,description:v.description,
    nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})),
  }));
  expect(failures,context+": automated WCAG A/AA violations").toEqual([]);
}
async function screenshotEvidence(page,testInfo,name){
  const path=testInfo.outputPath(name+".png");
  await page.screenshot({path,fullPage:true,animations:"disabled"});
  await testInfo.attach(name,{path,contentType:"image/png"});
}

test.describe("two independent product themes — rendered light/dark snapshots",()=>{
  for(const [product,path] of Object.entries(paths)){
    for(const width of widths){
      test(product+" "+width+"px light/dark and reduced motion",async({page},testInfo)=>{
        await page.setViewportSize({width,height:900});
        await page.emulateMedia({reducedMotion:"reduce",colorScheme:"light"});
        const failed=[];
        page.on("pageerror",error=>failed.push(error.message));
        const response=await page.goto(path,{waitUntil:"networkidle"});
        expect(response?.ok()).toBeTruthy();
        await waitForStyles(page);
        await expect(page.getByRole("heading",{level:1})).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("data-uf-theme","light");
        expect(await page.evaluate(()=>matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
        const lightBg=await page.locator("body").evaluate(el=>getComputedStyle(el).backgroundColor);
        expect(lightBg).not.toBe("rgba(0, 0, 0, 0)");
        await assertNoDocumentOverflow(page,product+" light at "+width);
        await screenshotEvidence(page,testInfo,product+"-"+width+"-light");

        const toggle=page.getByRole("button").first();
        await toggle.focus();
        const outline=await toggle.evaluate(el=>getComputedStyle(el).outlineStyle);
        expect(outline).not.toBe("none");
        await toggle.click();
        await expect(page.locator("html")).toHaveAttribute("data-uf-theme","dark");
        const darkBg=await page.locator("body").evaluate(el=>getComputedStyle(el).backgroundColor);
        expect(darkBg).not.toBe(lightBg);
        await assertNoDocumentOverflow(page,product+" dark at "+width);
        await screenshotEvidence(page,testInfo,product+"-"+width+"-dark");
        expect(failed).toEqual([]);
      });
    }
  }
  test("editorial and operations use their own distinct typographic systems",async({page})=>{
    await page.goto(paths.editorial);
    const editorialFont=await page.locator("h1").evaluate(el=>getComputedStyle(el).fontFamily);
    await page.goto(paths.operations);
    const operationsFont=await page.locator("h1").evaluate(el=>getComputedStyle(el).fontFamily);
    expect(editorialFont).not.toEqual(operationsFont);
  });
});

test.describe("interactive semantics and keyboard behavior",()=>{
  test("manual tabs change focus on arrows but select only on Enter or Space",async({page})=>{
    await page.goto("/examples/components/workflow.html");
    const overview=page.getByRole("tab",{name:"Overview"});
    const details=page.getByRole("tab",{name:"Details"});
    await overview.focus();
    await page.keyboard.press("ArrowRight");
    await expect(details).toBeFocused();
    await expect(details).toHaveAttribute("aria-selected","false");
    await expect(overview).toHaveAttribute("aria-selected","true");
    await page.keyboard.press("Enter");
    await expect(details).toHaveAttribute("aria-selected","true");
    await expect(page.getByRole("tabpanel",{name:"Details"})).toBeVisible();
    await expect(page.getByRole("tabpanel",{name:"Overview"})).toBeHidden();
    await page.keyboard.press("Home");
    await expect(overview).toBeFocused();
    await expect(overview).toHaveAttribute("aria-selected","false");
    await page.keyboard.press(" ");
    await expect(overview).toHaveAttribute("aria-selected","true");
    await page.keyboard.press("End");
    await expect(details).toBeFocused();
  });

  test("native dialog traps focus and restores trigger on Escape",async({page})=>{
    await page.goto("/examples/components/workflow.html");
    const trigger=page.getByRole("button",{name:"Open explanation"});
    await trigger.click();
    await expect(page.getByRole("dialog",{name:"An independent design decision"})).toBeVisible();
    await expect(page.getByRole("button",{name:"Close dialog"})).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button",{name:"Close dialog"})).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("button",{name:"Close dialog"})).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog",{name:"An independent design decision"})).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("validation retains input and announces error before independently completed local success",async({page})=>{
    await page.goto("/examples/components/workflow.html");
    const submit=page.getByRole("button",{name:"Check locally"});
    await submit.click();
    const name=page.getByRole("textbox",{name:"Display name"});
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute("aria-invalid","true");
    await expect(page.locator("#name-error")).toBeVisible();
    await name.fill("Amira");
    await submit.click();
    const select=page.getByRole("combobox",{name:"Purpose"});
    await expect(select).toBeFocused();
    await expect(select).toHaveAttribute("aria-invalid","true");
    await select.selectOption("review");
    await submit.click();
    await expect(page.getByRole("status")).toContainText("Local validation completed");
    await expect(name).toHaveValue("Amira");
    await expect(name).not.toHaveAttribute("aria-invalid","true");
  });

  test("filter applied state, empty state, clear action and table sorting work",async({page})=>{
    await page.goto("/examples/components/records.html");
    const filter=page.getByRole("combobox",{name:"Filter by status"});
    await filter.selectOption("active");
    await page.getByRole("button",{name:"Apply filters"}).click();
    await expect(page.locator("tbody tr:visible")).toHaveCount(2);
    await expect(page.locator("#filter-summary")).toContainText("active");
    await page.getByRole("button",{name:"Sort by record name"}).click();
    await expect(page.locator("#name-header")).toHaveAttribute("aria-sort","ascending");
    await filter.selectOption("missing");
    await page.getByRole("button",{name:"Apply filters"}).click();
    await expect(page.getByText("No records match these filters.")).toBeVisible();
    await expect(page.getByRole("table")).toBeHidden();
    await page.getByRole("button",{name:"Clear filters"}).click();
    await expect(filter).toHaveValue("all");
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.locator("tbody tr:visible")).toHaveCount(3);
  });

  test("skip link is keyboard reachable and has a visible focus indication",async({page})=>{
    await page.goto("/examples/components/workflow.html");
    await page.keyboard.press("Tab");
    const active=page.locator(":focus");
    await expect(active).toHaveText("Skip to content");
    expect(await active.evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });
});

test.describe("actual rendered reflow and legibility invariants",()=>{
  for(const width of widths){
    test("operations grid preserves content sequence at "+width+"px",async({page})=>{
      await page.setViewportSize({width,height:820});
      await page.goto("/examples/grids/operations.html");
      await assertNoDocumentOverflow(page,"operations "+width);
      const regions=page.locator("#exceptions, .records");
      await expect(regions).toHaveCount(2);
      const left=await regions.nth(0).boundingBox();
      const right=await regions.nth(1).boundingBox();
      expect(left&&right).toBeTruthy();
      if(width===320) expect(right.y).toBeGreaterThan(left.y);
      if(width===1440) expect(Math.abs(left.y-right.y)).toBeLessThanOrEqual(2);
      const order=await page.locator("[data-uf-grid-node]").evaluateAll(elements=>elements.map(el=>el.dataset.ufGridNode));
      expect(order).toEqual(["page-title","context","action","exceptions","records"]);
    });
  }
  test("narrow viewport approximates 400%-equivalent reflow for a 1280 CSS-pixel page",async({page})=>{
    await page.setViewportSize({width:320,height:750});
    for(const path of ["/examples/components/workflow.html","/examples/components/records.html",
      "/examples/grids/operations.html","/examples/grids/editorial.html"]){
      await page.goto(path);
      await assertNoDocumentOverflow(page,path+" 320px reflow");
      await page.addStyleTag({content:"html{font-size:200% !important;}"});
      await assertNoDocumentOverflow(page,path+" 200% root font size");
      await expect(page.getByRole("heading",{level:1})).toBeVisible();
    }
  });
  test("long localized strings remain within the operations layout",async({page})=>{
    await page.setViewportSize({width:320,height:750});
    await page.goto("/examples/grids/operations.html");
    await page.locator(".long-word").evaluate(el=>{
      el.textContent="مثال_نصي_طويل_للغاية_للتأكد_من_إعادة_التدفق".repeat(8);
    });
    await assertNoDocumentOverflow(page,"localized long text");
    await expect(page.locator(".long-word")).toBeVisible();
  });
  test("screen content stays accessible with reduced motion on real rendered pages",async({page})=>{
    await page.emulateMedia({reducedMotion:"reduce"});
    await page.goto(paths.operations);
    expect(await page.evaluate(()=>matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    const duration=await page.locator("body").evaluate(el=>getComputedStyle(el).transitionDuration);
    expect(duration).toMatch(/^(0s|0ms)(, (0s|0ms))*$/);
  });
});

test.describe("automated WCAG A/AA scans (not a full accessibility audit)",()=>{
  for(const path of [
    "/examples/components/workflow.html",
    "/examples/components/records.html",
    "/examples/grids/operations.html",
    "/examples/grids/editorial.html",
    "/examples/hierarchy/article.html",
  ]){
    test("axe core checks "+path,async({page})=>{
      await page.setViewportSize({width:768,height:850});
      await page.goto(path);
      await scanForAxeViolations(page,path);
    });
  }
  for(const [product,path] of Object.entries(paths)){
    test(product+" theme scanned in both modes",async({page})=>{
      await page.setViewportSize({width:768,height:850});
      await page.emulateMedia({reducedMotion:"reduce"});
      await page.goto(path);
      await scanForAxeViolations(page,product+" light");
      await page.getByRole("button").first().click();
      await expect(page.locator("html")).toHaveAttribute("data-uf-theme","dark");
      await scanForAxeViolations(page,product+" dark");
    });
  }
});
