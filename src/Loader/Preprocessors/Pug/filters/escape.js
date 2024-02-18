/**
 * The `:escape` filter replaces reserved HTML characters with their corresponding HTML entities.
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Entity
 *
 * Block syntax:
 *
 * pre: code
 *   :escape
 *     <div>
 *       <a href="home.html">Home</a>
 *     </div>
 *
 * Inline syntax:
 *
 * The #[:escape <div>] tag.
 */

// To enable the filter add to `@webdiscus/pug-loader` options the following:
// {
//   test: /\.pug$/,
//   loader: '@webdiscus/pug-loader',
//   options: {
//     embedFilters: {
//       escape: true,
//     },
//   },
// },

const reservedChars = /[&<>"]/g;
const charReplacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};
const replacer = (char) => charReplacements[char];

const escape = {
  name: 'escape',

  apply(text, options) {
    return text.replace(reservedChars, replacer);
  },
};

module.exports = escape;
