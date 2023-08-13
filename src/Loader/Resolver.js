const path = require('path');
// the 'enhanced-resolve' package already used in webpack, don't need to define it in package.json
const ResolverFactory = require('enhanced-resolve');

const Options = require('./Options');
const PluginService = require('../Plugin/PluginService');
const Snapshot = require('../Plugin/Snapshot');
const { resolveException } = require('./Messages/Exeptions');

class Resolver {
  static aliasRegexp = /^([~@])?(.*?)(?=\/)/;
  static aliasFileRegexp = /^([~@])?(.*?)$/;
  static hasAlias = false;
  static hasPlugins = false;
  static fs = null;

  /**
   * @param {Object} loaderContext
   */
  static init(loaderContext) {
    const options = Options.getWebpackResolve();

    this.fs = loaderContext.fs.fileSystem;
    this.loaderContext = loaderContext;
    this.rootContext = loaderContext.rootContext;
    this.basedir = Options.getBasedir();
    this.aliases = options.alias || {};
    this.hasAlias = Object.keys(this.aliases).length > 0;
    this.hasPlugins = options.plugins && Object.keys(options.plugins).length > 0;

    // resolver for scripts from the 'script' tag, npm modules, and other js files
    this.resolveScript = ResolverFactory.create.sync({
      ...options,
      preferRelative: options.preferRelative !== false,
      // resolve 'exports' field in package.json, default value is: ['webpack', 'production', 'browser']
      conditionNames: ['require', 'node'],
      // restrict default extensions list '.js', '.json', '.wasm' for faster resolving of script files
      extensions: options.extensions.length ? options.extensions : ['.js'],
    });

    this.resolveStyle = ResolverFactory.create.sync({
      ...options,
      preferRelative: options.preferRelative !== false,
      byDependency: {},
      conditionNames: ['style', 'sass'],
      // firstly, try to resolve 'browser' or 'style' fields in package.json to get compiled CSS bundle of a module,
      // e.g. bootstrap has the 'style' field, but material-icons has the 'browser' field for resolving the CSS file;
      // if a module has not a client specified field, then must be used path to client file of the module,
      // like `module-name/dist/bundle.css`
      mainFields: ['style', 'browser', 'sass', 'main'],
      mainFiles: ['_index', 'index'],
      extensions: ['.scss', '.sass', '.css'],
      restrictions: this.getStyleResolveRestrictions(),
    });

    // resolver for resources: images, fonts, etc.
    this.resolveFile = ResolverFactory.create.sync({
      ...options,
      preferRelative: options.preferRelative !== false,
      // resolve 'exports' field in package.json, default value is: ['webpack', 'production', 'browser']
      conditionNames: ['require', 'node'],
      // remove extensions for faster resolving of files different from styles and scripts
      extensions: [],
    });

    // const resolveFileAsync = loaderContext.getResolve({
    //   ...options,
    //   preferRelative: options.preferRelative !== false,
    //   // resolve 'exports' field in package.json, default value is ['webpack', 'production', 'browser']
    //   conditionNames: ['require', 'node'],
    //   // restrict default extensions list '.js', '.json', '.wasm' for faster resolving
    //   extensions: options.extensions.length ? options.extensions : ['.js'],
    // });

    //this.resolveFile = async (context, request) => await resolveFileAsync(context, request);

    // resolver for styles from the 'link' tag
    // const resolveStyleAsync = loaderContext.getResolve({
    //   ...options,
    //   preferRelative: options.preferRelative !== false,
    //   byDependency: {},
    //   conditionNames: ['style', 'sass'],
    //   // firstly try to resolve 'browser' or 'style' fields in package.json to get compiled CSS bundle of a module,
    //   // e.g. bootstrap has the 'style' field, but material-icons has the 'browser' field for resolving the CSS file;
    //   // if a module has not a client specified field, then must be used path to client file of the module,
    //   // like `module-name/dist/bundle.css`
    //   mainFields: ['style', 'browser', 'sass', 'main'],
    //   mainFiles: ['_index', 'index'],
    //   extensions: ['.scss', '.sass', '.css'],
    //   restrictions: this.getStyleResolveRestrictions(),
    // });
    //this.resolveStyle = async (context, request) => await resolveStyleAsync(context, request);
  }

  /**
   * Return a list of resolve restrictions to restrict the paths that a request can be resolved on.
   * @see https://webpack.js.org/configuration/resolve/#resolverestrictions
   * @return {Array<RegExp|string>}
   */
  static getStyleResolveRestrictions() {
    const restrictions = PluginService.getOptions().getCss().test;

    return Array.isArray(restrictions) ? restrictions : [restrictions];
  }

  /**
   * Resolve the request.
   *
   * @param {string} request The request to resolve.
   * @param {string} issuer The issuer of resource.
   * @param {string} [type = 'default'] The require type: 'default', 'script', 'style'.
   * @return {string}
   */
  static resolve(request, issuer, type = 'default') {
    const fs = this.fs;
    const [issuerFile] = issuer.split('?', 1);
    const context = path.dirname(issuerFile);
    const isScript = type === 'script';
    const isStyle = type === 'style';
    let isAliasArray = false;
    let resolvedRequest = null;

    // resolve an absolute path by prepending options.basedir
    if (request[0] === '/') {
      resolvedRequest = path.join(this.basedir, request);
    }

    // resolve a relative file
    if (resolvedRequest == null && request[0] === '.') {
      resolvedRequest = path.join(context, request);
    }

    // resolve a file by webpack `resolve.alias`
    if (resolvedRequest == null) {
      resolvedRequest = this.resolveAlias(request);
      isAliasArray = Array.isArray(resolvedRequest);
    }

    // fallback to enhanced resolver
    if (resolvedRequest == null || isAliasArray) {
      let normalizedRequest = request;
      // remove optional prefix in request for enhanced resolver
      if (isAliasArray) normalizedRequest = this.removeAliasPrefix(normalizedRequest);

      try {
        resolvedRequest = isScript
          ? this.resolveScript(context, normalizedRequest)
          : isStyle
          ? this.resolveStyle(context, normalizedRequest)
          : this.resolveFile(context, normalizedRequest);
      } catch (error) {
        if (isScript) {
          // extract important ending of filename from the request
          // app.js => app.js
          // @alias/app.js => app.js
          // @alias/path/to/app.js => path/to/app.js
          // TODO: fix limitation, when a request is like `../../app.js` and used an array of aliases in the tsconfig

          let [requestFile] = normalizedRequest.split('?', 1);
          let beginPos = requestFile.indexOf('/');

          if (beginPos > 0) requestFile = requestFile.slice(beginPos);

          Snapshot.addMissingFile(issuer, requestFile);
        }

        resolveException(error, request, path.relative(this.rootContext, issuer));
      }
    }

    if (isScript) {
      resolvedRequest = this.resolveScriptExtension(resolvedRequest);
    }

    // request of the svg file can contain a fragment id, e.g., shapes.svg#circle
    const separator = resolvedRequest.indexOf('#') > 0 ? '#' : '?';
    const [resolvedFile] = resolvedRequest.split(separator, 1);

    if (!fs.existsSync(resolvedFile)) {
      if (isScript) {
        Snapshot.addMissingFile(issuer, resolvedFile);
      }

      const error = new Error(`Can't resolve '${request}' in '${context}'`);
      resolveException(error, request, path.relative(this.rootContext, issuer));
    }

    return resolvedRequest;
  }

  /**
   * Resolve script request w/o the extension.
   * The extension must be resolved to generate a correct unique JS filename in the plugin.
   * For example, `vendor.min?key=val` resolve to `vendor.min.js?key=val`.
   *
   * @param {string} request The request of script.
   * @return {string}
   */
  static resolveScriptExtension(request) {
    const [file, query] = request.split('?');
    // TODO: get resolve extension from webpack config `resolve.extensions` and merge with the default (js|ts)

    const scriptExtensionRegexp = /\.(js|ts)$/;
    const resolvedFile = scriptExtensionRegexp.test(file) ? file : require.resolve(file);

    return query ? resolvedFile + '?' + query : resolvedFile;
  }

  /**
   * Resolve an alias in the argument of require() function.
   *
   * @param {string} request The value of extends/include/require().
   * @return {string | [] | null} If found an alias return the resolved normalized path otherwise return null.
   * @private
   */
  static resolveAlias(request) {
    if (this.hasAlias === false) return null;

    const fs = this.fs;
    const hasPath = request.indexOf('/') > -1;
    const aliasRegexp = hasPath ? this.aliasRegexp : this.aliasFileRegexp;
    const [, prefix, aliasName] = aliasRegexp.exec(request) || [];
    if (!prefix && !aliasName) return null;

    let alias = (prefix || '') + (aliasName || '');
    let aliasPath = this.aliases[alias] || this.aliases[aliasName];
    let resolvedFile = aliasPath;

    if (typeof aliasPath === 'string') {
      let paths = [aliasPath, request.slice(alias.length)];
      if (!fs.existsSync(aliasPath)) {
        paths.unshift(this.basedir);
      }
      resolvedFile = path.join(...paths);
    }

    return resolvedFile;
  }

  /**
   * @param {string} request
   * @return {string}
   */
  static removeAliasPrefix(request) {
    const [, prefix, aliasName] = this.aliasRegexp.exec(request) || [];
    const alias = (prefix || '') + (aliasName || '');

    return prefix != null && aliasName != null && this.aliases[alias] == null ? request.slice(1) : request;
  }
}

module.exports = Resolver;
