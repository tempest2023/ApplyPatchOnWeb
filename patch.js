// Global Variables
let quiet = false;
let report = null;
let tasks = 1;
let analysis = null;
let randomly = true;
let launchLighthouse = true;
let headless = true;
/* eslint-disable */
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const puppeteer = require('puppeteer');
const request = require('request');
const rp = require('request-promise');
const util = require('util');
const fs = require("fs");
// util
function green(s) {
  return '\u001b[0;32;40m' + s + '\u001b[0m';
}

function blue(s) {
  return '\u001b[1;34;40m' + s + '\u001b[0m';
}

function listFiles(path = './html') {
  if (!fs) {
    return console.error('[×] fs module is not required.');
  }
  return fs.readdirSync(path);
}
/* eslint-enable */

const patchUrl = 'http://127.0.0.1:5000/patch'
/*
  patchData:{
    insert: CSSDeclarationObject // 插入元素的CSS patch
  }
*/
async function getPatch(styleData) {
  let patchData = await rp({
    uri: patchUrl,
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: styleData,
    json: true,
  });
  return {
    'insert': patchData
  };
}

function bindTestOutput(page) {
  page.on('console', msg => {
    console.log(msg.text());
  });
  // page.on('error', err => {
  //   console.log('-------------------页面内错误输出------------------\n', err, '\n-------------------页面内错误输出------------------\n');
  // })
  // page.on('pageerror', err => {
  //   console.log('-------------------页面内错误输出------------------\n', err, '\n-------------------页面内错误输出------------------\n');
  // });
}

/*
  styleList:{
      // ul缺少li的错误
      ul:[{
        selector: [''], // 插入的li的选择器,与insert一一对应
        child: CSSDeclarationObject, // ul元素的原本的css样式
        insert: [CSSDeclarationObject], // 插入li后li的css样式,ul元素下有多个可插入li的子元素,所以是数组
      }],
      // li缺少ul的错误
      li:[{
        selector:'', // 插入的ul的选择器
        child:[CSSDeclarationObject], // li元素原本的css样式, 多个li应该在一个ul下,所以是数组
        insert: CSSDeclarationObject, // 插入ul后ul的css样式
      }]
  }
*/
// This function is used in page which means it has a totally different env.
function generateStyleList(elementSelectors) {
  console.log('------------------------------------------------------------------Run Test');
  const wrap = function(el, wrapper) {
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  }
  const markPosition = function(el) {
    console.log('元素在页面的绝对位置:（' + el.offsetTop + "," + el.offsetLeft + ")");
    console.log('元素内容:', el.innerText);
    window.scrollTo(el.offsetLeft, el.offsetTop);
  }
  const cssPath = function(el) {
    if (!(el instanceof Element)) {
      console.error('元素不属于Element,无法获取CSSPath');
      return "";
    }
    const path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += '#' + el.id;
        path.unshift(selector);
        break;
      } else {
        let sib = el;
        let nth = 1;
        while (sib) {
          sib = sib.previousElementSibling;
          if (sib) {
            if (sib.nodeName.toLowerCase() == selector) {
              nth++;
            }
          }
        }
        if (nth != 1)
          selector += ":nth-of-type(" + nth + ")";
      }
      path.unshift(selector);
      el = el.parentNode;
    }
    return path.join(" > ");
  }
  const styleList = {
    'ul': [],
    'li': [],
  };
  // 处理ul缺少li的错误
  for (let sel of elementSelectors['ul']) {
    let el = window.document.querySelector(sel);
    markPosition(el);

    // 获取child信息
    try {
      if (el !== null && el !== undefined) {
        let arg = {
          'selector': [],
          'child': JSON.stringify(window.getComputedStyle(el)),
          'insert': []
        };
        let children = [...el.children];
        for (let i in children) {
          if (children[i] != undefined && children[i].nodeName !== "LI" && children[i].nodeName !== "DT" && children[i].nodeName !== "DD") {
            let li = document.createElement('li');
            wrap(children[i], li);
            arg['insert'].push(JSON.stringify(window.getComputedStyle(li)));
            arg['selector'].push(cssPath(li));
          }
        }
        styleList['ul'].push(arg);
      }
    } catch (e) {
      console.log('由于页面元素动态变化的原因,出现元素无法找到的情况,无法自动注入补丁,跳过此页面');
      continue;
    }
  }
  for (let sel of elementSelectors['li']) {
    // find the same parentNode
    let el = window.document.querySelector(sel);
    markPosition(el);
    // 获取child信息
    try {
      if (el !== null && el != undefined) {
        let isAdded = false;
        for (const arg in styleList['li']) {
          if (arg['selector'] === cssPath(el.parentNode)) {
            arg['child'].push(window.getComputedStyle(el));
            arg['lipath'].push(sel);
            isAdded = true;
          }
        }
        if (!isAdded) {
          let arg = {
            'selector': null,
            'child': [],
            'insert': null,
            'lipath': [],
          };
          let ul = document.createElement('ul');
          wrap(el, ul);
          arg['insert'] = JSON.stringify(window.getComputedStyle(ul));
          arg['selector'] = cssPath(ul);
          arg['child'].push(JSON.stringify(window.getComputedStyle(el)));
          arg['lipath'].push(sel);
          styleList['li'].push(arg);
        }
      }
    } catch (e) {
      console.log('由于页面元素动态变化的原因,出现元素无法找到的情况,无法自动注入补丁,跳过此页面');
      continue;
    }
  }
  return styleList;
}

// This function is used in page which means it has a totally different env.
function applyPatch(patchList) {
  for (let i in patchList) {
    const sel = patchList[i]['selector'];
    const cssPatch = patchList[i]['insert'];
    if (cssPatch) {
      cssPatch['border'] = '2px dashed red!important';
    } else {
      return;
    }
    const el = document.querySelector(sel);

    // console.log("[" + sel + "]" + '是否能找到el？', el !== null, el ? el.nodeName : '找不到nodeName');
    if (el !== null) {
      console.log('-----------------------修复属性-----------------------');
      for (const item in cssPatch) {
        console.log('[*] 设置属性' + item + "为" + cssPatch[item]);
        el.style[item] = cssPatch[item];
      }
      console.log('-----------------------修复完毕-----------------------');
    }
  }
  return true;
}

function generateTaskList(successList, tasks) {
  let taskList;
  if (tasks > successList.length) {
    tasks = successList.length;
    taskList = successList;
  } else {
    taskList = [];
    if (randomly) {
      // choose arbitrarily as tasks
      for (let i = successList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = successList[i];
        successList[i] = successList[j];
        successList[j] = temp;
      }
    }
    for (let i = 0; i < tasks; i++) {
      taskList.push(successList[i]);
    }
  }
  return taskList;
}
/*
  elementSelectors:{
      // ul缺少li的错误
      ul:['selector'],
      // li缺少ul的错误
      li:['selector']
  }
*/
function generateElementSelectors(nowTask) {
  // 4项list审查属性
  const checkAudit = ['list', 'definition-list', 'listitem', 'dlitem'];
  const elementSelectors = {
    'ul': [],
    'li': []
  };
  // 获取有用的selector生成patch
  for (let au of checkAudit) {
    if (!nowTask['audit'][au]['details']) {
      continue;
    }
    if (nowTask['audit'][au]['details']['items'].length > 0) {
      for (let item of nowTask['audit'][au]['details']['items']) {
        if (au === 'list' || au === 'definition-list') {
          elementSelectors['ul'].push(item['node']['selector']);
        } else {
          elementSelectors['li'].push(item['node']['selector']);
        }
      }
    }
  }
  return elementSelectors;
}
/*
  patchList:{
    {
      selector: '', // 插入的li的选择器
      insert: CSSDeclarationObject // 插入li后li的css样式
    }
  }
*/
async function generatePatchList(styleList) {
  const patchList = [];
  for (let item of styleList['li']) {
    let insert = item['insert'];
    for (let child of item['child']) {
      let data = {
        'child': child,
        'insert': insert,
      };
      // fs.writeFileSync('output.txt', 'send arg for patch:\n' + JSON.stringify(data) + '\n');
      let patchData = await getPatch(data);
      patchData['selector'] = item['selector'];
      console.log('LI-------------PatchData\n', JSON.stringify(patchData) + '\n', item['selector']);
      // fs.writeFileSync('output.txt', 'get patchData:\n' + JSON.stringify(patchData) + '\n');
      patchList.push(patchData);
      // fs.writeFileSync('output.txt', '\ngetData:' + JSON.stringify(patchData) + '\n');
    }
  }
  for (let item of styleList['ul']) {
    let child = item['child'];
    for (let index in item['insert']) {
      let insert = item['insert'][index];
      let data = {
        'child': child,
        'insert': insert,
      }
      console.log(item['selector']);
      // fs.writeFileSync('output.txt', 'send arg for patch:\n' + JSON.stringify(data) + '\n');
      let patchData = await getPatch(data);
      patchData['selector'] = item['selector'][index];
      console.log('UL-------------PatchData\n', JSON.stringify(patchData) + '\n', item['selector']);
      // fs.writeFileSync('output.txt', 'get patchData:\n' + JSON.stringify(patchData) + '\n');
      patchList.push(patchData);
      // fs.writeFileSync('output.txt', '\ngetData:' + JSON.stringify(patchData) + '\n');
    }
  }
  return patchList;
}


async function launchBrowserWithInject(url, elementSelectors) {
  // Use Puppeteer to launch headful Chrome and don't use its default 800x600 viewport.
  const browser = await puppeteer.launch({
    headless,
    defaultViewport: null,
  });
  // Wait for Lighthouse to open url, then customize network conditions.
  // Note: this will re-establish these conditions when LH reloads the page. Think that's ok....
  browser.on('targetcreated', async () => {
    const pages = await browser.pages();
    let pageFilterResult = pages.filter(item => {
      return item != null ? item.url() === url : false;
    });
    if (pageFilterResult.length === 1) {
      const page = pageFilterResult[0];
      const bodyHandle = await page.$('body');
      bindTestOutput(page);
      console.log('[*] 在lighthouse启动前进行注入.');
      let styleList = await page.evaluate(generateStyleList, elementSelectors).catch(e => {
        console.log('跳过此页面,在页面 ' + url + ' 查找元素出现错误,可能是因为动态加载元素的原因,元素选择器:' + JSON.stringify(elementSelectors));
        console.log(e);
      });
      if (styleList['ul'].length <= 0 && styleList['li'].length <= 0) {
        return false;
      }

      const patchList = await generatePatchList(styleList);
      fs.writeFileSync('output.json', JSON.stringify(patchList));
      await page.evaluate(applyPatch, patchList).catch(e => {
        console.log('应用patch时出现错误:', e);
      });
      await bodyHandle.dispose();
    }
  });
  return browser;
}

async function launchBrowserWithPatch(url, elementSelectors) {
  const browser = await puppeteer.launch({
    headless,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(url).catch(e => {
    console.log('[*] Error:跳转页面超时,跳过此页面.', e);
    return browser;
  });
  // Bind test output
  bindTestOutput(page);
  // find elements' style in page by elementSelectors
  let styleList = await page.evaluate(generateStyleList, elementSelectors).catch(e => {
    console.log('跳过此页面,在页面 ' + url + ' 查找元素出现错误,可能是因为动态加载元素的原因,元素选择器:' + JSON.stringify(elementSelectors));
    console.log(e);
  });
  if (styleList['ul'].length <= 0 && styleList['li'].length <= 0) {
    return false;
  }
  // fs.writeFileSync('output.json', JSON.stringify(styleList));
  const patchList = await generatePatchList(styleList);
  // fs.writeFileSync('output.txt', JSON.stringify(patchList));
  await page.evaluate(applyPatch, patchList).catch(e => {
    console.log('应用patch时出现错误:', e);
  });
  return browser;
}

async function lighthouseCheck(browser, url) {
  let filePath = 'reportPatch/' + url.replace(/[/]/g, '|') + '.json';
  let flagsDesktop = {
    onlyCategories: ['accessibility'],
    logLevel: 'silent',
    throttlingMethod: 'provided',
    // disableDeviceEmulation: true,
    // disableCpuThrottling: true,
    disableStorageReset: true,
    emulatedFormFactor: 'desktop',
    port: (new URL(browser.wsEndpoint())).port,
    output: 'json',
  };

  // Run Lighthouse.
  try {
    !quiet && console.log('[*] ' + '运行lighthouse for ', url);
    const {
      lhr,
    } = await lighthouse(url, flagsDesktop, null);
    fs.writeFileSync(filePath, JSON.stringify(lhr));
    !quiet && console.log('[*] ' + ': 完成PatchAudit,生成文件 ' + filePath);
    !quiet && console.log(`Lighthouse scores: ${Object.values(lhr.categories).map(c => c.score).join(', ')}`);
    return lhr;
  } catch (err) {
    console.error(' [×] 启动lighthouse失败: ', err);
  }
}

async function patchByAnalysis(filepath, tasks) {
  const data = fs.readFileSync(filepath).toString();
  const originData = JSON.parse(data);
  // get taskList by analysis report.successList
  const taskList = generateTaskList(originData['successList'], tasks);
  for (let i in taskList) {
    const nowTask = taskList[i];
    const url = nowTask['url'];
    // 生成elementSelectors
    const elementSelectors = generateElementSelectors(nowTask);
    if (launchLighthouse) {
      const browser = await launchBrowserWithInject(url, elementSelectors);
      await lighthouseCheck(browser, url);
      console.log('[*] open this page for 20s');
      await setTimeout(async () => {
        await browser.close();
      }, 20000);
    } else {
      const browser = await launchBrowserWithPatch(url, elementSelectors);
      console.log('[*] open this page for 20s');
      await setTimeout(async () => {
        await browser.close();
      }, 20000);
    }
  }
}

function handleOpts() {
  /* eslint-disable */
  var args = process.argv.splice(2)
  /* eslint-enable */

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n') {
      tasks = parseInt(args[i + 1]) || tasks;
    }
    if (args[i] === '-p') {
      report = args[i + 1] || report;
    }
    if (args[i] === '-a') {
      analysis = args[i + 1] || analysis;
    }
    if (args[i] === '-q') {
      quiet = true;
    }
    if (args[i] === '-r') {
      randomly = args[i + 1] === 'false' ? false : true || randomly;
    }
    if (args[i] === '-l') {
      launchLighthouse = args[i + 1] === 'false' ? false : true || launchLighthouse;
    }
    if (args[i] === '-headless') {
      headless = args[i + 1] === 'false' ? false : true || headless;
    }
    if (args[i] === '-h') {
      console.log(`
        ---------------------------------------------------
        -h        show description of help.
        -p        [str] (Deprecated) the path of lighthouse report which you want to patch and check.
        -q        [bool] be quiet when run.
        -a        [str] the analysis file, like reportResult_${new Date().getTime()}.json
        -n        [int] how many patch task you want to run in reportResult?
        -r        [bool] whether choosing task randomly. (default: true)
        -l        [bool] whether launching lighthouse. (default: true)
        -headless [bool] whether using headless browser. (default: true)
        ---------------------------------------------------
        `);
      return;
    }
  }
}
async function main() {
  handleOpts();
  fs.mkdir('./reportPatch', () => {
    // !quiet && console.log('report已存在,无需创建');
  });
  if (analysis !== null) {
    await patchByAnalysis(analysis, tasks, quiet);
  }
  // Deprecated
  // if (report !== null) {
  //   await patchByReport(report, quiet);
  // }
}

main();