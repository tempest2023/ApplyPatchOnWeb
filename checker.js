// one by one
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const puppeteer = require('puppeteer');
const request = require('request');
const util = require('util');
const fs = require("fs");

/* eslint-disable */
function listFiles(path = './html') {
  if (!fs) {
    return console.error('[×] fs module is not required.');
  }
  return fs.readdirSync(path);
}
/* eslint-enable */

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
  for (let index = 0; index < urls.length; index++) {
    let url = urls[index];
    const URL = url;
    console.log('[*] 运行lighthouse for ', url, ' | ', index + 1, '/', urls.length);
    const filePath = './report/report_' + url.replace(/[/]/g, '|') + '.json';
    // Run Lighthouse.
    try {
      const {
        lhr,
      } = await lighthouse(URL, opts, null);
      fs.writeFileSync(filePath, JSON.stringify(lhr));
      console.log('[*] 完成audit,生成文件 ' + filePath);
      console.log(`Lighthouse scores: ${Object.values(lhr.categories).map(c => c.score).join(', ')}`);
    } catch (err) {
      console.log('Error: ', err);
    }
  }
  await browser.disconnect();
  await chrome.kill();
}


async function main() {
  const urls = readUrls();
  urls.splice(5, urls.length - 5);

  fs.mkdir('./report', () => {
    // console.log('report已存在,无需创建')
  });
  await auditByUrl(urls);
}
main();