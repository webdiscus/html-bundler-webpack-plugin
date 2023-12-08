/**
 * Find the root issuer of a resource.
 *
 * @param {Compilation} compilation
 * @param {string} resource
 * @return {string|undefined}
 */
const findRootIssuer = (compilation, resource) => {
  const moduleMap = compilation.moduleGraph._moduleMap;
  const modules = moduleMap.keys();
  const [resourceFile] = resource.split('?', 1);
  let current;
  let parent;

  for (let module of modules) {
    // skip non normal modules, e.g. runtime
    if (!module.resource) continue;

    const [file] = module.resource.split('?', 1);
    if (file === resourceFile) {
      current = module;
      break;
    }
  }

  if (current) {
    while ((parent = moduleMap.get(current).issuer)) {
      current = parent;
    }
  }

  return current && current.resource !== resource ? current.resource : undefined;
};

module.exports = { findRootIssuer };
