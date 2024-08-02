const path = require('path');

class UrlDependency {
  fs = null;
  moduleGraph = null;
  resolver = null;

  /**
   * @param {Resolver} resolver
   */
  constructor({ resolver }) {
    this.resolver = resolver;
  }

  /**
   * @param {Compilation} compilation
   * @param {FileSystem} fs
   */
  init({ compilation, fs }) {
    this.fs = fs;
    this.moduleGraph = compilation.moduleGraph;
  }

  /**
   * Resolves relative URL and URL in node_modules.
   *
   * @param {{}} resolveData The callback parameter for the hooks beforeResolve of NormalModuleFactory.
   */
  resolve(resolveData) {
    const fs = this.fs;
    const rawRequest = resolveData.request;
    const [file, query] = rawRequest.split('?');
    const resource = path.resolve(resolveData.context, file);

    if (!fs.existsSync(resource)) {
      const dependency = resolveData.dependencies[0];
      const parentModule = this.moduleGraph.getParentModule(dependency);
      const sourceFile = this.resolveInSnapshot(parentModule.buildInfo.snapshot, file);

      if (sourceFile != null) {
        const issuer = resolveData.contextInfo.issuer;

        resolveData.request = query ? sourceFile + '?' + query : sourceFile;
        this.resolver.addSourceFile(resolveData.request, rawRequest, issuer);
      }
    }
  }

  /**
   * @param {Snapshot} snapshot The Webpack snapshot.
   * @param {string} resource The resource file, including a query, to be resolved.
   * @return {null|{file: string, context: string}}
   */
  resolveInSnapshot(snapshot, resource) {
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
          // skip the directory that is already checked, and the resource was not resolved in this directory
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
