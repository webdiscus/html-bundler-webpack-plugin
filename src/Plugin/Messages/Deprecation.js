const { red, green, black } = require('ansis');
const { outToConsole } = require('../../Common/Helpers');
const Config = require('../../Common/Config');

const { pluginLabel } = Config.get();

const header = `\n${black.bgYellow` ${pluginLabel} `}${black.bgAnsi(227)` DEPRECATE `} `;

// Example for deprecations

// const deprecateSomeOption = () => {
//   outToConsole(header + `Use the '${green`css`}' option name instead of the '${red`deprecate`}'.\n`);
// };
//
// module.exports = {
//   deprecateSomeOption,
// };
