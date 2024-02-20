# Manual test

The issue [#76](https://github.com/webdiscus/html-bundler-webpack-plugin/issues/76):

`exports` field in `package.json` missing a `types` field (required even if there is already a top level "types" field

Test: `npm i && npx -y tsc` should be done without errors.
