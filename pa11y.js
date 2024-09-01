const fs = require('fs');
const csv = require('csv-parser');
const pa11y = require('pa11y');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const puppeteer = require('puppeteer');
const axeCore = require('axe-core');

// Array to hold the URLs
const urls = [];

// CSV writer setup
const csvWriter = createCsvWriter({
    path: 'pa11y_results.csv',
    header: [
        { id: 'url', title: 'URL' },
        { id: 'issueMessage', title: 'Issue Message' },
        { id: 'issueCode', title: 'Issue Code' },
        { id: 'context', title: 'Context' },
        { id: 'selector', title: 'Selector' },
        { id: 'type', title: 'Type' },
        { id: 'standard', title: 'Standard' }
    ]
});

// Function to clean up headers
function cleanHeader(header) {
    return header.replace(/^["\s]+|["\s]+$/g, '');
}

// Function to read URLs from a CSV file
function readUrlsFromCsv(filePath) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv({
                mapHeaders: ({ header }) => cleanHeader(header)
            }))
            .on('data', (row) => {
                if (row['Address']) {
                    urls.push(row['Address'].trim());
                }
            })
            .on('end', () => {
                resolve(urls);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Function to run Axe directly with Puppeteer
async function runAxe(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Inject axe-core into the page
    await page.addScriptTag({ content: axeCore.source });
    const axeResults = await page.evaluate(async () => {
        return await axe.run();
    });

    await browser.close();

    return axeResults.violations.map(violation => ({
        message: violation.description,
        code: violation.id,
        context: violation.nodes.map(node => node.html).join(', '),
        selector: violation.nodes.map(node => node.target.join(', ')),
        type: violation.impact
    }));
}

// Function to run Pa11y on all URLs and save results to CSV
async function runPa11yOnUrls() {
    try {
        await readUrlsFromCsv('internal_html.csv');

        if (urls.length === 0) {
            console.log('No URLs to process. Exiting.');
            return;
        }

        const records = [];

        for (const url of urls) {
            if (url) {
                console.log(`Running Pa11y (WCAG2AA) on ${url}`);
                const defaultResults = await pa11y(url, { standard: 'WCAG2AA' });
                defaultResults.issues.forEach(issue => {
                    records.push({
                        url: url,
                        issueMessage: issue.message,
                        issueCode: issue.code,
                        context: issue.context,
                        selector: issue.selector,
                        type: issue.type,
                        standard: 'WCAG2AA'
                    });
                });

                if (defaultResults.issues.length === 0) {
                    records.push({
                        url: url,
                        issueMessage: 'No issues found',
                        issueCode: '',
                        context: '',
                        selector: '',
                        type: '',
                        standard: 'WCAG2AA'
                    });
                }

                console.log(`Running Axe on ${url}`);
                const axeResults = await runAxe(url);
                axeResults.forEach(issue => {
                    records.push({
                        url: url,
                        issueMessage: issue.message,
                        issueCode: issue.code,
                        context: issue.context,
                        selector: issue.selector,
                        type: issue.type,
                        standard: 'Axe'
                    });
                });

                if (axeResults.length === 0) {
                    records.push({
                        url: url,
                        issueMessage: 'No issues found',
                        issueCode: '',
                        context: '',
                        selector: '',
                        type: '',
                        standard: 'Axe'
                    });
                }
            }
        }

        await csvWriter.writeRecords(records);
        console.log('Pa11y results have been written to pa11y_results.csv');

    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the script
runPa11yOnUrls().catch(error => {
    console.error('Unhandled error:', error);
});
