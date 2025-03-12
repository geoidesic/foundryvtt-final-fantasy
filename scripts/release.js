import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory of the script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths to package.json and system.json
const packageJsonPath = path.join(__dirname, '../package.json');
const systemJsonPath = path.join(__dirname, '../system.json');

const version = process.argv[2];

if (!version) {
    console.error('Please provide a version argument.');
    process.exit(1);
}

// Update package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.version = version;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Update system.json
const systemJson = JSON.parse(fs.readFileSync(systemJsonPath, 'utf8'));
systemJson.version = version;
fs.writeFileSync(systemJsonPath, JSON.stringify(systemJson, null, 2));

// Commit and push changes
execSync('git add .');
execSync(`git commit -m "Release v${version}"`);
execSync('git push origin main');

console.log(`Released version ${version}`);
