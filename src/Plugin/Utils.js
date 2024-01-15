/**
 * Transform source code from ESM to CommonJS syntax.
 *
 * @param {string} code ESM code.
 * @returns {string} CommonJS code.
 */
const transformToCommonJS = (code) => {
  // import to require
  const importMatches = code.matchAll(/import (.+) from "(.+)";/g);
  for (const [match, variable, file] of importMatches) {
    code = code.replace(match, `var ${variable} = require('${file}');`);
  }

  // transform `new URL("data:image...", import.meta.url)` to 'data:image...'
  const urlDataMatches = code.matchAll(/= new URL\("(data:.+?)", import.meta.url\);/g);
  for (const [match, data] of urlDataMatches) {
    code = code.replace(match, `= '${data}';`);
  }

  // transform `new URL("file")` to `require('file')`
  const urlMatches = code.matchAll(/= new URL\("(.+?)".*?\);/g);
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
  transformToCommonJS,
};
