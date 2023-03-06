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
  toCommonJS,
};
