const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define the path to the Screaming Frog executable based on your OS
const screamingFrogPath = 'screamingfrogseospider'; // Linux
// const screamingFrogExecutable = '"C:\\Program Files (x86)\\Screaming Frog SEO Spider\\ScreamingFrogSEOSpiderCLI.exe"'; // Windows
// const screamingFrogExecutable = 'open "/Applications/Screaming Frog SEO Spider.app"' // macOS

// Get the URL from command line arguments
const url = process.argv[2];
if (!url) {
    console.error('Please provide a URL as an argument.');
    process.exit(1);
}

// Determine the path to the repository directory
const repositoryPath = path.resolve(__dirname);
const csvFilePath = path.join(repositoryPath, 'internal_html.csv');

// Define the Screaming Frog command arguments
const screamingFrogArgs = [
    '--headless',
    '--crawl', url,
    '--output-folder', repositoryPath,
    '--overwrite',
    '--export-tabs', 'Internal:HTML',
    '--export-format', 'csv'
];

// Function to run Screaming Frog and then Pa11y

function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, {
            stdio: ['inherit', 'pipe', 'pipe'] 
        });

        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data.toString()}`);
        });

        process.stderr.on('data', (data) => {
            console.error(`stderr: ${data.toString()}`);
        });

        process.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Process exited with code ${code}`));
            } else {
                resolve();
            }
        });
    });
}

async function runScreamingFrogAndPa11y() {
    try {
        console.log('Running Screaming Frog SEO Spider...');
        await runCommand(screamingFrogPath, screamingFrogArgs);
        console.log('Screaming Frog crawl completed.');

        if (!fs.existsSync(csvFilePath)) {
            console.error(`CSV file not found at ${csvFilePath}`);
            process.exit(1);
        }

        // Run the Pa11y script
        console.log('Running Pa11y...');
        const pa11yCommand = 'node';
        const pa11yArgs = ['pa11y.js', csvFilePath];
        await runCommand(pa11yCommand, pa11yArgs);
        console.log('Pa11y analysis completed.');
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Run the script
runScreamingFrogAndPa11y();