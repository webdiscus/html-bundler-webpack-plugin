import { Compiler, Compilation, LoaderContext, WebpackPluginInstance, PathData, AssetInfo } from 'webpack';
import { Options as MinifyOptions } from 'html-minifier-terser';
import { AsyncSeriesHook, AsyncSeriesWaterfallHook, SyncWaterfallHook } from 'tapable';

declare class HtmlBundlerPlugin implements WebpackPluginInstance {
  /**
   * The path to the template loader.
   */
  static loader: string;

  static getHooks(compilation: Compilation): HtmlBundlerPlugin.Hooks;

  constructor(options?: HtmlBundlerPlugin.PluginOptions);
  apply(compiler: Compiler): void;
}

declare namespace HtmlBundlerPlugin {
  export interface PluginOptions {
    // match of entry template files
    test?: RegExp;
    /**
     * The key is route to output file w/o an extension, value is a template source file.
     * If the value is string, it should be an absolute or relative path to templates.
     * If the entry is undefined, then must be defined the Webpack entry option.
     */
    entry?: EntryObject | string;
    // defaults is options.output.path
    outputPath?: string;
    // html output filename
    filename?: FilenameTemplate;
    js?: JsOptions;
    css?: CssOptions;
    /**
     * The references to LoaderOptions.
     * It's syntactic "sugar" to avoid the complicated structure of options.
     */
    data?: { [key: string]: any } | string;
    beforePreprocessor?: BeforePreprocessor;
    preprocessor?: Preprocessor;
    preprocessorOptions?: Object;
    // postprocess of rendered template, called after js template was compiled into html
    postprocess?: Postprocess;
    beforeEmit?: BeforeEmit;
    // generates preload link tags for assets
    preload?: Preload;
    minify?: 'auto' | boolean | MinifyOptions;
    minifyOptions?: MinifyOptions;
    /**
     * Whether comments should be extracted to a separate file.
     * If the file foo.js contains the license banner, then the comments will be stored to foo.js.LICENSE.txt.
     * This option enables/disable storing of *.LICENSE.txt file.
     * For more flexibility use terser-webpack-plugin https://webpack.js.org/plugins/terser-webpack-plugin/#extractcomments.
     */
    extractComments?: boolean;
    integrity?: 'auto' | boolean | IntegrityOptions;
    // paths and files to watch file changes
    watchFiles?: WatchFiles;
    /**
     * Whether in serve/watch mode should be added hot-update.js file in html.
     * Use it only if you don't have a referenced source file of a script in html.
     * If you already have a js file, this setting should be false as Webpack automatically injects the hot update code into the compiled js file.
     */
    hotUpdate?: boolean;
    verbose?: 'auto' | boolean;
    /**
     * The reference to LoaderOptions.
     * Use this option here to avoid definition of the rule for the template loader module.
     */
    loaderOptions?: LoaderOptions;
  }

  export interface LoaderOptions {
    root?: string | boolean;
    beforePreprocessor?: BeforePreprocessor;
    preprocessor?: Preprocessor;
    preprocessorOptions?: Object;
    sources?: Sources;
    /**
     * Global data passed in all templates.
     */
    data?: Data;
  }

  export interface Hooks {
    beforePreprocessor: AsyncSeriesWaterfallHook<
      [content: string, loaderContext: BundlerPluginLoaderContext, callback?: (error: Error | null) => undefined]
    >;

    preprocessor: AsyncSeriesWaterfallHook<
      [content: string, loaderContext: BundlerPluginLoaderContext, callback?: (error: Error | null) => undefined]
    >;

    postprocess: SyncWaterfallHook<[content: string, compileInfo: TemplateInfo]>;

    beforeEmit: SyncWaterfallHook<[content: string, entry: CompileEntry, options: CompileOptions]>;

    afterEmit: AsyncSeriesHook<
      [
        entries: CompileEntries,
        options: CompileOptions,
        // only for tapAsync
        callback?: (error: Error | null) => undefined,
      ]
    >;

    integrityHashes: AsyncSeriesHook<
      [
        // the map of the output asset filename to its integrity hash
        hashes: Map<string, string>,
        // only for tapAsync
        callback?: (error: Error | null) => undefined,
      ]
    >;
  }
}

/**
 * Context of bundler loader.
 */
type BundlerPluginLoaderContext = LoaderContext<Object> & { data: { [key: string]: any } | string };

/**
 * Multiple entry bundles are created. The key is the entry name. The value can be a string or an entry description object.
 */
type EntryObject = {
  /**
   * An entry point with name.
   * If the value is string, it should be an absolute or relative path to a JSON/JS file.
   */
  [name: string]: EntryDescription | string;
};

/**
 * An object with entry point description.
 */
type EntryDescription = {
  /**
   * Template file, relative of context or absolute.
   */
  import: string;
  /**
   * The output filename template.
   */
  filename?: FilenameTemplate;
  /**
   * The data passed to the imported template.
   */
  data?: Data;
};

/**
 * The template data passed to the preprocessor as an object, or the path to a file that exports the data as an object.
 * If the value is string, it should be an absolute or relative path to a JSON/JS file.
 */
type Data = { [key: string]: any } | string;

type JsOptions = {
  filename?: FilenameTemplate;
  chunkFilename?: FilenameTemplate;
  outputPath?: string;
  inline?: 'auto' | boolean | JsInlineOptions;
};

/**
 * An object with js inline options.
 * When the chunk or the source filter(s) is/are defined, then apply the filer.
 */
type JsInlineOptions = {
  // Regards the chunk or the source filters only if `enabled` is true or `auto` evaluates to true.
  enabled?: 'auto' | boolean;
  // Inlines the single chunk when output chunk filename matches a regular expression(s).
  chunk?: RegExp | Array<RegExp>;
  // Inlines all chunks when source filename matches a regular expression(s).
  source?: RegExp | Array<RegExp>;
};

type CssOptions = {
  test?: RegExp;
  filename?: FilenameTemplate;
  chunkFilename?: FilenameTemplate;
  outputPath?: string;
  inline?: 'auto' | boolean;
};

type IntegrityOptions = {
  enabled?: 'auto' | boolean;
  hashFunctions?: HashFunctions | Array<HashFunctions>;
};
type HashFunctions = 'sha256' | 'sha384' | 'sha512';

/**
 * Specifies the filename template of output files on disk.
 * You must **not** specify an absolute path here, but the path may contain folders separated by '/'!
 * The specified path is joined with the value of the 'output.path' option to determine the location on the disk.
 */
type FilenameTemplate = string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

type BeforePreprocessor = false | ((template: string, loaderContext: BundlerPluginLoaderContext) => string | undefined);

type Preprocessor =
  | false
  | 'eta'
  | 'ejs'
  | 'handlebars'
  | 'nunjucks'
  | ((template: string, loaderContext: BundlerPluginLoaderContext) => string | Promise<any> | undefined);

/**
 * Called after the template has been compiled into html string, but not yet finalized,
 * before the split chunks and inline assets are injected.
 */
type Postprocess = (content: string, templateInfo: TemplateInfo, compilation: Compilation) => string | undefined;

/**
 * The object is argument of the postprocess hook.
 */
// TODO: use CompileEntry + CompileOptions instead of TemplateInfo
type TemplateInfo = {
  verbose: boolean;
  // TODO: deprecate the filename as filenameTemplate, because it will be never used
  //filename: string | ((pathData: PathData) => string);
  // the source filename including a query
  // TODO: deprecate sourceFile, because is already the `resource`
  //sourceFile: string;
  outputPath: string;
  resource: string;
  assetFile: string;
};

/**
 * Called after the processAssets hook had finished without an error, before emit.
 * At this stage, all resources are processed with plugins and have final output filenames.
 * This hook is called for each compiled template defined in the entry option.
 */
type BeforeEmit = (
  content: string,
  entry: CompileEntry,
  options: CompileOptions,
  compilation: Compilation
) => string | undefined;

type CompileOptions = {
  verbose: boolean;
  // webpack output path
  outputPath: string;
};

/**
 * The object is argument of hooks.
 */
type CompileEntry = {
  // the entry name
  name: string;
  // the source filename including a query
  resource: string;
  // the output asset filename relative to output path
  assetFile: string;
  // assets used in html
  assets: Array<CompileAsset>;
};

type CompileEntries = Array<CompileEntry>;

type CompileAsset = AssetScript | AssetStyle | AssetResource;
// TODO: define types AssetScript, AssetStyle, AssetResource
type AssetScript = {};
type AssetStyle = {};
type AssetResource = {};

type Preload = Array<{
  test: RegExp;
  as?: string;
  rel?: string;
  type?: string;
  attributes?: { [attributeName: string]: string | boolean };
}>;

type Sources =
  | boolean
  | Array<{
      tag?: string;
      attributes?: Array<string>;
      filter?: (props: {
        tag: string;
        attribute: string;
        // original value string
        value: string;
        // parsed value, useful for srcset attribute with many filenames
        parsedValue: Array<string>;
        attributes: { [attributeName: string]: string };
        resourcePath: string;
      }) => boolean | undefined;
    }>;

type WatchFiles = {
  paths?: Array<string>;
  files?: Array<RegExp>;
  ignore?: Array<RegExp>;
};

export = HtmlBundlerPlugin;
