const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const Handlebars = require('handlebars');

/**
 * Find template data by template file.
 *
 * @param {string} sourceFile
 * @param {Object} data
 * @return {Object}
 */
const findData = (sourceFile, data) => {
  for (const [key, value] of Object.entries(data)) {
    if (sourceFile.endsWith(key)) return value;
  }
  return {};
};

const entryData = {
  'src/first.hbs': {
    title: 'Breaking Bad',
    firstname: 'Walter',
    lastname: 'Heisenberg',
  },
  'src/second.html': {
    title: 'Breaking Bad',
    firstname: 'Jesse',
    lastname: 'Pinkman',
  },
};

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    first: './src/first.hbs',
    second: './src/second.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|hbs)$/,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(html|hbs)$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          preprocessor: (content, { resource }) => Handlebars.compile(content)(findData(resource, entryData)),
        },
      },
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
