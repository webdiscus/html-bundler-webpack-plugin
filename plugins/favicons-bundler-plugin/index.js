const fs = require('fs/promises');
const path = require('path');
const HtmlBundlerPlugin = require('../../src/');
const { favicons, config } = require('favicons');

class FaviconsBundlerPlugin {
  pluginName = 'favicons-bundler-plugin';

  /** {FaviconResponse} */
  faviconResponse = null;

  /** {string} The source favicon file. */
  faviconFile = '';

  /**
   * The key is the source HTML file, where was found the original `faviconFile` parsed in the `faviconTag`.
   * The `faviconFile` is the source file of the parsed favicon file.
   * The `faviconTag` is a link tag string, used as a placeholder which will be replaced with the generated favicon tags.
   *
   * @type {Map<string, {faviconFile: string, faviconTag: string}>}
   */
  pages = new Map();

  /**
   * @param {{}} options
   */
  constructor(options = {}) {
    this.options = options;
    // favicons configuration options, see https://github.com/itgalaxy/favicons#usage
    this.options.faviconsConfig = { ...config, ...(options.faviconOptions || {}) };
  }

  apply(compiler) {
    const enabled = HtmlBundlerPlugin.option.toBool(this.options?.enabled, true, 'auto');

    if (!enabled) {
      return;
    }

    const { pluginName } = this;
    const { webpack } = compiler;
    const { Compilation } = webpack;

    this.fs = compiler.inputFileSystem.fileSystem;
    this.webpack = webpack;
    const { RawSource } = this.webpack.sources;

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      const hooks = HtmlBundlerPlugin.getHooks(compilation);

      // get favicon source file
      hooks.resolveSource.tap(pluginName, (source, info) => {
        const { tag, attribute, resolvedFile, value, issuer } = info;

        if (tag === 'link' && attribute === 'href' && source.includes('rel="icon"')) {
          // use the first founded icon file as favicon file
          if (!this.faviconFile) {
            this.faviconFile = resolvedFile;
          }

          this.pages.set(issuer, {
            faviconFile: resolvedFile,
            faviconTag: source,
          });

          // disable processing in webpack, keep original value
          return value;
        }
      });

      // get favicons response
      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        () => {
          if (!this.faviconFile) {
            return Promise.resolve();
          }

          return favicons(this.faviconFile, this.options.faviconsConfig).then((response) => {
            response.html = response?.html.sort().join('\n');
            this.faviconResponse = response;

            // save favicon manifest files on disk
            response.files.forEach(({ name, contents }) => {
              compilation.emitAsset(name, new RawSource(contents));
            });
          });
        }
      );

      // injection generated favicon tags into html
      // the usage example of the sync hook, sync hook must return a string
      hooks.postprocess.tap(pluginName, (content, info) => {
        const page = this.pages.get(info.sourceFile);

        if (page && this.faviconResponse) {
          content = content.replace(page.faviconTag, this.faviconResponse.html);
        }

        return content;
      });

      // injection generated favicon tags into html
      // the usage example of the async hook, async hook must return a promise
      // hooks.postprocess.tapPromise(pluginName, (content, info) => {
      //   const page = this.pages.get(info.sourceFile);
      //
      //   if (page && this.faviconResponse) {
      //     content = content.replace(page.faviconTag, this.faviconResponse.html);
      //   }
      //
      //   return Promise.resolve(content);
      // });
    });

    // save favicon images on disk
    compiler.hooks.afterEmit.tapPromise(pluginName, () => {
      if (this.faviconResponse?.images.length > 0) {
        const { images } = this.faviconResponse;
        const outputPath = HtmlBundlerPlugin.option.getWebpackOutputPath();
        const saveDir = path.join(outputPath, this.options.faviconsConfig.path);

        return fs
          .mkdir(saveDir, { recursive: true })
          .then(() =>
            Promise.all(images.map(async (image) => await fs.writeFile(path.join(saveDir, image.name), image.contents)))
          );
      }
    });
  }
}

module.exports = FaviconsBundlerPlugin;
