const path = require('path');

const { isWin, isFunction, pathToPosix, parseQuery, outToConsole } = require('../Common/Helpers');

const workingDir = process.env.PWD;

/**
 * Return path of file relative by working directory.
 *
 * @param {string} file
 * @return {string}
 */
const pathRelativeByPwd = (file) => {
  if (file.startsWith(workingDir)) {
    let relPath = path.relative(workingDir, file);

    return path.extname(file) ? relPath : path.join(relPath, path.sep);
  }

  return file;
};

/**
 * Parse resource path and raw query from request.
 *
 * @param {string} request
 * @return {{resource: string, query: string|null}}
 */
const parseRequest = (request) => {
  const [resource, query] = request.split('?');
  return { resource, query };
};

/**
 * Transform source code from ESM to CommonJS.
 *
 * @param {string} code ESM code.
 * @returns {string} CommonJS code.
 */
const toCommonJS = (code) => {
  // import to require
  const importMatches = code.matchAll(/import (.+) from "(.+)";/g);
  for (const [match, variable, file] of importMatches) {
    code = code.replace(match, `var ${variable} = require('${file}');`);
  }
  // new URL to require
  const urlMatches = code.matchAll(/= new URL\("(.+?)"(?:.*?)\);/g);
  for (const [match, file] of urlMatches) {
    code = code.replace(match, `= require('${file}');`);
  }

  // TODO: implement clever method to replace module `export default`, but not in a text
  //   use cases:
  //     export default '<h1>Hello World!</h1>'; // OK
  //     export default '<h1>Code example: `var code = "hello";export default code;` </h1>'; // <= fix it
  code = code.replace(/export default (.+);/, 'module.exports = $1;');

  return code;
};

module.exports = {
  isWin,
  pathToPosix,
  outToConsole,
  pathRelativeByPwd,
  parseQuery,
  parseRequest,
  isFunction,
  toCommonJS,
};
