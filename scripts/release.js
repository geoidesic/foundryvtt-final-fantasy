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

const versionType = process.argv[2];

if (!versionType) {
    console.error('Please provide a version argument (major, minor, patch).');
    process.exit(1);
}

// Function to validate version format
const isValidVersion = (version) => {
    return /^\d+\.\d+\.\d+$/.test(version);
};

// Function to increment version
const incrementVersion = (version, type) => {
    // If version is invalid, start with a default version
    if (!isValidVersion(version)) {
        console.log(`Invalid version format: "${version}". Using default version 0.1.0 as base.`);
        version = '0.1.0';
    }
    
    const parts = version.split('.').map(Number);
    switch (type) {
        case 'major':
            parts[0]++;
            parts[1] = 0;
            parts[2] = 0;
            break;
        case 'minor':
            parts[1]++;
            parts[2] = 0;
            break;
        case 'patch':
            parts[2]++;
            break;
        default:
            throw new Error('Invalid version type. Use major, minor, or patch.');
    }
    return parts.join('.');
};

// Function to generate release notes using cursor-small AI with a fallback
const generateReleaseNotesWithFallback = async (previousTag) => {
    try {
        let range = previousTag ? `${previousTag}..HEAD` : '';
        const gitLogCommand = range 
            ? `git log ${range} --pretty=format:"%s" --no-merges`
            : `git log --pretty=format:"%s" --no-merges -n 50`;
        
        const commitMessages = execSync(gitLogCommand).toString().trim().split('\n');

        // Attempt to generate release notes using AI
        const aiResponse = await callCursorSmallAI(commitMessages); // Placeholder for AI call
        if (aiResponse) {
            console.log("Release notes successfully generated using AI.");
            return aiResponse; // Return AI-generated notes if successful
        } else {
            console.log("AI did not return a valid response.");
        }
    } catch (error) {
        console.error('Error generating release notes with AI:', error);
    }

    // Fallback to generating release notes from commit messages
    console.log("Falling back to generating release notes from commit messages.");
    return generateReleaseNotes(commitMessages);
};

// Function to generate release notes from commit messages
const generateReleaseNotes = (commitMessages) => {
    const formattedCommits = commitMessages.map(message => `- ${message}`);
    let releaseNotes = "## What's Changed\n\n";
    releaseNotes += formattedCommits.join('\n');
    return releaseNotes;
};

// Function to get the previous tag
const getPreviousTag = () => {
    try {
        return execSync('git describe --tags --abbrev=0').toString().trim();
    } catch (error) {
        console.log('No previous tag found.');
        return null;
    }
};

// Update package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const newVersion = incrementVersion(packageJson.version, versionType);
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Update system.json
const systemJson = JSON.parse(fs.readFileSync(systemJsonPath, 'utf8'));
systemJson.version = newVersion;
fs.writeFileSync(systemJsonPath, JSON.stringify(systemJson, null, 2));

// Commit changes
execSync('git add .');
execSync(`git commit -m "Release v${newVersion}"`);

// Create tag
execSync(`git tag -a v${newVersion} -m "Release version ${newVersion}"`);

// Push changes and tag
execSync('git push origin main');
execSync(`git push origin v${newVersion}`);

// Get previous tag for release notes
const previousTag = getPreviousTag();
const releaseNotes = await generateReleaseNotesWithFallback(previousTag);

// Create a temporary file for release notes
const releaseNotesPath = path.join(__dirname, '../release-notes.md');
fs.writeFileSync(releaseNotesPath, releaseNotes);

// Create GitHub release
try {
    execSync(`gh release create v${newVersion} --title "Version ${newVersion}" --notes-file ${releaseNotesPath}`);
    console.log(`GitHub release created for v${newVersion}`);
} catch (error) {
    console.error('Error creating GitHub release:', error.message);
    console.log('You may need to install GitHub CLI (gh) or authenticate it.');
    console.log(`You can manually create a release with: gh release create v${newVersion}`);
}

// Clean up release notes file
try {
    fs.unlinkSync(releaseNotesPath);
} catch (error) {
    console.error('Error removing temporary release notes file:', error);
}

console.log(`Released version ${newVersion}`);
