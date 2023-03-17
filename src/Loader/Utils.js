const path = require('path');

/**
 * Inject a string before closing </head> tag.
 *
 * @param {string} content
 * @param {string} string
 * @return {string}
 */
const injectBeforeEndHead = (content, string) => injectBefore(content, string, ['</head>', '</body>', '</html>']);

/**
 * Inject a string before closing </body> tag.
 *
 * @param {string} content
 * @param {string} string
 * @return {string}
 */
const injectBeforeEndBody = (content, string) => injectBefore(content, string, ['</body>', '</html>']);

/**
 * Inject a string before one of founded strings
 *
 * @param {string} content Where should be injected a string.
 * @param {string} string The string to inject in content.
 * @param {Array<string>} before The string will be injected before the first found entry.
 *  If no entry found, the string will be added to the end of the content.
 * @return string
 */
const injectBefore = (content, string, before = []) => {
  let pos = content.length;

  for (let str of before) {
    let currentPos = content.indexOf(str);
    if (currentPos >= 0) {
      pos = currentPos;
      break;
    }
  }

  return content.slice(0, pos) + string + content.slice(pos);
};

module.exports = {
  hmrFile: path.join(__dirname, 'Hmr/hot-update.js'),
  injectBeforeEndHead,
  injectBeforeEndBody,
};
