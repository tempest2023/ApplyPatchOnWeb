const fs = require('fs');
fs.readFile('index.log', (err, data) => {
  let urls = data.toString();
  let cataLog = urls.split('$$$$$');
  cataLog = cataLog.filter(item => {
    if (item.length < 4) return false;
    let s = item[0] + item[1] + item[2] + item[3];
    return s === 'http';
  });
  let result = '';
  for (let url of cataLog) {
    result += url + '\n';
  }
  fs.writeFileSync('catalog.txt', result);
})