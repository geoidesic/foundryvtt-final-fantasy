import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const systemJsonPath = path.join(__dirname, '..', 'system.json');

// Function to remove the styles line
function removeStyles() {
    const data = fs.readFileSync(systemJsonPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Remove the styles property if it exists
    delete jsonData.styles;
    
    // Write back the formatted JSON
    fs.writeFileSync(systemJsonPath, JSON.stringify(jsonData, null, 2) + '\n', 'utf8');
    console.log('Removed styles from system.json');
}

// Function to restore the styles line
function restoreStyles() {
    const data = fs.readFileSync(systemJsonPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Set the styles property
    jsonData.styles = ["style.css"];
    
    // Write back the formatted JSON
    fs.writeFileSync(systemJsonPath, JSON.stringify(jsonData, null, 2) + '\n', 'utf8');
    console.log('Restored styles in system.json');
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