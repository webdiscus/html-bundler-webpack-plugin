/**
 * @typedef {import('@fullhuman/postcss-purgecss').UserDefinedOptions} PostCssPurgeCssOptions
 * @typedef {PostCssPurgeCssOptions} Options
 */

const path = require('node:path');

const paths = {
  src: path.resolve(__dirname, './src'),
  output: path.resolve(__dirname, './dist'),
};

/**
 * @type {{string: Options}} plugin
 */
const plugin = {
  '@fullhuman/postcss-purgecss': {
    contentFunction: (sourceInputFileName) => {
      const { dir, name } = path.parse(sourceInputFileName);

      // not works when you have partials in template
      //const files = [`${dir}/${name}.html`];

      // works after the second build, because at the first time the dist dir is empty
      const files = [`${paths.output}/${name}.html`];

      //console.log('\n=> PurgeCss: ', { sourceInputFileName, name, files });

      return files;
    },
    keyframes: true,
    variables: true,
  },
};

module.exports = plugin;
