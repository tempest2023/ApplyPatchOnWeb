const fs = require('fs');
const data = JSON.parse(fs.readFileSync('listResult.json').toString());
let each = 0; // the number of data(lists)
let sum = 0; // the sum of all lists' children
let max = 0;
let min = 99999;
for (let i in data) {
  for (let j in data[i]['result']) {
    if (data[i]['result'][j]['childNum'] >= 0) {
      let item = parseInt(data[i]['result'][j]['childNum']);
      sum += item;
      each++;
      max = max > item ? max : item;
      if (item == 219) {
        console.log(data[i]['url']);
      }
      min = min > item ? item : min;
    }
  }
}
console.log('共计:', each, '个list数据', '\n平均每个list拥有list子元素为:', sum / each, '\n最多list子元素为:', max, '\n最少list子元素为:', min);