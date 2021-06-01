'use strict';

const fs = require('fs');
const open = require('open');
const puppeteer = require('puppeteer');
const defaultConfig = require('./lighthouse-core/fraggle-rock/config/default-config.js');
const lighthouse = require('./lighthouse-core/fraggle-rock/api.js');

async function main() {
  const browser = await puppeteer.launch({headless: false, slowMo: 500});

  try {
    const page = await browser.newPage();

    // Start the lighthouse timespan.
    await page.goto('https://example.com', {waitUntil: ['load', 'networkidle0']});
    await page.waitFor(1000);

    const config = {...defaultConfig, settings: {output: 'html', throttlingMethod: 'devtools'}};
    const timespan = await lighthouse.startTimespan({page, config});

    await page.evaluate(() => {
      const start = Date.now();
      while (Date.now() - start < 100) ;
    });

    // End the lighthouse timespan.
    const {report, artifacts} = await timespan.endTimespan();
    console.log(artifacts.Trace, artifacts.traces);
    fs.writeFileSync('artifacts.json', JSON.stringify(artifacts));
    fs.writeFileSync('fr-report.html', report);
    open('fr-report.html');
  } catch (err) {
    console.error(err); // eslint-disable-line
  } finally {
    await browser.close();
  }
}

main();
