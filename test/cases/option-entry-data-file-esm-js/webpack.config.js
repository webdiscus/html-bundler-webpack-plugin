import HtmlBundlerPlugin from '@test/html-bundler-webpack-plugin';

const config = {
  mode: 'production',

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: 'src/index.html',
          data: 'src/data.js', // test: ESM .js file
        },
      },
      //data: 'src/data.js',
    }),
  ],
};

export default config;
