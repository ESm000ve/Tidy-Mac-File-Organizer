import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const base = process.env.STORYBOOK_URL || 'http://127.0.0.1:6007';
const output = process.env.STORYBOOK_SCREENSHOTS || '/tmp/tidy-storybook-review';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  for (const [name,id,globals] of [
    ['overview','start-here--overview','theme:light'],
    ['dark-workflow','workflows-manual-organization--configure','theme:dark'],
    ['buttons','components-button--state-matrix','theme:light'],
    ['dialog','components-dialog--destructive','theme:dark'],
  ]) {
    await page.goto(base + '/iframe.html?id=' + id + '&viewMode=story&globals=' + globals);
    await page.locator('#storybook-root .tidy-stage').waitFor();
    await page.evaluate(() => document.fonts.ready);
    if (name === 'dialog') await page.getByRole('button', { name: 'Open destructive dialog' }).click();
    await page.screenshot({ path: output + '/' + name + '.png', fullPage: true });
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(base + '/iframe.html?id=start-here--overview&viewMode=story');
  await page.locator('#storybook-root .tidy-stage').waitFor();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  await page.screenshot({path:output+'/mobile.png',fullPage:true});
  const index = await (await fetch(base + '/index.json')).json();
  const links = await page.locator('a[href^="./?path="]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')));
  const missing = links.filter(link => !index.entries[link.split('/').at(-1)]);
  console.log(JSON.stringify({stories:Object.values(index.entries).filter(e=>e.type==='story').length,docs:Object.values(index.entries).filter(e=>e.type==='docs').length,errors,mobileOverflow:overflow,missingLinks:missing,output},null,2));
  if (errors.length || overflow || missing.length) process.exitCode = 1;
} finally { await browser.close(); }
