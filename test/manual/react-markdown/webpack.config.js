const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  //mode: 'production',
  mode: 'development',
  //stats: 'normal',
  stats: 'errors-warnings',
  //devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },

      js: {
        filename: 'js/[name].[contenthash:8].js',
        // BUG: When using React Markdown in the `development` mode, and JS is inlined, webpack occur an error
        //inline: true,
      },

      //verbose: true,
    }),
  ],

  module: {
    rules: [
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
    static: path.join(__dirname, 'dist'),
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
