const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  mode: 'production',

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../test/fixtures/images'),
      '@styles': path.join(__dirname, 'src/assets/styles/'),
      '@scripts': path.join(__dirname, 'src/assets/scripts/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/index.html',
      },
      js: {
        filename: 'js/[name].bundle.js',
      },
      css: {
        filename: 'css/[name].bundle.css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      {
        test: /\.(png|jpe?g|ico|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:6][ext]',
        },
        use: [
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              minimizer: {
                // resize works only with `sharpMinify`
                implementation: ImageMinimizerPlugin.sharpMinify,
                options: {
                  encodeOptions: {
                    jpeg: {
                      // https://sharp.pixelplumbing.com/api-output#jpeg
                      quality: 100,
                    },
                    webp: {
                      // https://sharp.pixelplumbing.com/api-output#webp
                      lossless: true,
                    },
                    avif: {
                      // https://sharp.pixelplumbing.com/api-output#avif
                      lossless: true,
                    },

                    // png by default sets the quality to 100%, which is same as lossless
                    // https://sharp.pixelplumbing.com/api-output#png
                    png: {},
                  },
                },
              },
            },
          },
        ],
      },
    ],
  },

  // optimization: {
  //   minimizer: [
  //     '...',
  //     new ImageMinimizerPlugin({
  //       minimizer: {
  //         // resize works only with `sharpMinify`
  //         implementation: ImageMinimizerPlugin.imageminMinify,
  //         options: {
  //           plugins: ['imagemin-mozjpeg', 'imagemin-pngquant', 'imagemin-svgo'],
  //         },
  //       },
  //     }),
  //   ],
  // },

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
