This is a tool that runs the [pa11y](https://github.com/pa11y/pa11y) web accessibility tester on urls from a [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/) crawl and creates a csv report with all issues detected.

### Prerequisites

* Screaming Frog SEO Spider, licenced and with crawl config set up as desired
* npm

### Installation

1. Clone the repo

```sh
git clone https://github.com/guy-holland/pa11y-screaming-frog
```

2. Install NPM packages

```sh
npm install
```

## Usage

The script runs pa11y on the SEO Spider output file internal_html.csv and outputs the results as pa11y_results.csv

So we first need to crawl the site and export internal_html.csv to the project's root directory:

### With SEO Spider CLI

Linux

```sh
screamingfrogseospider --headless --crawl https://example.com/ --output-folder "/path/to/repository" --overwrite --export-tabs "Internal:HTML" --export-format csv
```

Windows

```sh
cd "C:\Program Files (x86)\Screaming Frog SEO Spider"

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

