const path = require('path');
const { yellow, cyan, black } = require('ansis/colors');
const { pluginName } = require('../config');
const Resolver = require('./Resolver');

class UrlDependency {
  static fs = null;
  static compilation = null;
  static maxDependencyDeep = 256;
  static dependencyDeep = 0;

  /**
   * @param {fs: FileSystem} fs
   * @param {compilation: Compilation} compilation
   */
  static init({ fs, moduleGraph }) {
    this.fs = fs;
    this.moduleGraph = moduleGraph;
  }

  /**
   * Resolves relative URL and URL in node_modules.
   *
   * @param {{}} resolveData The callback parameter for the hooks beforeResolve of NormalModuleFactory.
   */
  static resolve(resolveData) {
    const fs = this.fs;
    const [resource, query] = resolveData.request.split('?');

    if (!fs.existsSync(path.resolve(resolveData.context, resource))) {
      this.dependencyDeep = 0;
      const dependency = resolveData.dependencies[0];
      const parentModule = this.moduleGraph.getParentModule(dependency);
      const sourceFile = this.resolveInSnapshot(parentModule.buildInfo.snapshot, resource);

      if (sourceFile != null) {
        const resolvedRequest = query ? sourceFile + '?' + query : sourceFile;
        const rawRequest = resolveData.request;
        const issuer = resolveData.contextInfo.issuer;

        resolveData.request = resolvedRequest;
        dependency.request = resolvedRequest;
        dependency.userRequest = resolvedRequest;

        Resolver.addSourceFile(resolvedRequest, rawRequest, issuer);
      }
    }
  }

  /**
   * @param {Snapshot} snapshot The Webpack snapshot.
   * @param {string} resource The file to be resolved.
   * @return {null|{file: string, context: string}}
   */
  static resolveInSnapshot(snapshot, resource) {
    const fs = this.fs;
    const cache = new Set();
    let files = [];
    let context, file, dependency;

    // fileTimestamps is filled when started webpack dev server
    if (snapshot.hasFileTimestamps()) files.push(...snapshot.fileTimestamps.keys());
    // fileTshs is filled when webpack builds
    if (snapshot.hasFileTshs()) files.push(...snapshot.fileTshs.keys());
    // should be clarified when fileHashes is filled
    if (snapshot.hasFileHashes()) files.push(...snapshot.fileHashes.keys());
    // managedFiles is filled by import from node modules
    if (snapshot.hasManagedFiles()) files.push(...snapshot.managedFiles);

    for (dependency of files) {
      // whether is dependency file
      if (!!path.extname(dependency)) {
        context = path.dirname(dependency);
        if (cache.has(context)) {
          // skip directory that is already checked and the resource was not resolved in this directory
          continue;
        }

        file = path.resolve(context, resource);
        if (fs.existsSync(file)) {
          return file;
        }
        cache.add(context);
      }
    }

    if (snapshot.hasChildren()) {
      // paranoid check for possible nested style imports, in real project should never be reached
      if (++this.dependencyDeep > this.maxDependencyDeep) {
        throw new Error(
          `\n${black.bgRedBright`[${pluginName}]`} Max ${yellow(
            this.maxDependencyDeep.toString()
          )} nesting by resolving is reached.\nPlease use an alias to resolve the ${cyan(resource)} url in style.`
        );
      }

      let snapshotChild, result;
      for (snapshotChild of snapshot.children) {
        result = this.resolveInSnapshot(snapshotChild, resource);
        if (result != null) {
          return result;
        }
      }
    }

    return null;
  }
}

module.exports = UrlDependency;
