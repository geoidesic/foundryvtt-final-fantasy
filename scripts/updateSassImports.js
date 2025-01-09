#!/usr/bin/env node

import { promises as fs } from 'fs';
import pkg from 'glob';
const { glob } = pkg;
import { promisify } from 'util';
import path from 'path';

const globPromise = promisify(glob);

// List of known mixin names to match
const MIXIN_NAMES = [
  'background\\d*',
  'inset',
  'flex-column',
  'flex-row',
  'badge',
  'input',
  'input-disabled',
  'pulse',
  'buttons',
  // Add other mixin names here
];

const MIXIN_PATTERN = MIXIN_NAMES.join('|');

// Helper function to check if a line should be skipped
function shouldSkipLine(line) {
  return line.includes('font-family:') || 
         line.includes('url(') ||
         line.includes('format(') ||
         line.includes('data:image/svg') ||
         line.includes('.svg') ||
         line.includes('xmlns=');
}

// Helper function to normalize mixins prefix
function normalizeMixinsPrefix(line) {
  // Handle @import url() statements with font names
  if (line.includes('@import url(')) {
    // Remove any mixins. prefixes from font names
    return line.replace(/\+mixins\./g, '+').replace(/mixins\./g, '');
  }

  // Skip certain lines entirely
  if (shouldSkipLine(line)) {
    return line;
  }

  // Handle @use statements
  if (line.includes('@use') && (line.includes('_mixins') || line.includes('mixins'))) {
    // First normalize any double underscores
    line = line.replace('__mixins', '_mixins');
    // Then ensure the path format is correct
    line = line.replace(/(@use\s+['"].*?)[Mm]ixins(\.sass)?(['"].*?as).*$/, '$1_mixins$2$3 mixins');
    // Finally ensure there's exactly one underscore before mixins
    line = line.replace(/([^_])_mixins/, '$1_mixins').replace(/__mixins/, '_mixins');
    return line;
  }

  // First remove any triple or double mixins. prefixes
  while (line.includes('mixins.mixins.mixins.')) {
    line = line.replace('mixins.mixins.mixins.', '');
  }
  while (line.includes('mixins.mixins.')) {
    line = line.replace('mixins.mixins.', '');
  }
  
  // Then ensure there's exactly one mixins. prefix where needed
  if ((/@include\s+[^mixins\.]/.test(line) || /\+[^mixins\.]/.test(line)) && !line.includes('//')) {
    const parts = line.split(/(@include\s+|\+)([a-zA-Z-]+)/);
    if (parts.length > 1) {
      for (let i = 1; i < parts.length; i += 3) {
        const prefix = parts[i];
        const name = parts[i + 1];
        if (name && !name.startsWith('mixins.') && MIXIN_NAMES.some(pattern => new RegExp(`^${pattern}$`).test(name))) {
          parts[i + 1] = `mixins.${name}`;
        }
      }
      line = parts.join('');
    }
  }
  
  return line;
}

async function updateSvelteFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let wasUpdated = false;
    
    // Only replace within <style lang="sass"> blocks
    content = content.replace(
      /(<style\s+lang=["']sass["']>)([\s\S]*?)(<\/style>)/g,
      (match, openTag, styleContent, closeTag) => {
        let updatedStyle = styleContent;
        
        // Process the style content line by line
        updatedStyle = updatedStyle.split('\n').map(line => {
          const normalizedLine = normalizeMixinsPrefix(line);
          if (normalizedLine !== line) {
            wasUpdated = true;
          }
          return normalizedLine;
        }).join('\n');
        
        return `${openTag}${updatedStyle}${closeTag}`;
      }
    );
    
    if (wasUpdated) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
    return false;
  }
}

async function updateSassFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let wasUpdated = false;
    
    // Process the file line by line
    content = content.split('\n').map(line => {
      const normalizedLine = normalizeMixinsPrefix(line);
      if (normalizedLine !== line) {
        wasUpdated = true;
      }
      return normalizedLine;
    }).join('\n');
    
    if (wasUpdated) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
    return false;
  }
}

async function findAndUpdateFiles() {
  try {
    // Find all .svelte and .sass files
    const files = await globPromise('src/**/*.{svelte,sass}');
    
    let updatedCount = 0;
    for (const file of files) {
      const isSvelte = file.endsWith('.svelte');
      const wasUpdated = isSvelte ? await updateSvelteFile(file) : await updateSassFile(file);
      if (wasUpdated) updatedCount++;
    }
    console.log(`Updated ${updatedCount} files`);
  } catch (err) {
    console.error('Error:', err);
  }
}

findAndUpdateFiles()
  .then(() => console.log('Done updating Sass imports'))
  .catch(console.error); 