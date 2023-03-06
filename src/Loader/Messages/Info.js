const { black, ansi } = require('ansis/colors');
const { pluginName } = require('../../config');
const { pathRelativeByPwd, outToConsole } = require('../../Common/Helpers');

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
