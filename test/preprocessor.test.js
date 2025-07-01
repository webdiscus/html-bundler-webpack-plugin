import { compareFiles } from './utils/helpers';

beforeAll(() => {
  // important: the environment constant is used in code
  // the value must be type string
  process.env.NODE_ENV_TEST = 'true';
});

describe('Eta', () => {
  test('default', () => compareFiles('_preprocessor/eta-default'));
  test('option views', () => compareFiles('_preprocessor/eta-option-views'));
  test('option async', () => compareFiles('_preprocessor/eta-option-async'));
  test('include md', () => compareFiles('_preprocessor/eta-include-md'));
});

describe('EJS', () => {
  test('default options', () => compareFiles('_preprocessor/ejs-default'));
  test('option async', () => compareFiles('_preprocessor/ejs-option-async'));
  test('option views', () => compareFiles('_preprocessor/ejs-option-views'));
  test('custom render', () => compareFiles('_preprocessor/ejs-custom-render'));
  test('require js', () => compareFiles('_preprocessor/ejs-require-js'));
  test('require json', () => compareFiles('_preprocessor/ejs-require-json'));
  test('include md', () => compareFiles('_preprocessor/ejs-include-md'));

  // special cases
  test('Template with CRLF line separator', () => compareFiles('_preprocessor/ejs-template-clrf'));
});

describe('handlebars', () => {
  test('default', () => compareFiles('_preprocessor/handlebars-default'));
  test('option helpers as functions', () => compareFiles('_preprocessor/handlebars-helpers-function'));
  test('option helpers as paths', () => compareFiles('_preprocessor/handlebars-helpers-path'));

  test('option partials as array', () => compareFiles('_preprocessor/handlebars-option-partials-array'));
  test('option partials as object', () => compareFiles('_preprocessor/handlebars-option-partials-object'));

  test('usage partials', () => compareFiles('_preprocessor/handlebars-option-partials-usage'));
  test('custom runtime', () => compareFiles('_preprocessor/handlebars-custom-runtime'));

  test('access @root', () => compareFiles('_preprocessor/handlebars-access-root-variable'));

  // test helpers
  test('build-in `block` helper', () => compareFiles('_preprocessor/handlebars-helper-block-buildIn'));
  test('override build-in helper', () => compareFiles('_preprocessor/handlebars-helper-block-user'));
  test('handlebars-layouts', () => compareFiles('_preprocessor/handlebars-helper-layouts'));

  test('include markdown', () => compareFiles('_preprocessor/handlebars-include-md'));
});

describe('nunjucks', () => {
  test('useful options', () => compareFiles('_preprocessor/nunjucks-options'));
  test('option async', () => compareFiles('_preprocessor/nunjucks-option-async'));
});

describe('liquid', () => {
  test('custom render', () => compareFiles('_preprocessor/liquid-custom-render'));
  test('custom render async', () => compareFiles('_preprocessor/liquid-custom-render-async'));
});

describe('twig', () => {
  test('options', () => compareFiles('_preprocessor/twig-options'));
});

describe('other preprocessors', () => {
  test('mustache custom render', () => compareFiles('_preprocessor/mustache-custom-render'));

  // TODO: add support for jsx/tsx as entrypoint, currently works only simplest example, w/o imports
  //test('jsx', () => compareFiles('_preprocessor/preprocessor-jsx'));
});

describe('tempura', () => {
  test('default', () => compareFiles('_preprocessor/tempura-default'));
  test('render', () => compareFiles('_preprocessor/tempura-render'));
});

describe('special use cases', () => {
  test('preprocessor function', () => compareFiles('_preprocessor/preprocessor-function'));
  test('preprocessor null', () => compareFiles('_preprocessor/preprocessor-return-null'));
  test('preprocessor for output php template', () => compareFiles('_preprocessor/preprocessor-disabled-php'));
  test('preprocessor for output ftl template', () => compareFiles('_preprocessor/preprocessor-disabled-ftl'));

  test('custom render, multiple pages', () => compareFiles('_preprocessor/preprocessor-custom-render-multipage'));
  test('using different templating engines', () => compareFiles('_preprocessor/preprocessor-various-ejs-hbs'));
});

describe('usage template in js on client side', () => {
  // Eta
  test('default template', () => compareFiles('_preprocessor/js-tmpl-default'));
  test('eta: compile to fn', () => compareFiles('_preprocessor/js-tmpl-eta-compile'));
  test('eta: compile to fn with local data in js', () => compareFiles('_preprocessor/js-tmpl-eta-compile-data-local'));
  test('eta: compile to fn with external data', () => compareFiles('_preprocessor/js-tmpl-eta-compile-data-external'));
  test('eta: render to html', () => compareFiles('_preprocessor/js-tmpl-eta-render'));
  test('eta: render to html, many pages', () => compareFiles('_preprocessor/js-tmpl-eta-render-many-pages'));
  test('eta: resolve images in imported partial', () => compareFiles('_preprocessor/js-tmpl-resolve-img-in-partial'));

  // EJS
  test('ejs: compile to fn', () => compareFiles('_preprocessor/js-tmpl-ejs-compile'));

  // Handlebars

  test('hbs: compile to fn', () => compareFiles('_preprocessor/js-tmpl-hbs-compile'));
  test('hbs: compile undefined vars', () => compareFiles('_preprocessor/js-tmpl-hbs-compile-strict-undefined-var'));
  test('hbs: compile, helpers', () => compareFiles('_preprocessor/js-tmpl-hbs-compile-helpers'));
  test('hbs: compile, helpers, strict', () => compareFiles('_preprocessor/js-tmpl-hbs-compile-helpers-strict'));
  test('hbs: compile, partials', () => compareFiles('_preprocessor/js-tmpl-hbs-compile-partials'));
  test('hbs: compile, variables', () => compareFiles('_preprocessor/js-tmpl-hbs-compile-variables'));
  test('hbs: partials in hbs- and JS templates', () => compareFiles('_preprocessor/js-tmpl-hbs-partials-in-hbs-js'));
  test('hbs: render/compile images', () => compareFiles('_preprocessor/js-tmpl-hbs-compile-images'));

  // Handlebars issues
  test('handlebars compile, issue template', () => compareFiles('_preprocessor/handlebars-compile-issue-template'));

  // Nunjucks
  test('njk: compile to fn', () => compareFiles('_preprocessor/js-tmpl-njk-compile'));

  // Twig
  test('twig: compile to fn', () => compareFiles('_preprocessor/js-tmpl-twig-compile'));

  // Tempura
  // TODO: locally passes the test, but on GitHub fail because the generated JS code contains other char for minimized function name
  //test('tempura: compile to fn', () => compareFiles('_preprocessor/js-tmpl-tmpr-compile'));
});
