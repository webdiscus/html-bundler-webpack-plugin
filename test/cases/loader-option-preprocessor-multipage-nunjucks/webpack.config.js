const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const Nunjucks = require('nunjucks');

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

// note: data keys are different endings of source files
const entryData = {
  'home/index.html': {
    title: 'Home',
    filmTitle: 'Breaking Bad',
    description: 'Breaking Bad is an American crime drama',
    city: 'Albuquerque',
    state: 'New Mexico',
    imageFile: 'map.png',
    imageAlt: 'location',
  },
  'about/index.html': {
    title: 'About',
    actors: [
      {
        firstname: 'Walter',
        lastname: 'White, "Heisenberg"',
      },
      {
        firstname: 'Jesse',
        lastname: 'Pinkman',
      },
    ],
  },
};

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: 'src/views/pages/home/index.html',
    about: 'src/views/pages/about/index.html',
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, 'src/assets/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          preprocessor: (content, { resource }) => Nunjucks.renderString(content, findData(resource, entryData)),
        },
      },
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpe?g|webp|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
