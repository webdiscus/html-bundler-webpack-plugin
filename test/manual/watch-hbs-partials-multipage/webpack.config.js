const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  //mode: 'production',
  mode: 'development',
  //stats: 'minimal',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      verbose: true,

      // TODO: test separate with filesystem cache
      // cache: {
      //   type: 'filesystem',
      // },

      // issue: https://github.com/webdiscus/html-bundler-webpack-plugin/issues/127
      // TODO: fix watch changes in partials
      //   - in production mode all changes works fine
      //   - in development mode changes works only in entry template and in a partial only after 1st change
      //   - changes anywhere works only for last entry
      entry: [
        {
          import: 'src/views/home.hbs',
          filename: 'index.html',
        },
        {
          import: 'src/views/about.hbs',
          filename: 'about.html',
        },
        {
          import: 'src/views/contact.hbs',
          filename: 'contact.html',
        },
      ],

      js: {
        filename: 'js/[name].[contenthash:8].js',
      },

      preprocessor: 'handlebars',
      preprocessorOptions: {
        partials: ['src/views/partials'],
      },

      hotUpdate: true,
    }),
  ],

  // enable live reload
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    watchFiles: {
      paths: ['src/**/*.*', 'data-global.json'],
      options: {
        usePolling: true,
      },
    },
  },
};
