import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const systemJsonPath = path.join(__dirname, '..', 'system.json');

// Function to remove the styles line
function removeStyles() {
    const data = fs.readFileSync(systemJsonPath, 'utf8');
    const modifiedData = data.replace(/"styles": \[.*?\],?\s*/s, ''); // Remove the styles line
    fs.writeFileSync(systemJsonPath, modifiedData, 'utf8');
    console.log('Removed styles line from system.json');
}

// Function to restore the styles line
function restoreStyles() {
    const data = fs.readFileSync(systemJsonPath, 'utf8');
    const stylesLine = `"styles": ["style.css"],\n`; // Define the styles line to restore
    const modifiedData = data.replace(/(\{)/, `$1\n  ${stylesLine}`); // Insert the styles line back
    fs.writeFileSync(systemJsonPath, modifiedData, 'utf8');
    console.log('Restored styles line in system.json');
}

// Check command line arguments
const command = process.argv[2];
if (command === 'remove') {
    removeStyles();
} else if (command === 'restore') {
    restoreStyles();
} else {
    console.error('Invalid command. Use "remove" or "restore".');
}