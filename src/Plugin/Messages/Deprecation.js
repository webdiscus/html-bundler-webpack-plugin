const { red, green, black } = require('ansis/colors');
const { pluginName } = require('../../config');
const { outToConsole } = require('../Utils');

const header = `\n${black.bgYellow`[${pluginName}] DEPRECATE`} `;

const deprecateOptionExtractCss = () => {
  outToConsole(header + `Use the '${green`css`}' option name instead of '${red`extractCss`}'.\n`);
};

module.exports = {
  deprecateOptionExtractCss,
};
