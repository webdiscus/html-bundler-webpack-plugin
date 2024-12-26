# BUG

> Update 19.12.2024, the issue fixed in `image-minimizer-webpack-plugin@4.1.3`

If set `cache.type: 'filesystem'` in Webpack configuration,
the first compilation will complete without errors.
Second compilations will fail:

```
ERROR in ./src/token.svg
Can't handle conflicting asset info for sourceFilename
Error: Can't handle conflicting asset info for sourceFilename
    at mergeAssetInfo (.../node_modules/webpack/lib/asset/AssetGenerator.js:99:12)
    at AssetGenerator.generate (.../node_modules/webpack/lib/asset/AssetGenerator.js:545:20)
```

## How to reproduce the issue

```
npm i
npm run build <= OK
npm run build <= second rebuild occurs error
```
