/**
 * This script is used to modify the system.json file.
 * It is used to remove the styles line from the system.json file.
 * It is also used to restore the styles line to the system.json file.
 * The reason for this is that the styles.css file is needed by the build version but not the dev version.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const systemJsonPath = path.join(__dirname, '..', 'system.json');

// Function to modify the system.json for development mode
function removeStyles() {
    const data = fs.readFileSync(systemJsonPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Save a backup of the original values for later restoration
    jsonData._original_esmodules = jsonData.esmodules;
    
    // Remove the styles property if it exists
    delete jsonData.styles;
    
    // Keep the esmodules pointing to dist/index.js for compatibility
    // The development server will handle redirecting this path
    
    // Write back the formatted JSON
    fs.writeFileSync(systemJsonPath, JSON.stringify(jsonData, null, 2) + '\n', 'utf8');
    console.log('Development mode: Removed styles from system.json');
}

// Function to restore the system.json for production mode
function restoreStyles() {
    const data = fs.readFileSync(systemJsonPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Set the styles property
    jsonData.styles = ["dist/style.css"];
    
    // Restore the original esmodules if they were saved
    if (jsonData._original_esmodules) {
        jsonData.esmodules = jsonData._original_esmodules;
        delete jsonData._original_esmodules;
    }
    
    // Write back the formatted JSON
    fs.writeFileSync(systemJsonPath, JSON.stringify(jsonData, null, 2) + '\n', 'utf8');
    console.log('Production mode: Restored styles and paths in system.json');
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