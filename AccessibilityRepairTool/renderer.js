// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
/* eslint-disable */
const chromeLauncher = require('chrome-launcher');
const puppeteer = require('puppeteer');
const request = require('request');
const rp = require('request-promise');
const util = require('util');
const fs = require("fs");
const $ = require("jquery");

const patchUrl = 'http://127.0.0.1:5000/patch'

let quiet = false;
let tasks = 1;
let analysis = null;
let randomly = true;
let launchLighthouse = false;
let headless = false;
let errorOccured = false;
let reportData = null;
let browser = null;

function listFiles(path = './html') {
  if (!fs) {
    return console.error('[×] fs module is not required.');
  }
  return fs.readdirSync(path);
}

function CSSDeclarationToJSON(css) {
  if (typeof css === "string") {
    css = JSON.parse(css);
  }
  let newCss = {};
  for (let key in css) {
    if (!isNaN(parseInt(key))) {
      let newKey = css[key];
      if (newKey[0] === '-') {
        newKey = newKey.substr(1, newKey.length - 1);
      }
      for (let i = 0; i < newKey.length; i++) {
        if (newKey[i] === '-') {
          newKey = newKey.slice(0, i) + newKey[i + 1].toUpperCase() + newKey.slice(i + 2);
        }
      }
      newCss[newKey] = css[newKey];
    }
  }
  return newCss;
}

function CSSFormat(name) {
  let newName = name.replace(/([A-Z])/g, "-$1").toLowerCase();
  if (name.indexOf('webkit') != -1) {
    newName = '-' + newName;
  }
  return newName;
}
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
    if (!el) {
      return;
    }
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
  const CSSFormat = function(name) {
    let newName = name.replace(/([A-Z])/g, "-$1").toLowerCase();
    if (name.indexOf('webkit') != -1) {
      newName = '-' + newName;
    }
    return newName;
  }
  for (let i in patchList) {
    const sel = patchList[i]['selector'];
    const cssPatch = patchList[i]['insert'];
    if (cssPatch) {
      // cssPatch['border'] = '2px dashed red!important';
    } else {
      console.log('cssPatch是空,无法修复');
      return;
    }
    const el = document.querySelector(sel);

    // console.log("[" + sel + "]" + '是否能找到el？', el !== null, el ? el.nodeName : '找不到nodeName');
    if (el !== null) {
      console.log('-----------------------修复属性-----------------------');
      let originStyle = el.getAttribute('style');
      if (originStyle == null) {
        originStyle = '';
      }
      for (const item in cssPatch) {
        console.log('[*] 设置属性' + item + "为" + cssPatch[item]);
        originStyle += CSSFormat(item) + ":" + cssPatch[item] + ";";
      }
      originStyle += ";border:2px dashed red!important;";
      console.log('[*] 最终应用属性:', originStyle);
      el.setAttribute('style', originStyle);
      console.log('-----------------------修复完毕-----------------------');
    } else {
      console.log("Error: 修复时元素为null,无法应用patch.");
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
      console.log('LI问题-------------PatchData\n', JSON.stringify(patchData) + '\n', item['selector']);
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
      // fs.writeFileSync('output.txt', 'send arg for patch:\n' + JSON.stringify(data) + '\n');
      let patchData = await getPatch(data);
      patchData['selector'] = item['selector'][index];
      console.log('UL问题-------------PatchData\n', JSON.stringify(patchData) + '\n', item['selector']);
      // fs.writeFileSync('output.txt', 'get patchData:\n' + JSON.stringify(patchData) + '\n');
      patchList.push(patchData);
      // fs.writeFileSync('output.txt', '\ngetData:' + JSON.stringify(patchData) + '\n');
    }
  }
  return patchList;
}

async function launchBrowserWithPatch(url, elementSelectors) {
  const browser = await puppeteer.launch({
    headless,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(url).catch(e => {
    console.log('[*] Error:跳转页面超时,跳过此页面.', e);
    errorOccured = true;
    return browser;
  });
  // Bind test output
  bindTestOutput(page);
  // find elements' style in page by elementSelectors
  let styleList = await page.evaluate(generateStyleList, elementSelectors).catch(e => {
    console.log('跳过此页面,在页面 ' + url + ' 查找元素出现错误,可能是因为动态加载元素的原因,元素选择器:' + JSON.stringify(elementSelectors));
    console.log(e);
    errorOccured = true;
  });
  // show styleList in textarea
  // let showStyle = '';
  // if (styleList['ul'].length > 0) {
  //   for (let i in styleList['ul'][0]) {
  //     if (i === 'insert') {
  //       let styles = CSSDeclarationToJSON(styleList['ul'][0][i][0]);
  //       for (let s in styles) {
  //         showStyle += s + ' : ' + styles[s] + "\r\n";
  //       }
  //     }
  //   }
  //   $('#origin').val(showStyle);
  //   // document.querySelector('#origin').innerText = showStyle;
  // } else if (styleList['li'].length > 0) {
  //   for (let i in styleList['li'][0]) {
  //     if (i === 'insert') {
  //       let styles = CSSDeclarationToJSON(styleList['li'][0][i][0]);
  //       for (let s in styles) {
  //         showStyle += s + ' : ' + styles[s] + "\r\n";
  //       }
  //     }
  //   }
  //   $('#origin').val(showStyle);
  //   // document.querySelector('#origin').innerText = showStyle;
  // }

  if (styleList['ul'].length <= 0 && styleList['li'].length <= 0) {
    console.log('Error: 未找到错误元素,styleList中错误元素数量为0');
    return browser;
  }
  // fs.writeFileSync('output.json', JSON.stringify(styleList));
  const patchList = await generatePatchList(styleList);
  // fs.writeFileSync('output.txt', JSON.stringify(patchList));
  await page.evaluate(applyPatch, patchList).catch(e => {
    console.log('应用patch时出现错误:', e);
    errorOccured = true;
    return browser;
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

async function patchByAnalysis(originData, taskList) {

  // get taskList by analysis report.successList
  for (let i in taskList) {
    const nowTask = taskList[i];
    const url = nowTask['url'];
    document.querySelector("#iframe_url").innerText = url;
    $("#origin_iframe").attr('src', url);
    // 生成elementSelectors
    const elementSelectors = generateElementSelectors(nowTask);

    browser = await launchBrowserWithPatch(url, elementSelectors);
    if (!errorOccured) {
      console.log('[*] open this page for 2000s');
      await setTimeout(async () => {
        await browser.close();
      }, 2000000);
    }
  }
}
async function readReport(filepath) {
  const data = fs.readFileSync(filepath).toString();
  const originData = JSON.parse(data);
  return originData;
}
async function main() {

  fs.mkdir('./reportPatch', () => {
    // !quiet && console.log('report已存在,无需创建');
  });
  if (analysis !== null) {
    reportData = await readReport(analysis);
    const taskList = generateTaskList(reportData['successList'], tasks);
    await patchByAnalysis(reportData, taskList);
  } else {
    alert('Error: analysis report is null.');
  }
  // Deprecated
  // if (report !== null) {
  //   await patchByReport(report, quiet);
  // }
}

$(document).ready(function() {
  $("#patch").change(e => {
    let v = $("#patch").val();
    console.log(v);
  })
  $("#origin").change(e => {
    let v = $("#origin").val();

  });
  $("#analysis_report").change(() => {
    analysis = document.querySelector('#analysis_report').files[0]['path'];
    main();
  });
  $("#refresh_icon").click(async e => {
    if (!reportData) {
      alert('You have not submit analysis report!');
    }
    if (browser) {
      await browser.close();
    }
    const taskList = generateTaskList(reportData['successList'], tasks);
    await patchByAnalysis(reportData, taskList);
  })
  $("#use_target_url").click(async e => {
    let url = $('#target_url').val();
    if (url.length <= 0) {
      alert('please input a valid url!');
      return;
    }
    if (browser) {
      await browser.close();
    }
    const taskList = reportData['successList'].filter(item => {
      return url === item.url;
    });
    console.log('targetList:', taskList);
    await patchByAnalysis(reportData, taskList);
  });
  // main();
});