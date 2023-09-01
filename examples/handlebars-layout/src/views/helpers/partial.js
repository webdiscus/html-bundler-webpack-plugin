'use strict';

/** @typedef {import('handlebars').HelperOptions} HelperOptions */

/**
 * Save the partial content for a block.
 * Note: `partial` and `block` are paar helpers.
 *
 * Usage:
 *   {{#partial 'BLOCK_NAME'}}BLOCK_CONTENT{{/partial}} - define block content
 *   {{#block 'BLOCK_NAME'}}{{/block}} - output block content
 *
 * @param {string} name The block name.
 * @param {HelperOptions} options The options passed via tag attributes into a template.
 * @return {void}
 */
module.exports = function (name, options) {
  // don't modify `this` in code directly, because it will be compiled in `exports` as an immutable object
  const context = this;

  if (!context._blocks) {
    context._blocks = {};
  }

  context._blocks[name] = options.fn;
};
