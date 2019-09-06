const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const puppeteer = require('puppeteer');
const request = require('request');
const util = require('util');
const fs = require("fs");


function listFiles(path = './html') {
  if (!fs) {
    return console.error('[×] fs module is not required.');
  }
  return fs.readdirSync(path);
}

function readUrls(path = 'catalog.txt') {
  const data = fs.readFileSync(path);
  return data.toString().split('\n').filter(item => {
    if (item.length < 4) {
      return false;
    }
    let s = item[0] + item[1] + item[2] + item[3];
    return s === 'http';
  });
}


async function auditByUrl(urls) {
  urls.forEach(async (url, index) => {
    const URL = url;

    const opts = {
      chromeFlags: ['--headless'],
      onlyCategories: ['accessibility'],
      output: 'json',
    };
    // Launch chrome using chrome-launcher.
    const chrome = await chromeLauncher.launch(opts);
    opts.port = chrome.port;

    // Connect to it using puppeteer.connect().
    const resp = await util.promisify(request)(`http://localhost:${opts.port}/json/version`);
    const {
      webSocketDebuggerUrl
    } = JSON.parse(resp.body);
    const browser = await puppeteer.connect({
      browserWSEndpoint: webSocketDebuggerUrl
    });

    // Run Lighthouse.
    const {
      lhr,
      result,
    } = await lighthouse(URL, opts, null);
    console.log(lhr);
    console.log(`Lighthouse scores: ${Object.values(lhr.categories).map(c => c.score).join(', ')}`);

    await browser.disconnect();
    await chrome.kill();
  });

}


async function main() {
  const urls = readUrls();
  urls.splice(1, urls.length);

  fs.mkdir('./report', err => {
    // console.log('report已存在,无需创建')
  });

  await auditByUrl(urls);
};
main();