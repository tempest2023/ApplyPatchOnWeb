## ApplyPatchOnWeb 
> a command tool which can help you apply your patch to solve accessibility problems by lighthouse.
> Supported by lighthouse, puppeteer

```
npm install
# Generate lighthouse report from urls, you need give url dictonary file.
node checker_cli.js -p urls.txt -s 0 -n 100

# More help
node checker_cli.js -h

# Generate analysis report from reports by lighthouse. You need to have report dir.
# This command can generate report_{new Date().getTime()}.json on you dir.
node analysis.js -p report -s 0 -n 100

# More help by -h

# choose some report to apply your patch
node patch.js -a report_{new Date().getTime()}.json -n 1 -r false

# More help by -h


```
