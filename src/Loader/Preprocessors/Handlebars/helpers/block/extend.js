'use strict';

/** @typedef {import('handlebars')} Handlebars */
/** @typedef {import('handlebars').HelperOptions} HelperOptions */

/**
 * Save the partial content for a block.
 * Note: `partial` and `block` are paar helpers.
 *
 * Usage:
 *   {{#partial 'BLOCK_NAME'}}BLOCK_CONTENT{{/partial}} - define block content
 *   {{#block 'BLOCK_NAME'}}{{/block}} - output block content
 *
 * @param {Handlebars} Handlebars
 * @return {function(string, HelperOptions, *): *}
 */
module.exports = (Handlebars) => {
  /**
   * @param {string} name The block name.
   * @param {HelperOptions} options The options passed via tag attributes into a template.
   * @return {void}
   */
  return function (name, options, args, args2) {
    // don't modify `this` in code directly, because it will be compiled in `exports` as an immutable object
    const context = this;
    const attrs = options.hash;

    if (!context._extend) {
      context._extend = name;
    } else {
      throw new Error(`Only one 'extend' can be pro page, at first line of template.`);
    }
    //context._blocks[name] = options.fn;

    console.log('\n>> EXTEND: ', { name, options, data: options.data, loc: options.loc, attrs, args, args2, context });

    // if (!context._blocks) {
    //   context._blocks = {};
    // }
    //context._blocks[name] = options.fn;
  };
};
