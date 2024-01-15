const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        home: './src/views/home.html',
      },
      outputPath: 'html/', // html path relative by `dist/`
      js: {
        filename: 'static/[name]-[contenthash:8].js',
      },
      css: {
        filename: 'static/[name]-[contenthash:8].css',
      },
      beforeEmit: (content, { assetFile }, compilation) => {
        const { RawSource } = compilation.compiler.webpack.sources;

        // remove the prefix in CSS files used in the HTML
        for (let filename in compilation.assets) {
          // skip not css files
          if (!/\.(css)$/.test(filename)) continue;

          let assetContent = compilation.assets[filename].source();
          assetContent = assetContent.replaceAll('/static/', '/');
          compilation.updateAsset(filename, new RawSource(assetContent));

          //console.log('>>: ', { filename }, assetContent);
        }

        // remove the prefix in the generated HTML
        return content.replaceAll('="/static/', '="/');
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: ['css-loader'],
      },
      {
        test: /\.(png|jpe?g|webp|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
