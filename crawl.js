const { exec } = require('child_process');
const path = require('path');

// Get the URL from command line arguments
const url = process.argv[2];
if (!url) {
    console.error('Please provide a URL as an argument.');
    process.exit(1);
}

// Determine the path to the repository directory
const repositoryPath = path.resolve(__dirname);
const csvFilePath = path.join(repositoryPath, 'internal_all.csv'); // Adjust if necessary

// Define the Screaming Frog command
const screamingFrogCommand = `screamingfrogseospider --headless --crawl ${url} --output-folder "${repositoryPath}" --export-tabs "Internal:HTML" --export-format csv`;

// Function to execute a command and return a Promise
function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing command: ${error.message}`);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            resolve(stdout);
        });
    });
}

// Function to run Screaming Frog and then Pa11y
async function runScreamingFrogAndPa11y() {
    try {
        console.log('Running Screaming Frog SEO Spider...');
        await execPromise(screamingFrogCommand);
        console.log('Screaming Frog crawl completed.');
        
        if (!fs.existsSync(csvFilePath)) {
            console.error(`CSV file not found at ${csvFilePath}`);
            process.exit(1);
        }

        // Run the Pa11y script
        console.log('Running Pa11y...');
        const pa11yCommand = `node pa11y.js ${csvFilePath}`;
        await execPromise(pa11yCommand);
        console.log('Pa11y analysis completed.');
        
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

// Run the script
runScreamingFrogAndPa11y();