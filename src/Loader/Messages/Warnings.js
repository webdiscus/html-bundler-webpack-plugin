const { yellow, cyan, green, red, reset, black } = require('ansis');
const { outToConsole } = require('../../Common/Helpers');
const Config = require('../../Common/Config');

const { pluginLabel } = Config.get();
const headerWarning = `\n${reset.black.bgYellow` ${pluginLabel} `}\n`;
const headerDeprecation = `\n${reset.black.bgYellow` ${pluginLabel} `}${black.bg(227)` DEPRECATION `} `;

/**
 * @param {Array<string>} dirs Not founded directories.
 * @param {Array} paths The `watchFiles.paths` option.
 */
const watchPathsWarning = (dirs, paths) => {
  const message =
    `The watch directories not found:\n ${yellow`${dirs.join('\n')}`}.\n` +
    `Check the ${green`watchFiles.paths`} option:\n` +
    cyan(JSON.stringify(paths, null, '  '));

  outToConsole(headerWarning + message);
};

const watchFilesOptionFilesDeprecation = () => {
  const message = `Use the '${green`watchFiles.includes`}' option name instead of the deprecated '${red`watchFiles.files`}'.`;

  outToConsole(headerDeprecation + message);
};

const watchIgnoreOptionIgnoreDeprecation = () => {
  const message = `Use the '${green`watchFiles.excludes`}' option name instead of the deprecated '${red`watchFiles.ignore`}'.`;

  outToConsole(headerDeprecation + message);
};

module.exports = {
  watchPathsWarning,
  watchFilesOptionFilesDeprecation,
  watchIgnoreOptionIgnoreDeprecation,
};
