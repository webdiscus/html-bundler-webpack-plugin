const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { deserialize } = require('node:v8');
const { fork } = require('node:child_process');

const childScript = path.resolve(__dirname, './child.mjs');

/**
 * Load an ESM module without cache for sub-imports.
 *
 * Note: The exported value must be serializable using v8.serialize.
 * This excludes functions, promises, and other unsupported types.
 *
 * Use it for loading ESM data modules where live changes should be picked up
 * without restarting the main process or clearing the cache manually.
 *
 * @param {string} filePath Relative or absolute path to ESM module
 * @returns {Promise<any>} The resolved module exports
 */
function loader(filePath) {
  const absPath = path.resolve(filePath);
  const fileUrl = pathToFileURL(absPath).href;

  return fs.promises
    .access(absPath, fs.constants.F_OK)
    .then(() => {
      return new Promise((resolve, reject) => {
        /** @type ForkOptions */
        const options = {
          stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
          env: {
            MODULE_URL: `${fileUrl}?nocache=${Date.now()}`,
          },
        };

        const child = fork(childScript, [], options);

        child.on('message', async (msg) => {
          if (msg.error) {
            reject(Object.assign(new Error(msg.error.message), msg.error));
          } else if (msg.buffer) {
            try {
              const result = deserialize(Buffer.from(msg.buffer));
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }
          child.kill();
        });

        child.on('error', reject);
        child.on('exit', (code) => {
          if (code !== 0) reject(new Error(`Child exited with code ${code}`));
        });
      }).catch((reason) => {
        throw new Error(`${reason.stack}`);
      });
    })
    .catch((reason) => {
      throw new Error(`Failed to load module: ${absPath}\n${reason}`);
    });
}

module.exports = loader;
