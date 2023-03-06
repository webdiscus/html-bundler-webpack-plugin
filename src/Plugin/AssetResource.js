const AssetTrash = require('./AssetTrash');
const Resolver = require('./Resolver');

// supports for responsive-loader
const ResponsiveLoader = require('./Extras/ResponsiveLoader');

class AssetResource {
  /**
   * @param {Object} compiler The webpack compiler object.
   */
  static init(compiler) {
    // initialize responsible-loader module
    ResponsiveLoader.init(compiler);
  }

  /**
   * @param {Object} module The Webpack module.
   * @param {string} issuer The issuer of module resource.
   * @param {AssetEntryOptions} entryPoint The current entry point.
   */
  static render(module, issuer, entryPoint) {
    const { buildInfo, resource } = module;
    let assetFile = buildInfo.filename;
    // try to get asset file processed via responsive-loader
    const asset = ResponsiveLoader.getAsset(module, issuer);

    // resolve SVG filename with fragment, like './icons.svg#home'
    if (resource.indexOf('.svg#') > 0) {
      if (assetFile.indexOf('.svg#') > 0) {
        // fix save file name when filename in Webpack config is like '[name][ext][fragment]'
        const [file] = assetFile.split('#');
        buildInfo.filename = file;
      } else {
        // fix output asset filename used in HTML
        const [, fragment] = resource.split('#');
        assetFile += `#${fragment}`;
      }
    }

    if (asset != null) {
      const key = Resolver.getAssetKey(issuer, entryPoint);

      Resolver.addResolvedAsset(resource, asset, key);

      // save a module and handler for asset that may be used in many styles
      Resolver.setModuleHandler(resource, (originalAssetFile, issuer) => ResponsiveLoader.getAsset(module, issuer));

      // remove original asset filename generated by Webpack, because responsive-loader generates own filename
      AssetTrash.add(assetFile);
      return;
    }

    // save the original asset file that may be used in many files
    Resolver.addAsset(resource, assetFile);
  }
}

module.exports = AssetResource;