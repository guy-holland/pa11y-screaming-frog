const fs = require('fs');
const csv = require('csv-parser');
const pa11y = require('pa11y');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

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
        { id: 'type', title: 'Type' }
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
                console.log(`Running Pa11y on ${url}`);
                const results = await pa11y(url);
                
                results.issues.forEach(issue => {
                    records.push({
                        url: url,
                        issueMessage: issue.message,
                        issueCode: issue.code,
                        context: issue.context,
                        selector: issue.selector,
                        type: issue.type
                    });
                });

                if (results.issues.length === 0) {
                    records.push({
                        url: url,
                        issueMessage: 'No issues found',
                        issueCode: '',
                        context: '',
                        selector: '',
                        type: ''
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
