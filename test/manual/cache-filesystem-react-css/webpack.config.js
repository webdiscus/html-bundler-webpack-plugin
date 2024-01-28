const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',
  //mode: 'production',
  //stats: 'minimal',
  stats: 'errors-warnings',
  // stats: {
  //   all: true,
  // },

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
        index: {
          import: './src/home.html',
          data: {
            title: 'Home',
            getTitle: () => 'Generated title', // test a data prop as a function
          },
        },
      },
      js: {
        filename: 'js/[name].bundle.js',
        //inline: true,
      },
      css: {
        filename: 'css/[name].bundle.css',
      },
      //minify: true,
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
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.(png|jpe?g|webp|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },

      // test 2nd `npm start` for asset module with cache.type 'filesystem'
      {
        test: /\.svg$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 1024,
          },
        },
      },
    ],
  },

  // test cache.type 'filesystem'
  cache: {
    //type: 'memory',
    type: 'filesystem',
    cacheDirectory: path.join(__dirname, '.cache'),
  },

  // enable live reload
  devServer: {
    //hot: false,
    static: path.join(__dirname, 'dist'),
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
