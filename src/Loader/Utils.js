const path = require('path');

const { isWin, pathToPosix } = require('../Common/Helpers');

let hmrFile = path.join(__dirname, 'hmr.js');
if (isWin) hmrFile = pathToPosix(hmrFile);

module.exports = {
  hmrFile,
};
