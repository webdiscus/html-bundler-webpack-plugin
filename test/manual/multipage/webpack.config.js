const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const Nunjucks = require('nunjucks');

const isDev = true;
module.exports = {
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'inline-source-map' : 'source-map',
  stats: 'minimal',

  output: {
    path: path.join(__dirname, 'dist'),
  },

  resolve: {
    // aliases used in sources
    alias: {
      '@views': path.join(__dirname, 'src/views/'),
      '@images': path.join(__dirname, 'src/assets/images/'),
      '@fonts': path.join(__dirname, 'src/assets/fonts/'),
      '@styles': path.join(__dirname, 'src/assets/styles/'),
      '@scripts': path.join(__dirname, 'src/assets/scripts/'),
    },
  },

  plugins: [
    // enable processing of Pug files from entry
    new HtmlBundlerPlugin({
      //verbose: isDev, // output information about the process to console

      entry: {
        // define HTML templates here
        index: 'src/views/pages/home/index.html', // => dist/index.html
        demo: {
          import: 'src/views/pages/demo/index.html', // => dist/demo.html
          data: {
            // pass data into template
            myVar: 'The string passed as the `myVar` variable from Webpack configuration.',
          },
        },
        about: 'src/views/pages/about/index.html', // => dist/about.html
        404: './src/views/pages/404/index.html', // => dist/404.html
      },

      js: {
        // output filename of extracted JS from source script loaded in HTML via `<script>` tag
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of extracted CSS from source style loaded in HTML via `<link>` tag
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      // enable processing of HTML files from entry
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader, // HTML template loader
        options: {
          // render template with page-specific variables defined in entry
          preprocessor: (content, { data }) => Nunjucks.renderString(content, data),
        },
      },

      // styles
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      // fonts
      {
        test: /\.(woff(2)?|ttf|otf|eot|svg)$/,
        type: 'asset/resource',
        include: /fonts|node_modules/, // load fonts from `fonts` or `node_modules` directory only
        generator: {
          // group fonts by name
          filename: (pathData) => `assets/fonts/${path.basename(path.dirname(pathData.filename))}/[name][ext][query]`,
        },
      },

      // images
      {
        test: /\.(png|jpe?g|svg|webp|ico)$/i,
        include: /images/, // load images from `images` directory only
        oneOf: [
          // inline image using `?inline` query
          {
            resourceQuery: /inline/,
            type: 'asset/inline',
          },
          // auto inline by image size
          {
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 1024,
              },
            },
            generator: {
              filename: 'assets/img/[name].[hash:8][ext]',
            },
          },
        ],
      },
    ],
  },

  devServer: {
    static: {
      directory: path.join(__dirname, './dist'),
    },

    //open: true,

    //open: true,
    compress: true,

    // enable HMR
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },

    // rewrite rules
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/index.html' },
        { from: /./, to: '/404.html' },
      ],
    },
  },
};
