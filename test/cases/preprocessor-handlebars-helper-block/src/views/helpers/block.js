'use strict';

const Handlebars = require('handlebars');

/** @typedef {import('handlebars').HelperOptions} HelperOptions */

/**
 * Insert the partial content as a block.
 * Note: `partial` and `block` are paar helpers.
 *
 * Usage:
 *   {{#partial 'BLOCK_NAME'}}BLOCK_CONTENT{{/partial}} - define block content
 *   {{#block 'BLOCK_NAME'}}{{/block}} - output block content
 *
 * @param {string} name The block name.
 * @param {HelperOptions} options The options passed via tag attributes into a template.
 * @return {string}
 */
module.exports = function (name, options) {
  const context = this;
  let partial = context._blocks[name] || options.fn;

  if (typeof partial === 'string') {
    partial = Handlebars.compile(partial);
    context._blocks[name] = partial;
  }

  return partial(context, { data: options.hash });
};
