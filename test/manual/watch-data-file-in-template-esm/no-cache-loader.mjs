/**
 * Using Node.js loader to bypass cache for sub-imported files.
 *
 * Pros:
 * - load native ESM module without limitation by an exported type
 * - load data after changes without cache
 *
 * Cons:
 * - requires to specify the loader in command
 * - Webpack not rebuilds modules after changes, although data loaded without cache
 *
 * Add to package.json:
 *
 * "scripts": {
 *   "start:nocache": "node --loader ./no-cache-loader.mjs ./node_modules/webpack/bin/webpack.js serve --mode development",
 * }
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

// the directory in the current project directory where
const nocacheDir = 'src';

// absolute path to the project root
const projectRoot = path.resolve();
const srcDir = path.join(projectRoot, nocacheDir);

export async function resolve(specifier, context, nextResolve) {
  // resolve full path of the module
  const resolved = await nextResolve(specifier, context);
  const filePath = fileURLToPath(resolved.url);

  // apply cache-busting for files under ./src/
  if (filePath.startsWith(srcDir)) {
    const bustedUrl = new URL(resolved.url);
    bustedUrl.searchParams.set('nocache', Date.now().toString());

    return {
      ...resolved,
      shortCircuit: false,
      url: bustedUrl.href,
    };
  }

  return resolved;
}
