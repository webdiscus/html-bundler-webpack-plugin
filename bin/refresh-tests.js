#!/usr/bin/env node

/**
 * Replace Expected Files with Current Output
 *
 * This script recursively walks through the given directory and replaces the contents
 * of each `expected/` folder with the contents of its sibling `dist/` folder.
 *
 * It is intended to refresh test output snapshots (e.g., expected HTML, JS, or CSS files)
 * when tools like Babel, Webpack, or PostCSS change their output due to dependency upgrades.
 *
 * Typical use case: After updating build toolchains, generated files may change due to
 * new algorithms, plugin defaults, or parser behavior. This script updates the `expected/`
 * results so that tests reflect the new output.
 *
 * Usage:
 *   node refresh-tests.js <relative-or-absolute-path>
 *
 * Example:
 *   node refresh-tests.js ./test/cases
 *   node refresh-tests.js ./test/cases/_preprocessor
 *
 * Notes:
 * - Both `dist/` and `expected/` folders must exist and be directories.
 * - The script will delete all files in `expected/` before copying from `dist/`.
 */

const fs = require('fs');
const path = require('path');

/**
 * Recursively copies all files and folders from src to dest
 */
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  for (const item of fs.readdirSync(src)) {
    const srcItem = path.join(src, item);
    const destItem = path.join(dest, item);
    const stat = fs.statSync(srcItem);

    if (stat.isDirectory()) {
      copyRecursive(srcItem, destItem);
    } else {
      fs.copyFileSync(srcItem, destItem);
    }
  }
}

/**
 * Recursively walks directories looking for "dist" and "expected" sibling folders.
 */
function walkAndReplace(rootDir) {
  for (const item of fs.readdirSync(rootDir)) {
    const fullPath = path.join(rootDir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const distPath = path.join(fullPath, 'dist');
      const expectedPath = path.join(fullPath, 'expected');

      if (
        fs.existsSync(distPath) &&
        fs.statSync(distPath).isDirectory() &&
        fs.existsSync(expectedPath) &&
        fs.statSync(expectedPath).isDirectory()
      ) {
        // clear expected/
        for (const file of fs.readdirSync(expectedPath)) {
          const target = path.join(expectedPath, file);
          fs.rmSync(target, { recursive: true, force: true });
        }

        // copy dist/ to expected/
        copyRecursive(distPath, expectedPath);
        console.log(`✓ Replaced: ${expectedPath}`);
      }

      // recurse into subdirectory
      walkAndReplace(fullPath);
    }
  }
}

// Entry point
const inputDir = process.argv[2];
if (!inputDir) {
  console.error('Usage: node refresh-tests.js <directory>');
  process.exit(1);
}

const root = path.resolve(process.cwd(), inputDir);
if (!fs.existsSync(root)) {
  console.error(`Error: Directory does not exist: ${root}`);
  process.exit(1);
}

walkAndReplace(root);
