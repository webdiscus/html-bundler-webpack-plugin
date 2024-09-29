/**
 * The layouts helpers.
 * See https://www.npmjs.com/package/handlebars-layouts
 */

const handlebars = require('handlebars');

const hasOwn = Object.prototype.hasOwnProperty;

function noop() {
  return '';
}

function getStack(context) {
  return context.__layoutStack || (context.__layoutStack = []);
}

function applyStack(context) {
  const stack = getStack(context);

  while (stack.length) {
    stack.shift()(context);
  }
}

/**
 * @param {Object} context
 * @return Object
 */
function getActions(context) {
  return context.__layoutActions || (context.__layoutActions = {});
}

function getActionsByName(context, name) {
  const actions = getActions(context);

  return actions[name] || (actions[name] = []);
}

function applyAction(value, action) {
  const context = this;

  function fn() {
    return action.fn(context, action.options);
  }

  switch (action.mode) {
    case 'append': {
      return value + fn();
    }

    case 'prepend': {
      return fn() + value;
    }

    case 'replace': {
      return fn();
    }

    default: {
      return value;
    }
  }
}

function mixin(target) {
  const len = arguments.length;
  let i = 1,
    arg,
    key;

  for (; i < len; i++) {
    arg = arguments[i];

    if (!arg) {
      continue;
    }

    for (key in arg) {
      // istanbul ignore else
      if (hasOwn.call(arg, key)) {
        target[key] = arg[key];
      }
    }
  }

  return target;
}

const helpers = {
  /**
   * @method extend
   * @param {String} name
   * @param {?Object} customContext
   * @param {Object} options
   * @param {function(Object)} options.fn
   * @param {Object} options.hash
   * @return {String} Rendered partial.
   */
  extend: function (name, customContext, options) {
    // Make `customContext` optional
    if (arguments.length < 3) {
      options = customContext;
      customContext = null;
    }

    options = options || {};

    const fn = options.fn || noop,
      context = mixin({}, this, customContext, options.hash),
      data = handlebars.createFrame(options.data);
    let template = handlebars.partials[name];

    // Partial template required
    if (template == null) {
      throw new Error("Missing partial: '" + name + "'");
    }

    // Compile partial, if needed
    if (typeof template !== 'function') {
      template = handlebars.compile(template);
    }

    // Add overrides to stack
    getStack(context).push(fn);

    // Render partial
    return template(context, { data: data });
  },

  /**
   * @method embed
   * @return {String} Rendered partial.
   */
  embed: function () {
    const context = mixin({}, this || {});

    // Reset context
    context.__layoutStack = null;
    context.__layoutActions = null;

    // Extend
    return helpers.extend.apply(context, arguments);
  },

  /**
   * @method block
   * @param {String} name
   * @param {Object} options
   * @param {function(Object)} options.fn
   * @return {String} Modified block content.
   */
  block: function (name, options) {
    options = options || {};

    const fn = options.fn || noop,
      data = handlebars.createFrame(options.data),
      context = this || {};

    applyStack(context);

    return getActionsByName(context, name).reduce(applyAction.bind(context), fn(context, { data: data }));
  },

  /**
   * @method content
   * @param {String} name
   * @param {Object} options
   * @param {function(Object)} options.fn
   * @param {Object} options.hash
   * @param {String} options.hash.mode
   * @return {String} Always empty.
   */
  content: function (name, options) {
    options = options || {};

    const fn = options.fn,
      data = handlebars.createFrame(options.data),
      hash = options.hash || {},
      mode = hash.mode || 'replace',
      context = this || {};

    applyStack(context);

    // Getter
    if (!fn) {
      return name in getActions(context);
    }

    // Setter
    getActionsByName(context, name).push({
      options: { data: data },
      mode: mode.toLowerCase(),
      fn: fn,
    });
  },
};

module.exports = helpers;
