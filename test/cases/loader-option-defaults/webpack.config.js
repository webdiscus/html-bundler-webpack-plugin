const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: './src/index.html',
          data: {
            title: 'Home',
            headline: 'Breaking Bad',
            name: {
              firstname: 'Walter',
              lastname: 'White',
            },
          },
        },
      },
    }),
  ],

  // Test the default loader.
  // If the `HtmlBundlerPlugin.loader` loader is not defined in Webpack `module.rule`,
  // then the loader will be added:

  // module: {
  //   rules: [
  //     {
  //       test: /\.(html)$/,
  //       loader: HtmlBundlerPlugin.loader,
  //     },
  //   ],
  // },
};
