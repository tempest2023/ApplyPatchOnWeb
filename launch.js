const exec = require('child_process').exec;
const fs = require('fs');

function readUrls(path = 'catalog.txt') {
  const data = fs.readFileSync(path);
  return data.toString().split('\n').filter(item => {
    if (item.length < 4) {
      return false;
    }
    const s = item[0] + item[1] + item[2] + item[3];
    return s === 'http';
  });
}
// create log dir
fs.mkdir('./log', () => {
  // !quiet && console.log('report已存在,无需创建');
});
const urls = readUrls();
const taskNums = urls.length;

// divide tasks as five ration
const share = taskNums / 5;
for (let i = 0; i < 5; i++) {
  let start = share * i;
  let nums = share;
  let cmdStr = `node checker_cli.js -s ${start} -n ${nums} > log/task_${start}_${nums}.log`;
  console.log(cmdStr);
  exec(cmdStr, function(err, stdout, stderr) {
    console.log('----------------进程task_' + start + '_' + nums + '输出----------------');
    console.error(err);
    console.log(stdout);
    console.log(stderr);
  });
}