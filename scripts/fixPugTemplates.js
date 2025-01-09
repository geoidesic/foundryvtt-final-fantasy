#!/usr/bin/env node

import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// List of Pug control flow keywords that need + prefix
const PUG_KEYWORDS = ['if', 'else', 'each', 'unless', 'case', 'when', 'default', 'while'];

async function updateFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    
    // Only process files with Pug templates
    if (content.includes('<template lang="pug">') || content.includes("<template lang='pug'>")) {
      // Fix Pug templates
      content = content.replace(
        /(<template lang=['"]pug['"]>)([\s\S]*?)(<\/template>)/g,
        (match, openTag, pugContent, closeTag) => {
          // Add back the + prefix to control structures that don't have it
          // But don't add it to ones that already have it
          pugContent = pugContent.replace(
            new RegExp(`(?<!\\+)(${PUG_KEYWORDS.join('|')})\\b(?![-\\w])`, 'g'),
            '+$1'
          );

          return `${openTag}${pugContent}${closeTag}`;
        }
      );
      
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

async function findAndUpdateFiles() {
  try {
    // Find all .svelte files in the project
    const { stdout } = await execAsync('git ls-files "*.svelte"');
    const files = stdout.split('\n').filter(Boolean);

    for (const file of files) {
      // Process all Svelte files with Pug templates
      const content = await fs.readFile(file, 'utf8');
      if (content.includes('<template lang="pug">') || content.includes("<template lang='pug'>")) {
        await updateFile(file);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

findAndUpdateFiles()
  .then(() => console.log('Done fixing Pug templates'))
  .catch(console.error); 