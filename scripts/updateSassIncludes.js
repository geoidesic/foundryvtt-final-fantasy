#!/usr/bin/env node

import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// List of Pug control flow keywords that should not have mixins. prefix
const PUG_KEYWORDS = ['if', 'else', 'each', 'unless', 'case', 'when', 'default', 'while'];

async function updateFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    
    if (filePath.endsWith('.svelte')) {
      // Fix Pug templates - remove mixins. prefix from control flow statements
      content = content.replace(
        /(<template lang="pug">)([\s\S]*?)(<\/template>)/g,
        (match, openTag, pugContent, closeTag) => {
          // Remove mixins. prefix from Pug control flow statements
          pugContent = pugContent.replace(
            new RegExp(`\\+mixins\\.(${PUG_KEYWORDS.join('|')})`, 'g'),
            '+$1'
          );
          
          return `${openTag}${pugContent}${closeTag}`;
        }
      );

      // For .svelte files, only update within <style lang="sass"> blocks
      content = content.replace(
        /(<style lang="sass">)([\s\S]*?)(<\/style>)/g,
        (match, openTag, styleContent, closeTag) => {
          // Replace @include with +mixins. for mixin calls
          styleContent = styleContent.replace(
            /@include\s+([a-zA-Z-]+)/g,
            '+mixins.$1'
          );
          
          // Replace bare + mixin calls with +mixins. prefix, only if not already prefixed
          styleContent = styleContent.replace(
            /\+(?!mixins\.)([a-zA-Z-]+)/g,
            '+mixins.$1'
          );
          
          return `${openTag}${styleContent}${closeTag}`;
        }
      );
    } else if (filePath.endsWith('.sass')) {
      // For .sass files, update the entire content
      content = content.replace(
        /@include\s+([a-zA-Z-]+)/g,
        '+mixins.$1'
      );
      
      content = content.replace(
        /\+(?!mixins\.)([a-zA-Z-]+)/g,
        '+mixins.$1'
      );
    }
    
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

async function findAndUpdateFiles() {
  try {
    // Find all .svelte and .sass files in the project
    const { stdout } = await execAsync('git ls-files "*.svelte" "*.sass"');
    const files = stdout.split('\n').filter(Boolean);

    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      // Check for both @include, bare + calls, and Pug templates
      if (content.includes('@include') || 
          /\+(?!mixins\.)[a-zA-Z-]+/.test(content) ||
          content.includes('<template lang="pug">')) {
        await updateFile(file);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

findAndUpdateFiles()
  .then(() => console.log('Done updating Sass includes'))
  .catch(console.error); 