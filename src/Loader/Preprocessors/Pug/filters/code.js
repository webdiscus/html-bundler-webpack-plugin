/**
 * The `:code` filter wraps a content with the `<code>` tag.
 *
 * Usage:
 *
 * Block syntax:
 *
 * :code
 *   function() {
 *     return true;
 *   }
 *
 * Inline syntax:
 *
 * The #[:code function] keyword is reserved.
 */

// To enable the filter add to `@webdiscus/pug-loader` options the following:
// {
//   test: /\.pug$/,
//   loader: '@webdiscus/pug-loader',
//   options: {
//     embedFilters: {
//       code: {
//         className: 'language-', // class name in the `<code>` tag
//       },
//     },
//   },
// },

const code = {
  name: 'code',
  className: '',

  init({ className }) {
    this.className = className || '';
  },

  apply(text, options) {
    const className = this.className;
    const attrClass = className ? ` class="${className}"` : '';
    return `<code${attrClass}>` + text + '</code>';
  },
};

module.exports = code;
