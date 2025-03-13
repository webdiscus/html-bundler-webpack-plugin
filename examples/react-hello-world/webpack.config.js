const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',
  //stats: 'errors-warnings',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // add here your pages
        index: './src/index.html', // => dist/index.html
      },

      js: {
        // output JS
        filename: 'js/[name].[contenthash:8].js',
      },

      css: {
        // output CSS
        filename: 'css/[name].[contenthash:8].css',
        //hot: true, // <= enable hot replacement, works only when scss is imported in JS
      },
    }),
  ],

  module: {
    rules: [
      // compile to JS
      {
        test: /\.(m?js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [['@babel/preset-react']],
          },
        },
      },
      // compile to CSS
      {
        test: /\.(scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      // handles images
      {
        test: /\.(ico|png|jpe?g|svg)/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },

  performance: {
    hints: false, // disable the size limit warning
  },

  cache: {
    type: 'memory',
    // test filesystem cache
    // type: 'filesystem',
    // cacheDirectory: path.join(__dirname, '.cache'),
  },

  // enable live reload
  devServer: {
    //liveReload: false, // <= disable reloading to allow hot replacement
    static: path.join(__dirname, 'dist'),
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
