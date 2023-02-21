const Eta = require('eta');

/**
 * @typedef OptionSources
 * @property {string} tag
 * @property {Array<string>?} attributes
 * @property {Function?} filter
 */

class Options {
  static isInit = false;
  static defaultWatchFiles = [/\.(html|js.{0,2}|.?js|ts.?|md|txt)$/i];

  static init(loaderContext) {
    const { rootContext } = loaderContext;
    const options = loaderContext.getOptions() || {};

    this.webpackOptions = loaderContext._compiler.options || {};
    this.options = options;
    this.rootContext = rootContext;

    // init basedir
    let { basedir } = options;
    if (!basedir) basedir = rootContext;
    if (basedir.slice(-1) !== '/') basedir += '/';
    this.options.basedir = basedir;

    this.initWatchFiles();

    // it must be at the last position
    this.isInit = true;
  }

  // TODO: manual test with serve and add info in readme
  static initWatchFiles() {
    let watchFiles = this.options.watchFiles;
    this.watchFiles = [...this.defaultWatchFiles];

    //if (this.isInit && watchFiles) return;

    if (watchFiles != null) {
      if (!Array.isArray(watchFiles)) watchFiles = [watchFiles];

      for (let item of watchFiles) {
        if (item.constructor.name !== 'RegExp') {
          item = new RegExp(item);
        }
        this.watchFiles.push(item);
      }
    }
  }

  /**
   * Returns original loader options.
   *
   * @return {{}}
   */
  static get() {
    return this.options;
  }

  /**
   * Returns the root directory for the paths in template starting with `/`.
   * @return {string}
   */
  static getBasedir() {
    return this.options.basedir;
  }

  /**
   * Returns the list of tags and attributes where source files should be resolved.
   *
   * @return {Array<OptionSources>|false}
   */
  static getSources = () => {
    const { sources } = this.options;

    if (sources === false) return false;

    // default tags and attributes for resolving resources
    const defaultSources = [
      { tag: 'link', attributes: ['href', 'imagesrcset'] }, // 'imagesrcset' if rel="preload" and as="image"
      { tag: 'script', attributes: ['src'] },
      { tag: 'img', attributes: ['src', 'srcset'] },
      { tag: 'image', attributes: ['href'] }, // <svg><image href="image.png"></image></svg>
      { tag: 'use', attributes: ['href'] }, // <svg><use href="icons.svg#home"></use></svg>
      { tag: 'input', attributes: ['src'] }, // type="image"
      { tag: 'source', attributes: ['src', 'srcset'] },
      { tag: 'audio', attributes: ['src'] },
      { tag: 'track', attributes: ['src'] },
      { tag: 'video', attributes: ['src', 'poster'] },
      { tag: 'object', attributes: ['data'] },
    ];

    if (!Array.isArray(sources)) return defaultSources;

    for (const item of sources) {
      const source = defaultSources.find(({ tag }) => tag === item.tag);
      if (source) {
        if (item.attributes) {
          for (let attr of item.attributes) {
            // add only unique attributes
            if (source.attributes.indexOf(attr) < 0) source.attributes.push(attr);
          }
        }
        if (typeof item.filter === 'function') {
          source.filter = item.filter;
        }
      } else {
        defaultSources.push(item);
      }
    }

    return defaultSources;
  };

  /**
   * Returns preprocessor.
   * Note: the default preprocessor use the Eta templating engine.
   *
   * @return {null|(function(string, {data?: {}}): Promise|string)}
   */
  static getPreprocessor() {
    if (typeof this.options.preprocessor === 'function') {
      return this.options.preprocessor;
    }

    if (this.options.preprocessor !== false) {
      const config = {
        // defaults async is false, because the `includeFile()` function is sync,
        // wenn async is true then must be used `await includeFile()`
        async: false,
        useWith: true, // to use data in template without `it.` scope
        root: process.cwd(),
      };

      return (template, { data = {} }) => Eta.render(template, data, config);
    }

    return null;
  }

  static getWatchFiles() {
    return this.watchFiles;
  }

  static getWebpackResolve() {
    return this.webpackOptions.resolve || {};
  }
}

module.exports = Options;
