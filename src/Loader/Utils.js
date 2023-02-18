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

/**
 * @typedef OptionSources
 * @property {string} tag
 * @property {Array<string>?} attributes
 * @property {Function?} filter
 */

/**
 * Return merged defaults and option sources.
 *
 * @param {Array<OptionSources>|false|null} optionSources
 * @return {Array<OptionSources>}
 */
const getSourcesOption = (optionSources) => {
  // default tags and attributes for resolving resources
  const sources = [
    { tag: 'link', attributes: ['href', 'imagesrcset'] }, // 'imagesrcset' if rel="preload" and as="image"
    { tag: 'script', attributes: ['src'] },
    { tag: 'img', attributes: ['src', 'srcset'] },
    { tag: 'image', attributes: ['href'] }, // <svg><image href="image.png"></image></svg>
    { tag: 'use', attributes: ['href'] }, // <svg><use href="icons.svg#home"></use></svg>
    { tag: 'input', attributes: ['src'] }, // type="image"
    { tag: 'source', attributes: ['src', 'srcset'] },
    { tag: 'audio', attributes: ['src'] },
    { tag: 'track', attributes: ['src'] },
    { tag: 'video', attributes: ['src', 'poster'] },
    { tag: 'object', attributes: ['data'] },
  ];

  if (!Array.isArray(optionSources)) return sources;

  for (const item of optionSources) {
    const source = sources.find(({ tag }) => tag === item.tag);
    if (source) {
      if (item.attributes) {
        for (let attr of item.attributes) {
          // add only unique attributes
          if (source.attributes.indexOf(attr) < 0) source.attributes.push(attr);
        }
      }
      if (typeof item.filter === 'function') {
        source.filter = item.filter;
      }
    } else {
      sources.push(item);
    }
  }

  return sources;
};

module.exports = {
  isWin,
  pathToPosix,
  outToConsole,
  hmrFile,
  isInline,
  parseQuery,
  getSourcesOption,
};
