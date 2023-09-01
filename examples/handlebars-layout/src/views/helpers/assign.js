'use strict';

/** @typedef {import('handlebars').HelperOptions} HelperOptions */

/**
 * Assign a value to data variable.
 *
 * Usage:
 *   {{assign title='Homepage' header='Home'}} - define variable(s)
 *   {{title}} {{header}} - output variable(s)
 *
 * @param {HelperOptions} options The options passed via tag attributes into a template.
 * @return {void}
 */
module.exports = function (options) {
  // don't modify `this` in code directly, because it will be compiled in `exports` as an immutable object
  const context = this;
  const attrs = options.hash;

  for (const key in attrs) {
    context[key] = attrs[key];
  }
};
