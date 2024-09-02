This is a tool that runs the [pa11y](https://github.com/pa11y/pa11y) web accessibility tester on urls from a [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/) crawl and creates a csv report with all issues detected.

It's not a CI or automation tool but is more intended for accessibility audits or to supplement tech SEO audits using Screaming Frog, which is lacking in native accessibility features.

It uses Pa11y's default runner set to WCAG2AA. There is also an alternative script in the pa11y-axe branch which runs both the default runner and axe-core, and combines them in the same CSV. This is an experimental feature that may not work on all sites as axe does not play nicely with CSP headers.

### Prerequisites

* Screaming Frog SEO Spider, licenced and with crawl config set up as desired
* node.js and npm

### Installation

1. Clone the repo

```sh
git clone https://github.com/guy-holland/pa11y-screaming-frog
```

2. Install NPM packages

```sh
npm install
```

3. Check the Screaming Frog executable is defined correctly for your OS at the top of crawl.js

This is OS specific so uncomment the line for your OS. Defaults to Linux so should only need changing for Windows and MacOS.

## Usage

The script runs pa11y on the each url in the SEO Spider output file internal_html.csv and outputs the results as pa11y_results.csv

So we first need to crawl the site and export internal_html.csv to the project's root directory.

### Automated Crawl script

The easiest method is to use the automated crawl script. This executes the SEO Spider crawl when run with the site url as a parameter, then runs the pa11y script once the crawl is complete:

```sh
node crawl.js https://example.com/
```
Not using Linux? Check the screamingFrogPath at the top of crawl.js is defined correctly for your OS.

### With SEO Spider CLI

Linux

```sh
screamingfrogseospider --headless --crawl https://example.com/ --output-folder "/path/to/repository" --overwrite --export-tabs "Internal:HTML" --export-format csv
```

Windows

```sh
cd "C:\Program Files (x86)\Screaming Frog SEO Spider"
```
```sh
ScreamingFrogSEOSpiderCLI.exe --headless --crawl https://example.com/ --output-folder "/path/to/repository" --overwrite --export-tabs "Internal:HTML" --export-format csv
```

macOS (untested)

```sh
open "/Applications/Screaming Frog SEO Spider.app" --headless --crawl https://example.com/ --output-folder "/path/to/repository" --overwrite --export-tabs "Internal:HTML" --export-format csv
```

See the [SEO Spider documentation](https://www.screamingfrog.co.uk/seo-spider/user-guide/general/#commandlineoptions) for more command line options but note that the --export-format needs to be csv and the --export-tabs option will change the filename of the csv so this would need to be updated in the script if changed.

Once the crawl is complete run the script:

```sh
node pa11y.js
```

### Export via SEO Spider GUI

If using the desktop GUI,:

* Crawl the site
* Open the Internal tab
* Set filter to HTML
* Click Export and save at /path/to/repository/internal_html.csv

Then run the script:

```sh
node pa11y.js
```

## To do
* Cross platform crawl script
* Include console logging in crawl script
* Options for csv directory, filenames, multiple files
* Explore pa11y options

