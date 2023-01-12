const { black, yellow, cyan, magenta } = require('ansis/colors');
const { pluginName } = require('../config');
const { outToConsole, parseRequest } = require('../Utils');

const header = `\n${black.bgYellow`[${pluginName}] WARNING`} `;

const duplicateScriptWarning = (request, issuer) => {
  const { resource } = parseRequest(request);
  outToConsole(
    header +
      `${yellow`Duplicate scripts are not allowed in same file!`}\n` +
      `The file ${cyan(resource)} is already used in ${magenta(issuer)}.\n` +
      `Note: only first script will be resolved, all duplicates will be ignored.\n`
  );
};

const duplicateStyleWarning = (request, issuer) => {
  const { resource } = parseRequest(request);
  outToConsole(
    header +
      `${yellow`Duplicate styles are not allowed in same file!`}\n` +
      `The file ${cyan(resource)} is already used in ${magenta(issuer)}.\n`
  );
};

module.exports = {
  duplicateScriptWarning,
  duplicateStyleWarning,
};
