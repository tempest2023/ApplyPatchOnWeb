#只测试accessibility,不弹出浏览器,以json格式输出到./report.json中
lighthouse https://baike.baidu.com --chrome-flags="--headless" --only-categories=accessibility --output=json --output-path=./report.json
