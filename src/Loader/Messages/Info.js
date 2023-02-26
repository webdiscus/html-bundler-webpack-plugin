const { pluginName } = require('../../config');
const { pathRelativeByPwd } = require('../../Common/Helpers');
const { outToConsole } = require('../Utils');
const { black, ansi } = require('ansis/colors');

/**
 * @param {Array<string>} files
 */
const verboseWatchFiles = (files) => {
  let str = `${black.bgAnsi(134)` ${pluginName} `}${black.bgAnsi(250)` Watch files `}\n`;

  for (let key in files) {
    str += '- ' + ansi(147)(pathRelativeByPwd(files[key])) + '\n';
  }

  outToConsole(str);
};

module.exports = {
  verboseWatchFiles,
};
