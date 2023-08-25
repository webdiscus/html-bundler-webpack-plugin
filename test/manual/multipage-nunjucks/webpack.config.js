const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

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
    new HtmlBundlerPlugin({
      verbose: 'auto',
      //minify: 'auto',

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
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },

      preload: [
        {
          test: /\.(s?css|less)$/,
          as: 'style',
        },
        {
          test: /\.(js|ts)$/,
          as: 'script',
        },
        {
          test: /\.(png|jpe?g|webp|svg)$/,
          as: 'image',
        },
        {
          //test: /\.(eot|ttf|woff2?)$/, // preload all variants of fonts
          test: /\.woff2$/, // preload only modern fonts
          as: 'font',
          attributes: { crossorigin: true }, // note: font preloading requires the crossorigin attribute to be set
        },
      ],

      loaderOptions: {
        preprocessor: 'nunjucks',
        preprocessorOptions: {
          // extra test watching when several template directories are not subdirectories, but are on the same level
          // define this directories in `devServer.watchFiles.paths` too
          views: ['src/views/layouts/', 'templates/includes/'],
        },
      },
    }),
  ],

  module: {
    rules: [
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

      {
        test: /\.(html|njk)$/,
        use: [
          {
            loader: HtmlBundlerPlugin.loader,
            options: {
              preprocessor: 'nunjucks',
            },
          },
        ],
      },

      // test: define unused loader
      {
        test: /\.hbs$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          preprocessor: 'handlebars',
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

    compress: true,

    // enable CORS for fonts
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },

    // enable live reload
    watchFiles: {
      paths: ['src/**/*.*', 'templates/**/*.*'],
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
