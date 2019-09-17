/* eslint-disable */
const request = require('request');
const util = require('util');
const fs = require("fs");
const ReportGenerator = require('lighthouse/lighthouse-core/report/report-generator');

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

function generateHtmlReport(file = './report.js', originData) {
  if (!originData) {
    try {
      const dataJson = fs.readFileSync(file).toString();
      originData = JSON.parse(dataJson);
    } catch (e) {
      console.error('生成html报告时出现错误:', e);
    }
  }
  const html = ReportGenerator.generateReport(originData, 'html');
  let newFile = file.substr(0, file.lastIndexOf('.')) + 'html';
  fs.writeFileSync(newFile, html);
  !quiet && console.log('[*] ' + blue(newFile) + ': 生成html report');
}
/* eslint-enable */

let startNum = 0;
let taskCounts = 10;
let quiet = false;
let path = './report/';
let generateHtml = false;

function argHandle() {
  /* eslint-disable */
  var args = process.argv.splice(2)
  /* eslint-enable */
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
    if (args[i] === '-html') {
      generateHtml = true;
    }
    if (args[i] === '-h') {
      console.log(`
        ---------------------------------------------------
        -h    show description of help.
        -s    [int] where do you want to start among reports.
        -n    [int] how many reports you want to analysis in this task.
        -p    [str] the path of report file.
        -q    [bool] be quiet when run.
        -html geneate the html report.
        ---------------------------------------------------
        `);
      return;
    }
  }
}

function analysis() {
  // Analysis Report Structure
  const reportResult = {};
  reportResult.error = {
    "Required Accessibility gatherer did not run.": 0
  };
  reportResult.errorList = [];
  reportResult.success = {
    "has accessibility error": 0,
    "useless report": 0,
  };
  reportResult.successList = [];
  reportResult.successListUseless = [];
  // Begin to analysis
  let files = listFiles(path);
  if (path[path.length - 1] !== "/") {
    path += "/";
  }
  // Default audits we use
  const checkAudit = ['list', 'listitem', 'dlitem', 'definition-list'];
  for (let i in files) {
    let file = files[i];
    try {
      !quiet && console.log(blue('[*]') + '分析报告   ' + file);
      !quiet && console.log('-------------------------------------');
      const dataJson = fs.readFileSync(path + file).toString();
      const originData = JSON.parse(dataJson);
      // generate html report if with -html (no lighthouse runtimeError)
      if (generateHtml && !originData['runtimeError']) {
        generateHtmlReport(path + file, originData);
      }
      // 检查audit情况
      if (originData['audits']) {
        let audits = originData['audits'];
        // 检查是否运行lighthouse成功
        if (audits['list']['scoreDisplayMode'] === 'error') {
          !quiet && console.log(blue('[×] 审查启动失败'));
          // 出现lighthouse审查失败错误
          if (originData['runtimeError']) {
            // 根据list项的错误原因记录数据
            if (reportResult.error[audits['list']['errorMessage']] >= 0) {
              reportResult.error[audits['list']['errorMessage']] += 1;
            } else {
              reportResult.error[audits['list']['errorMessage']] = 0;
            }
          }
          reportResult.errorList.push({
            'name': file,
            'error': originData['runtimeError'],
            'url': originData['finalUrl'],
          });
          continue;
        }
        // 4项list属性是否全部未应用
        let uselessData = true;
        for (let au of checkAudit) {
          if (audits[au]['details']) {
            if (audits[au]['details']['items'] && audits[au]['details']['items'].length > 0) {
              uselessData = false;
            }
          }
        }
        if (uselessData) {
          !quiet && console.log(blue('[*] 无用数据'));
          reportResult['success']['useless report']++;
          reportResult['successListUseless'].push({
            'name': file,
            'url': originData['finalUrl'],
          });
        } else {
          !quiet && console.log(green('[*] 有效数据'));
          let auditReport = {};
          for (let i of checkAudit) {
            auditReport[i] = audits[i];
          }
          reportResult['success']['has list error']++;
          reportResult['successList'].push({
            'name': file,
            'url': originData['finalUrl'],
            'audit': auditReport
          });
        }
      }
    } catch (e) {
      console.error('数据分析时出现错误:', e);
    }
  }
  const reportPath = 'reportResult_' + new Date().getTime() + '.json';
  fs.writeFileSync(reportPath, JSON.stringify(reportResult));
  console.log(green('[*] Analysis生成完毕,保存至' + reportPath));
}

function main() {
  argHandle();
  analysis(path);
}
main();