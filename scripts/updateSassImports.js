#!/usr/bin/env node

import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function updateFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    
    // Replace @import with @use
    content = content.replace(
      /@import\s+['"](.+)Mixins\.sass['"]/g,
      (match, p1) => `@use '${p1}_mixins' as *`
    );
    
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

async function findAndUpdateFiles() {
  try {
    const { stdout } = await execAsync('git ls-files "*.svelte" "*.sass"');
    const files = stdout.split('\n').filter(Boolean);

    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      if (content.includes('@import') && content.includes('Mixins.sass')) {
        await updateFile(file);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

findAndUpdateFiles()
  .then(() => console.log('Done updating Sass imports'))
  .catch(console.error); 