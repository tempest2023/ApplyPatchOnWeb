const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require("fs")


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

async function launchChromeAndRunLighthouse(urls, opts, config = null) {
  opts = opts || {
    chromeFlags: ['--headless'],
    onlyCategories: ['accessibility'],
    output: 'json',
  };
  chromeLauncher.launch({
    chromeFlags: opts.chromeFlags
  }).then(async chrome => {
    opts.port = chrome.port;
    await urls.forEach(async (url, index) => {
      await lighthouse(url, opts, config).then(results => {
        // use results.lhr for the JS-consumeable output
        // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
        // use results.report for the HTML/JSON/CSV output as a string
        // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
        console.log('[*] 运行lighthouse for ', url, ' | ', index, '/', urls.length);
        const filePath = './report/report_' + url.replace(/[\/]/g, '|') + '.json';
        fs.writeFileSync(filePath, results.report);
        console.log(results.report.categories.accessibility.score);
        console.log('[*] 完成audit,在./report下生成文件report_' + url + '.json');
      }).catch(err => {
        console.error('lighthouse audit错误:', err);
      });
    });
    return chrome.kill();
  }).catch(e => {
    console.error('启动chrome错误:', e);
  });
}

async function main() {
  const urls = readUrls();
  urls.splice(1, urls.length);

  fs.mkdir('./report', err => {
    // console.log('report已存在,无需创建')
  });

  await launchChromeAndRunLighthouse(urls);
};
main();