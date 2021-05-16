subcount
========

Count your subscriptions on Patreon and Fanbox.

Requires Hydrus with cookies for Patreon or Fanbox. It uses the Hydrus API to get cookies for the Patreon and Fanbox APIs.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

# Usage
```sh-session
$ subcount --help
Count your subscriptions on Patreon and Fanbox

USAGE
  $ subcount APIKEY [APIURL]

ARGUMENTS
  APIKEY  Hydrus API key
  APIURL  [default: http://localhost:45869] Hydrus API URL

OPTIONS
  -f, --fanbox            enable checking Fanbox
  -h, --help              show CLI help
  -p, --patreon           enable checking Patreon
  -v, --version           show CLI version
  -x, --extended          show extra columns
  --columns=columns       only show provided columns (comma-separated)
  --csv                   output is csv format [alias: --output=csv]
  --filter=filter         filter property by partial string matching, ex: name=foo
  --no-header             hide table header from output
  --no-truncate           do not truncate output to fit screen
  --output=csv|json|yaml  output in a more machine friendly format
  --sort=sort             property to sort by (prepend '-' for descending)
```
