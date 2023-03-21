const path = require('path');
const Resolver = require('./Resolver');

class UrlDependency {
  static fs = null;
  static compilation = null;

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
