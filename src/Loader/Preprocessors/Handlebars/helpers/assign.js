'use strict';

/** @typedef {import('handlebars')} Handlebars */
/** @typedef {import('handlebars').HelperOptions} HelperOptions */

/**
 * Assign a value to data variable.
 *
 * Usage:
 *   {{assign title='About'}} - define `title` variable
 *   {{title}} - output variable
 *
 * @param {Handlebars} Handlebars
 * @return {function(string, HelperOptions, *): *}
 */
module.exports = (Handlebars) => {
  /**
   * @param {HelperOptions} options The options passed via tag attributes into a template.
   * @return {void}
   */
  return function (options) {
    // don't modify `this` in code directly, because it will be compiled in `exports` as an immutable object
    const context = this;
    const attrs = options.hash;

    for (const key in attrs) {
      context[key] = attrs[key];
    }
  };
};
