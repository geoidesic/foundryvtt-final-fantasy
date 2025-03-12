const fs = require('fs');
const { execSync } = require('child_process');

const version = process.argv[2];

if (!version) {
    console.error('Please provide a version argument.');
    process.exit(1);
}

// Update package.json
const packageJsonPath = '../package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.version = version;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Update system.json
const systemJsonPath = '../system.json';
const systemJson = JSON.parse(fs.readFileSync(systemJsonPath, 'utf8'));
systemJson.version = version;
fs.writeFileSync(systemJsonPath, JSON.stringify(systemJson, null, 2));

// Commit and push changes
execSync('git add .');
execSync(`git commit -m "Release v${version}"`);
execSync('git push origin main');

console.log(`Released version ${version}`);
