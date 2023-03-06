const path = require('path');

const { isWin, pathToPosix, parseQuery, outToConsole } = require('../Common/Helpers');

let hmrFile = path.join(__dirname, 'hmr.js');
if (isWin) hmrFile = pathToPosix(hmrFile);

module.exports = {
  isWin,
  pathToPosix,
  outToConsole,
  hmrFile,
  parseQuery,
};
