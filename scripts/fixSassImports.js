#!/usr/bin/env node

import { promises as fs } from 'fs';
import pkg from 'glob';
const { glob } = pkg;
import { promisify } from 'util';
import path from 'path';

const globPromise = promisify(glob);

async function fixSvelteFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let wasUpdated = false;
    
    // Fix within <style lang="sass"> blocks
    content = content.replace(
      /(<style\s+lang=["']sass["']>)([\s\S]*?)(<\/style>)/g,
      (match, openTag, styleContent, closeTag) => {
        // First fix the incorrect @use statements
        let updatedStyle = styleContent.replace(
          /@use\s+(['"])([^'"]+)styles_mixins\1\s+as\s+\*/g,
          (_, quote, p1) => {
            wasUpdated = true;
            return `@use ${quote}${p1}styles/_mixins${quote} as mixins`;
          }
        );
        
        // Then add mixins. prefix to all + includes that don't already have it
        updatedStyle = updatedStyle.replace(
          /\+(?!mixins\.)([a-zA-Z-]+)/g,
          (match, name) => {
            wasUpdated = true;
            return `+mixins.${name}`;
          }
        );
        
        return `${openTag}${updatedStyle}${closeTag}`;
      }
    );
    
    if (wasUpdated) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

async function fixSassFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let wasUpdated = false;
    
    // Fix incorrect @use statements
    content = content.replace(
      /@use\s+(['"])([^'"]+)styles_mixins\1\s+as\s+\*/g,
      (_, quote, p1) => {
        wasUpdated = true;
        return `@use ${quote}${p1}styles/_mixins${quote} as mixins`;
      }
    );
    
    // Add mixins. prefix to all + includes that don't already have it
    content = content.replace(
      /\+(?!mixins\.)([a-zA-Z-]+)/g,
      (match, name) => {
        wasUpdated = true;
        return `+mixins.${name}`;
      }
    );
    
    if (wasUpdated) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

async function findAndFixFiles() {
  try {
    // Find all .svelte and .sass files
    const files = await globPromise('src/**/*.{svelte,sass}');

    let updatedCount = 0;
    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      const isSvelte = file.endsWith('.svelte');
      
      // For Svelte files, check for incorrect imports or missing mixins prefixes within style tags
      if (isSvelte) {
        const needsFixing = /<style\s+lang=["']sass["']>[\s\S]*?(@use\s+['"][^'"]+styles_mixins['"]|\+(?!mixins\.)[a-zA-Z-]+)[\s\S]*?<\/style>/g.test(content);
        if (needsFixing) {
          await fixSvelteFile(file);
          updatedCount++;
        }
      } else {
        // For .sass files, check anywhere in the file
        if (/@use\s+['"][^'"]+styles_mixins['"]|\+(?!mixins\.)[a-zA-Z-]+/.test(content)) {
          await fixSassFile(file);
          updatedCount++;
        }
      }
    }
    console.log(`Fixed ${updatedCount} files`);
  } catch (err) {
    console.error('Error:', err);
  }
}

findAndFixFiles()
  .then(() => console.log('Done fixing Sass imports'))
  .catch(console.error); 