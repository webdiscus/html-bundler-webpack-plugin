# BUG in image-minimizer-webpack-plugin

See https://github.com/webdiscus/html-bundler-webpack-plugin/issues/130

## Bug

Webpack compilations fail after second rebuild when using filesystem cache:

```
Can't handle conflicting asset info for sourceFilename
```

## Prepare the test

Clone repository

```
git clone https://github.com/webdiscus/html-bundler-webpack-plugin.git
```

Install dev dependencies
```
cd html-bundler-webpack-plugin
npm i
```

Install this test case
```
cd ./test/manual/cache-filesystem-rebuild-image-minimizer
npm i
```

## How to reproduce the bug

```
npm run build <= OK
npm run build <= second rebuild occurs error
```

## How to fix

1. Open the file `./test/manual/cache-filesystem-rebuild-image-minimizer/node_modules/image-minimizer-webpack-plugin/dist/loader.js`

1. Change the line 154:
   ```diff
   -  const filename = isAbsolute ? this.resourcePath : path.relative(this.rootContext, this.resourcePath);
   +  const filename = !isAbsolute ? this.resourcePath : path.relative(this.rootContext, this.resourcePath);
   ```

**In the line 154 is the BUG (logical error):**\
if the path is absolute, then do nothing, else transform it to relative. This doesn't make sense!

**Correctly should be:**\
if the path is absolute, then transform it to relative, else do nothing. This is exactly that expected Webpack in webpack/lib/asset/AssetGenerator.js:545:
```js
newAssetInfo = mergeAssetInfo(data.get("assetInfo"), newAssetInfo); // <= here occurs error
```
When in both objects data.get("assetInfo") and newAssetInfo the same `sourceFilename` contains different (relative and absolute) paths, then the `mergeAssetInfo` function throws the error.

> [!CAUTION]
> A path to the source file in `sourceFilename` must be relative to the `output.path` directory.
