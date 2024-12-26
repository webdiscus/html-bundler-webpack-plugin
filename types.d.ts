import { Compiler, Compilation, LoaderContext, WebpackPluginInstance, PathData, AssetInfo } from 'webpack';
import { Options as MinifyOptions } from 'html-minifier-terser';
import { AsyncSeriesHook, AsyncSeriesWaterfallHook, SyncWaterfallHook } from 'tapable';

declare class HtmlBundlerPlugin implements WebpackPluginInstance {
  /**
   * The path to the template loader.
   */
  static loader: string;

  static option: HtmlBundlerPlugin.OptionPluginInterface;

  static getHooks(compilation: Compilation): HtmlBundlerPlugin.Hooks;

  constructor(options?: HtmlBundlerPlugin.PluginOptions);
  apply(compiler: Compiler): void;
}

declare namespace HtmlBundlerPlugin {
  export interface OptionPluginInterface {
    isEnabled: () => boolean;
    isProduction: () => boolean;
    isMinify: () => boolean;
    isVerbose: () => boolean;
    isEntry: (resource: string) => boolean;
    isScript: (resource: string) => boolean;
    isStyle: (resource: string) => boolean;

    /**
     * Resolve undefined|true|false|''|'auto' value depend on current Webpack mode dev/prod.
     *
     * @param {boolean|string|undefined} value The value one of the values: true, false, 'auto'.
     * @param {boolean} autoValue Returns the autoValue in prod mode when value is 'auto'.
     * @param {boolean|string} defaultValue Returns default value when value is undefined.
     * @return {boolean}
     */
    toBool: (value: boolean | string | undefined, autoValue: boolean, defaultValue: boolean | string) => boolean;

    get: () => PluginOptions;
    getWebpackOutputPath: () => string;
    getPublicPath: () => string;
  }

  export interface PluginOptions {
    // callbacks
    beforePreprocessor?: BeforePreprocessor;
    preprocessor?: Preprocessor;
    preprocessorOptions?: Object;
    // postprocess of rendered template, called after js template was compiled into html
    postprocess?: Postprocess;
    beforeEmit?: BeforeEmit;
    afterEmit?: AfterEmit;

    // enable the plugin, used for debugging
    enabled?: boolean;

    // match of entry template files
    test?: RegExp;
    /**
     * The key is route to output file w/o an extension, value is a template source file.
     * If the value is string, it should be an absolute or relative path to templates.
     * If the entry is undefined, then must be defined the Webpack entry option.
     */
    entry?: EntryObject | Array<EntryDescription> | string;
    entryFilter?:
      | RegExp
      | Array<RegExp>
      | { includes?: Array<RegExp>; excludes?: Array<RegExp> }
      | ((file: string) => void | false);

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
    // generates preload link tags for assets
    preload?: Preload;
    minify?: 'auto' | boolean | MinifyOptions;
    minifyOptions?: MinifyOptions;
    /**
     * The stage to render final HTML in the `processAssets` Webpack hook.
     */
    renderStage: null | number;
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
    context?: string;
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
      [content: string, loaderContext: BundlerPluginLoaderContext, callback?: (error: Error | null) => void]
    >;

    preprocessor: AsyncSeriesWaterfallHook<
      [content: string, loaderContext: BundlerPluginLoaderContext, callback?: (error: Error | null) => void]
    >;

    // TODO: implement afterPreprocessor when will be required the feature
    //afterPreprocessor: AsyncSeriesWaterfallHook<[content: string, loaderContext: BundlerPluginLoaderContext]>;

    /**
     * Called after resolve of a source attribute defined by loaderOptions.source.
     * Return a string to override the resolved value of the attribute.
     */
    resolveSource: SyncWaterfallHook<
      [
        source: string,
        info: { type: string; tag: string; attribute: string; value: string; resolvedFile: string; issuer: string },
      ]
    >;

    postprocess: AsyncSeriesWaterfallHook<[content: string, info: TemplateInfo]>;

    beforeEmit: AsyncSeriesWaterfallHook<[content: string, entry: CompileEntry]>;

    afterEmit: AsyncSeriesHook<[entries: CompileEntries]>;

    integrityHashes: AsyncSeriesHook<
      [
        // the map of the output asset filename to its integrity hash
        hashes: Map<string, string>,
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
  // undocumented, for debugging
  enabled?: boolean;
  // undocumented, for debugging
  test?: RegExp;
  // The output filename of extracted JavaScript. Defaults `[name].js`.
  filename?: FilenameTemplate;
  // The output filename of non-initial chunk file. Defaults `[id].js`.
  chunkFilename?: FilenameTemplate;
  // The output directory for an asset. Defaults, `webpack.output.path`.
  outputPath?: string;
  // Whether the compiled JavaScript should be inlined. Defaults, `false`.
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
  // Filter function to keep/remove attributes for inlined script tag.  If undefined, all attributes will be removed.
  attributeFilter?: (props: {
    attribute: string;
    value: string;
    attributes: { [attributeName: string]: string };
  }) => boolean | void;
};

type CssOptions = {
  // undocumented
  enabled?: boolean;
  // RegEx to match style files.
  test?: RegExp;
  // The output filename of extracted CSS.
  filename?: FilenameTemplate;
  // The output filename of non-initial chunk file, e.g., a style file imported in JavaScript.
  chunkFilename?: FilenameTemplate;
  // The output directory for an asset. Defaults, `webpack.output.path`.
  outputPath?: string;
  // Whether the compiled JavaScript should be inlined. Defaults, `false`.
  inline?: 'auto' | boolean;
  // Inject CSS into the DOM and enable HMR. Works only for styles imported in JavaScript files.
  // Note:
  // - `devServer.hot` option must be enabled (defaults)
  // - `devServer.watchFiles.paths` option must contains files excluding CSS/SCSS, e.g. `['src/**/*.(html)']`
  hot?: boolean;
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

type BeforePreprocessor = false | ((content: string, loaderContext: BundlerPluginLoaderContext) => string | undefined);

type Preprocessor =
  | false
  | 'eta'
  | 'ejs'
  | 'handlebars'
  | 'nunjucks'
  | 'pug'
  | 'tempura'
  | 'twig'
  | ((content: string, loaderContext: BundlerPluginLoaderContext) => string | Promise<any> | undefined);

/**
 * Called after the template has been compiled into html string, but not yet finalized,
 * before the split chunks and inline assets are injected.
 */
type Postprocess = (content: string, templateInfo: TemplateInfo, compilation: Compilation) => string | undefined;

/**
 * The object is argument of the hooks and callbacks.
 */
type TemplateInfo = {
  // the entry name
  name: string;
  // the output asset filename relative to output path
  assetFile: string;
  // the source file without a query
  sourceFile: string;
  // the source file including a query
  resource: string;
  // output path of assetFile
  outputPath: string;
};

/**
 * Called after the processAssets hook had finished without an error, before emitting.
 * At this stage, all resources are processed with plugins and have final output filenames.
 * This hook is called for each compiled template defined in the entry option.
 */
type BeforeEmit = (content: string, entry: CompileEntry, compilation: Compilation) => string | undefined;

type AfterEmit = (entries: CompileEntries, compilation: Compilation) => Promise<void> | void;

/**
 * The object is argument of hooks and callbacks.
 */
type CompileEntry = TemplateInfo & {
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
  includes?: Array<RegExp>;
  excludes?: Array<RegExp>;
};

// Private types: used in source code only

type ResolverType =
  | 'default'
  | 'script'
  | 'style'
  // used in a preprocessor for the resolving of including partials
  | 'include';

export = HtmlBundlerPlugin;
