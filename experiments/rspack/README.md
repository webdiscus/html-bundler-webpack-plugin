# RSPack and HTML Bundler

A symbiosis of the fast RSPack and the powerful [html-bundler-webpack-plugin](https://github.com/webdiscus/html-bundler-webpack-plugin) could be a `Vite` killer.

But currently RSPack `v0.5.8` is yet not 100% compatible with the Webpack.

Using the `html-bundler-webpack-plugin` with `RSPack` occurs the issue:

```
/Users/xxxx/html-bundler-webpack-plugin/experiments/rspack/node_modules/@rspack/core/dist/Compiler.js:518
    __classPrivateFieldSet(this, _Compiler_instance, new instanceBinding.Rspack(rawOptions, this.builtinPlugins, {
                                                     ^

Error: Failed to convert JavaScript value `function filenameFn(..) ` into rust type `String`

    at Compiler._Compiler_getInstance (/Users/xxxx/html-bundler-webpack-plugin/experiments/rspack/node_modules/@rspack/core/dist/Compiler.js:518:54)
    at Compiler.build (/Users/xxxx/html-bundler-webpack-plugin/experiments/rspack/node_modules/@rspack/core/dist/Compiler.js:384:87)
    at /Users/xxxx/html-bundler-webpack-plugin/experiments/rspack/node_modules/@rspack/core/dist/Watching.js:263:23
    at Hook.eval [as callAsync] (eval at create (/Users/xxxx/html-bundler-webpack-plugin/experiments/rspack/node_modules/tapable/lib/HookCodeFactory.js:33:10), <anonymous>:24:1)
    at Hook.CALL_ASYNC_DELEGATE [as _callAsync] (/Users/xxxx/html-bundler-webpack-plugin/experiments/rspack/node_modules/tapable/lib/Hook.js:18:14)
    at Watching._Watching_go (/Users/xxxx/html-bundler-webpack-plugin/experiments/rspack/node_modules/@rspack/core/dist/Watching.js:253:34)
    at Watching._Watching_invalidate (/Users/xxxx/html-bundler-webpack-plugin/experiments/rspack/node_modules/@rspack/core/dist/Watching.js:217:74)
    at /Users/xxxx/html-bundler-webpack-plugin/experiments/rspack/node_modules/@rspack/core/dist/Watching.js:51:94
    at process.processTicksAndRejections (node:internal/process/task_queues:77:11) {
  code: 'GenericFailure'
}
```

## Environment

- macOS 14.4 (23E214)
- version of Node.js: v18.18.2
- version of RSPack: 0.5.8
- version of Webpack: 5.90.3
- version of the HTML Bundler Plugin: 3.6.1

## How to reproduce

```
clone https://github.com/webdiscus/html-bundler-webpack-plugin.git
cd html-bundler-webpack-plugin/experiments/rspack
npm i
npm run dev
```
