const path = require('path');

const { isWin, pathToPosix, parseQuery, outToConsole } = require('../Common/Helpers');

let hmrFile = path.join(__dirname, 'hmr.js');
if (isWin) hmrFile = pathToPosix(hmrFile);

/**
 * Whether request contains `inline` param.
 *
 * @param {string} request
 * @return {boolean}
 */
const isInline = (request) => {
  const [, query] = request.split('?', 2);
  return query != null && /(?:^|&)inline(?:$|&)/.test(query);
};

module.exports = {
  isWin,
  pathToPosix,
  outToConsole,
  hmrFile,
  isInline,
  parseQuery,
};
