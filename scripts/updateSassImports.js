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
  // Add other mixin names here
];

const MIXIN_PATTERN = MIXIN_NAMES.join('|');

// Helper function to check if a line contains a URL or font-family declaration
function isUrlOrFontLine(line) {
  return line.includes('@import url(') || 
         line.includes('font-family:') || 
         line.includes('url(') ||
         line.includes('format(');
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
        
        // First replace @import with @use
        const importRegex = /@import\s+(['"])([^'"]+)[Mm]ixins\.sass\1/g;
        if (importRegex.test(updatedStyle)) {
          updatedStyle = updatedStyle.replace(importRegex, (_, quote, p1) => {
            const dirPath = p1.replace(/[Ss]tyles\/?$/, 'styles');
            wasUpdated = true;
            return `@use ${quote}${dirPath}/_mixins${quote} as mixins`;
          });
        }
        
        // Process the style content line by line
        updatedStyle = updatedStyle.split('\n').map(line => {
          // Skip URL and font-family lines
          if (isUrlOrFontLine(line)) {
            return line;
          }
          
          // Replace @include with mixins prefix
          if (/@include\s+([a-zA-Z-]+)/.test(line)) {
            wasUpdated = true;
            return line.replace(/@include\s+([a-zA-Z-]+)/g, '@include mixins.$1');
          }
          
          // Add mixins. prefix to mixin calls that aren't already prefixed
          if (new RegExp(`\\+(?!mixins\\.)(${MIXIN_PATTERN})\\b`).test(line)) {
            wasUpdated = true;
            return line.replace(new RegExp(`\\+(?!mixins\\.)(${MIXIN_PATTERN})\\b`, 'g'), '+mixins.$1');
          }
          
          // Handle commented out mixin calls
          if (new RegExp(`(\\s*//\\s*)\\+(?!mixins\\.)(${MIXIN_PATTERN})\\b`).test(line)) {
            wasUpdated = true;
            return line.replace(new RegExp(`(\\s*//\\s*)\\+(?!mixins\\.)(${MIXIN_PATTERN})\\b`, 'g'), '$1+mixins.$2');
          }
          
          return line;
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
      // Skip URL and font-family lines
      if (isUrlOrFontLine(line)) {
        return line;
      }
      
      // Replace @import with @use
      if (/@import\s+(['"])([^'"]+)[Mm]ixins\.sass\1/.test(line)) {
        wasUpdated = true;
        return line.replace(/@import\s+(['"])([^'"]+)[Mm]ixins\.sass\1/g, (_, quote, p1) => {
          const dirPath = p1.replace(/[Ss]tyles\/?$/, 'styles');
          return `@use ${quote}${dirPath}/_mixins${quote} as mixins`;
        });
      }
      
      // Replace @include with mixins prefix
      if (/@include\s+([a-zA-Z-]+)/.test(line)) {
        wasUpdated = true;
        return line.replace(/@include\s+([a-zA-Z-]+)/g, '@include mixins.$1');
      }
      
      // Add mixins. prefix to mixin calls that aren't already prefixed
      if (new RegExp(`\\+(?!mixins\\.)(${MIXIN_PATTERN})\\b`).test(line)) {
        wasUpdated = true;
        return line.replace(new RegExp(`\\+(?!mixins\\.)(${MIXIN_PATTERN})\\b`, 'g'), '+mixins.$1');
      }
      
      // Handle commented out mixin calls
      if (new RegExp(`(\\s*//\\s*)\\+(?!mixins\\.)(${MIXIN_PATTERN})\\b`).test(line)) {
        wasUpdated = true;
        return line.replace(new RegExp(`(\\s*//\\s*)\\+(?!mixins\\.)(${MIXIN_PATTERN})\\b`, 'g'), '$1+mixins.$2');
      }
      
      return line;
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