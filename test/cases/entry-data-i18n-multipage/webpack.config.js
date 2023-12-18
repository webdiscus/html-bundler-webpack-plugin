const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

const languages = {
  'de-DE': require('./src/locales/de-DE.json'),
  'en-GB': require('./src/locales/en-GB.json'),
};

module.exports = {
  mode: 'production',
  output: {
    path: path.join(__dirname, '/dist'),
  },
  plugins: [
    new HtmlBundlerPlugin({
      // define templates here
      // you can generate this `entry` object instead of multiple configurations for HtmlWebpackPlugin
      entry: {
        index: {
          import: './src/template.html',
          data: {
            title: languages['en-GB'].title,
            i18n: languages['en-GB'],
            // pass data into inline JS, that are accessible from a JS file
            locales: JSON.stringify(languages['en-GB']),
          },
        },
        'de/index': {
          import: './src/template.html',
          data: {
            title: languages['de-DE'].title,
            i18n: languages['de-DE'],
            // pass data into inline JS, that are accessible from a JS file
            locales: JSON.stringify(languages['de-DE']),
          },
        },
      },
    }),
  ],
};
