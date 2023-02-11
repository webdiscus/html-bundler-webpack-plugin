const fs = require('fs');
const path = require('path');
// the 'enhanced-resolve' package already used in webpack, don't need to define it in package.json
const ResolverFactory = require('enhanced-resolve');
const Dependency = require('./Dependency');
const PluginService = require('../Plugin/PluginService');
const { isWin, pathToPosix } = require('./Utils');
const { resolveException } = require('./Messages/Exeptions');

class Resolver {
  static aliasRegexp = /^([~@])?(.*?)(?=\/)/;
  static aliasFileRegexp = /^([~@])?(.*?)$/;
  static hasAlias = false;
  static hasPlugins = false;

  /**
   * @param {string} basedir The the root directory of absolute paths.
   * @param {{}} options The webpack `resolve` options.
   */
  static init({ basedir, options }) {
    this.basedir = basedir;
    this.aliases = options.alias || {};
    this.hasAlias = Object.keys(this.aliases).length > 0;
    this.hasPlugins = options.plugins && Object.keys(options.plugins).length > 0;

    // resolver for scripts from the 'script' tag, npm modules and other js files
    this.resolveFile = ResolverFactory.create.sync({
      ...options,
      preferRelative: options.preferRelative !== false,
      // resolve 'exports' field in package.json, default value is ['webpack', 'production', 'browser']
      conditionNames: ['require', 'node'],
      // restrict default extensions list '.js', '.json', '.wasm' for faster resolving
      extensions: options.extensions.length ? options.extensions : ['.js'],
    });

    // resolver for styles from the 'link' tag
    this.resolveStyle = ResolverFactory.create.sync({
      ...options,
      preferRelative: options.preferRelative !== false,
      byDependency: {},
      conditionNames: ['style', 'sass'],
      // firstly try to resolve 'browser' or 'style' fields in package.json to get compiled CSS bundle of a module,
      // e.g. bootstrap has the 'style' field, but material-icons has the 'browser' field for resolving the CSS file;
      // if a module has not a client specified field, then must be used path to client file of the module,
      // like `module-name/dist/bundle.css`
      mainFields: ['style', 'browser', 'sass', 'main'],
      mainFiles: ['_index', 'index'],
      extensions: ['.scss', '.sass', '.css'],
      restrictions: PluginService.getStyleRestrictions(),
    });
  }

  /**
   * Resolve filename.
   *
   * @param {string} file The file to resolve.
   * @param {string} templateFile The template file.
   * @param {string} [type = 'default'] The require type: 'default', 'script', 'style'.
   * @return {string}
   */
  static resolve(file, templateFile, type = 'default') {
    const context = path.dirname(templateFile);
    const isScript = type === 'script';
    const isStyle = type === 'style';
    let isAliasArray = false;
    let resolvedFile = null;

    // resolve an absolute path by prepending options.basedir
    if (file[0] === '/') {
      resolvedFile = path.join(this.basedir, file);
    }

    // resolve a relative file
    if (resolvedFile == null && file[0] === '.') {
      resolvedFile = path.join(context, file);
    }

    // resolve a file by webpack `resolve.alias`
    if (resolvedFile == null) {
      resolvedFile = this.resolveAlias(file);
      isAliasArray = Array.isArray(resolvedFile);
    }

    // fallback to enhanced resolver
    if (resolvedFile == null || isAliasArray) {
      let request = file;
      // remove optional prefix in request for enhanced resolver
      if (isAliasArray) request = this.removeAliasPrefix(request);

      try {
        resolvedFile = isStyle ? this.resolveStyle(context, request) : this.resolveFile(context, request);
      } catch (error) {
        resolveException(error, file, templateFile);
      }
    }

    if (isScript) {
      resolvedFile = this.resolveScriptExtension(resolvedFile);
    } else {
      Dependency.add(resolvedFile);
    }

    return isWin ? pathToPosix(resolvedFile) : resolvedFile;
  }

  /**
   * Resolve script request w/o extension.
   * The extension must be resolved to generate correct unique JS filename in the plugin.
   * For example: `vendor.min?key=val` resolve to `vendor.min.js?key=val`.
   *
   * @param {string} request The request of script.
   * @return {string}
   */
  static resolveScriptExtension(request) {
    const [resource, query] = request.split('?');
    const scriptExtensionRegexp = /\.(js|ts)$/;
    const resolvedFile = scriptExtensionRegexp.test(resource) ? resource : require.resolve(resource);

    return query ? resolvedFile + '?' + query : resolvedFile;
  }

  /**
   * Resolve an alias in the argument of require() function.
   *
   * @param {string} request The value of extends/include/require().
   * @return {string | [] | null} If found an alias return resolved normalized path otherwise return null.
   * @private
   */
  static resolveAlias(request) {
    if (this.hasAlias === false) return null;

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
