// four per times
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const puppeteer = require('puppeteer');
const request = require('request');
const util = require('util');
const fs = require("fs");

function green(s) {
  return '\u001b[0;32;40m' + s + '\u001b[0m';
}

function blue(s) {
  return '\u001b[1;34;40m' + s + '\u001b[0m';
}
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


async function auditByUrl(urls, taskId, quiet) {
  const DEVTOOLS_RTT_ADJUSTMENT_FACTOR = 3.75;
  const DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR = 0.9;
  const TARGET_LATENCY = 70;
  const TARGET_DOWNLOAD_THROUGHPUT = Math.floor(12 * 1024);
  const TARGET_UPLOAD_THROUGHPUT = Math.floor(12 * 1024);
  const opts = {
    chromeFlags: ['--headless'],
  };
  let flagsDesktop = {
    onlyCategories: ['accessibility'],
    logLevel: 'info',
    throttlingMethod: 'provided',
    // disableDeviceEmulation: true,
    // disableCpuThrottling: true,
    disableStorageReset: true,
    emulatedFormFactor: 'desktop',
    port: null,
    output: 'json',
    throttling: {
      rttMs: 0,
      throughputKbps: 0,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
      cpuSlowdownMultiplier: 0,
    }
  };
  let flagsMobile = {
    logLevel: 'info',
    throttlingMethod: 'devtools',
    onlyCategories: ['accessibility'],
    output: 'json',
    disableStorageReset: true,
    emulatedFormFactor: 'mobile',
    port: null,
    throttling: {
      rttMs: TARGET_LATENCY,
      throughputKbps: TARGET_DOWNLOAD_THROUGHPUT,
      requestLatencyMs: TARGET_LATENCY * DEVTOOLS_RTT_ADJUSTMENT_FACTOR,
      downloadThroughputKbps: TARGET_DOWNLOAD_THROUGHPUT * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
      uploadThroughputKbps: TARGET_UPLOAD_THROUGHPUT * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
      cpuSlowdownMultiplier: 4,
    }
  };
  // Launch chrome using chrome-launcher.
  const chrome = await chromeLauncher.launch(opts);
  flagsDesktop.port = chrome.port;
  flagsMobile.port = chrome.port;
  // Connect to it using puppeteer.connect().
  const resp = await util.promisify(request)(`http://localhost:${flagsDesktop.port}/json/version`);
  const {
    webSocketDebuggerUrl
  } = JSON.parse(resp.body);
  const browser = await puppeteer.connect({
    browserWSEndpoint: webSocketDebuggerUrl
  });
  for (let index = 0; index < urls.length; index++) {
    let url = urls[index];
    const URL = url;
    !quiet && console.log('[*] ' + blue(taskId) + ': 运行lighthouse for ', url, ' | ', green(index + 1), '/', urls.length);
    const filePath = './report/report_' + url.replace(/[/]/g, '|') + '.json';
    // Run Lighthouse.
    try {
      const {
        lhr,
      } = await lighthouse(URL, flagsDesktop, null);
      fs.writeFileSync(filePath, JSON.stringify(lhr));
      !quiet && console.log('[*] ' + blue(taskId) + ': 完成audit,生成文件 ' + filePath);
      !quiet && console.log(`Lighthouse scores: ${Object.values(lhr.categories).map(c => c.score).join(', ')}`);
    } catch (err) {
      console.error(' [×] ', err);
    }
  }
  await browser.disconnect();
  await chrome.kill();
}
async function main() {
  /* eslint-disable */
  var args = process.argv.splice(2)
  /* eslint-enable */
  let startNum = 0;
  let taskCounts = 10;
  let quiet = false;
  let path = 'catalog.txt';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-s') {
      startNum = parseInt(args[i + 1], 10) || startNum;
    }
    if (args[i] === '-n') {
      taskCounts = parseInt(args[i + 1], 10) || taskCounts;
    }
    if (args[i] === '-p') {
      path = args[i + 1] || path;
    }
    if (args[i] === '-q') {
      quiet = true;
    }
    if (args[i] === '-h') {
      console.log(`
        ---------------------------------------------------
        -h    show description of help.
        -s    [int] where do you want to start among urls.
        -n    [int] how many urls you want to audit in this task.
        -p    [str] the path of urls file, divided by \\n.
        -q    [bool] be quiet when run.
        ---------------------------------------------------
        `);
      return;
    }
  }
  const urls = readUrls(path).slice(startNum, startNum + taskCounts);

  fs.mkdir('./report', () => {
    // !quiet && console.log('report已存在,无需创建');
  });
  // await auditByUrl(urls);
  const taskId = 'task_' + startNum + '_' + taskCounts;
  console.log('[*] 启动' + blue(taskId));
  await auditByUrl(urls, taskId, quiet);
}
main();