const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Helper function to convert Pug-style classes to Svelte classes
function convertClasses(classes) {
    if (!classes) return '';
    return classes.split('.').filter(Boolean).map(c => `class="${c}"`).join(' ');
}

// Helper function to convert Pug-style attributes to Svelte attributes
function convertAttributes(line) {
    // Handle basic attribute conversion
    line = line.replace(/\(([^)]+)\)/g, (match, attrs) => {
        return attrs.split(',').map(attr => {
            const [key, value] = attr.trim().split('=');
            if (value === undefined) return key;
            return `${key}=${value}`;
        }).join(' ');
    });

    // Handle Pug mixins
    line = line.replace(/\+if\("([^"]+)"\)/, '{#if $1}');
    line = line.replace(/\+each\("([^"]+)"\)/, '{#each $1}');

    return line;
}

// Helper function to convert a Pug line to Svelte
function convertLine(line, indent) {
    let svelteLine = line.trim();
    
    // Skip empty lines
    if (!svelteLine) return '';

    // Handle Pug class shortcuts
    if (svelteLine.startsWith('.')) {
        const classes = convertClasses(svelteLine);
        svelteLine = `<div ${classes}></div>`;
    }

    // Convert attributes
    svelteLine = convertAttributes(svelteLine);

    // Add proper indentation
    return ' '.repeat(indent) + svelteLine;
}

function convertPugToSvelte(content) {
    const lines = content.split('\n');
    let result = [];
    let inTemplate = false;
    let currentIndent = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Handle template tag
        if (line.includes('<template lang="pug">') || line.includes("<template lang='pug'>")) {
            inTemplate = true;
            continue;
        }
        
        if (line.includes('</template>')) {
            inTemplate = false;
            continue;
        }

        if (inTemplate) {
            const convertedLine = convertLine(line, currentIndent);
            if (convertedLine) {
                result.push(convertedLine);
            }
        } else {
            result.push(line);
        }
    }

    return result.join('\n');
}

// Find all Svelte files
const files = glob.sync('src/**/*.svelte');

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Only process files that contain Pug templates
    if (content.includes('template lang="pug"') || content.includes("template lang='pug'")) {
        console.log(`Converting ${file}...`);
        const converted = convertPugToSvelte(content);
        fs.writeFileSync(file, converted);
    }
});

console.log('Conversion complete!'); 