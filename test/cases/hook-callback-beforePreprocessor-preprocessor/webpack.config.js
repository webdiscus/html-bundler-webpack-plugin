const path = require('path');
const HtmlBundlerPlugin = require('../../../');

// custom sync preprocessor function
const render = (template, search, replacement) => template.replace(search, replacement);

// custom async preprocessor function
const renderAsync = async (template, search, replacement) => template.replace(search, replacement);

/**
 *
 * test        | beforePreprocessor HOOK | beforePreprocessor FUNC | preprocessor HOOK | preprocessor FUNC
 * ------------|-------------------------|-------------------------|-------------------|------------------
 * enabled      1 - ok;                   1 - ok                    1 - ok              1 - ok
 * enabled      1 - ok;                   0 - ok                    1 - ok              0 - ok
 * enabled      0 - ok;                   1 - ok                    0 - ok              1 - ok
 *
 * return       undefined - ok            undefined - ok            undefined - ok      undefined - ok
 */

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },

      css: {
        filename: '[name].[contenthash:8].css',
      },

      // calling order 2
      beforePreprocessor: (template) => {
        const search = '<!-- REPLACEME_beforePreprocessor_callback -->';
        const replacement = '<p>beforePreprocessor callback - OK</p>';

        //console.log('\n --> beforePreprocessor callback, calling order 2', { template });

        return render(template, search, replacement);
      },

      // calling order 4
      preprocessor: (template) => {
        const search = '<!-- REPLACEME_preprocessor_callback -->';
        const replacement = '<p>preprocessor callback - OK</p>';

        //console.log('\n --> preprocessor callback, calling order 4', { template });

        return render(template, search, replacement);
      },

      // test disable - OK
      //preprocessor: false,
    }),

    // custom plugin
    {
      apply(compiler) {
        const pluginName = 'myPlugin';
        compiler.hooks.compilation.tap(pluginName, (compilation) => {
          const hooks = HtmlBundlerPlugin.getHooks(compilation);

          // calling order 1
          hooks.beforePreprocessor.tap(pluginName, (template, { resourcePath }) => {
            const search = '<!-- REPLACEME_beforePreprocessor_hook -->';
            const replacement = '<p>beforePreprocessor hook - OK</p>';

            //console.log('\n --> beforePreprocessor hook, calling order 1', { resourcePath, template });

            return render(template, search, replacement);
          });

          // calling order 3
          // test tapPromise - OK
          hooks.preprocessor.tapPromise(
            pluginName,
            (template) =>
              new Promise((resolve) => {
                const search = '<!-- REPLACEME_preprocessor_hook -->';
                const replacement = '<p>preprocessor hook - OK</p>';
                const result = renderAsync(template, search, replacement);

                //console.log('\n --> preprocessor hook, calling order 3', { template });

                resolve(result);
              })
          );

          // test tap - OK
          // hooks.preprocessor.tap(pluginName, (template) => {
          //   const search = '<!-- REPLACEME_preprocessor_hook -->';
          //   const replacement = '<p>preprocessor hook - OK</p>';
          //
          //   console.log('\n --> preprocessor hook, calling order 3');
          //
          //   return render(template, search, replacement);
          // });
        });
      },
    },
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
    ],
  },
};
