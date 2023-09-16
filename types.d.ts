import { Compiler, Compilation, LoaderContext, WebpackPluginInstance } from 'webpack';
import { PathData, AssetInfo } from 'webpack/lib/Compilation';
import { Options as MinifyOptions } from 'html-minifier-terser';

declare class HtmlBundlerPlugin implements WebpackPluginInstance {
  /**
   * The path to the template loader.
   */
  static loader: string;

  constructor(options?: HtmlBundlerPlugin.PluginOptions);
  apply(compiler: Compiler): void;
}

declare namespace HtmlBundlerPlugin {
  export interface PluginOptions {
    test?: RegExp;
    /**
     * If the value is string, it should be an absolute or relative path to templates.
     * If the entry is undefined, then must be defined the Webpack entry option.
     */
    entry?: EntryObject | string;
    outputPath?: string;
    filename?: FilenameTemplate;
    js?: JsOptions;
    css?: CssOptions;
    /**
     * The references to LoaderOptions.
     * It's syntactic "sugar" to avoid the complicated structure of options.
     */
    data?: { [k: string]: any } | string;
    beforePreprocessor?: BeforePreprocessor;
    preprocessor?: Preprocessor;
    preprocessorOptions?: Object;
    // plugin options
    postprocess?: Postprocess;
    preload?: Preload;
    minify?: 'auto' | boolean | MinifyOptions;
    minifyOptions?: MinifyOptions;
    extractComments?: boolean;
    integrity?: 'auto' | boolean | IntegrityOptions;
    watchFiles?: WatchFiles;
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
}

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
   * Specifies the filename of the output file on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
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
type Data = { [k: string]: any } | string;

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
 * Specifies the filename template of output files on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
 */
type FilenameTemplate = string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

type BeforePreprocessor =
  | false
  | ((
      template: string,
      loaderContext: LoaderContext<Object> & { data: { [k: string]: any } | string }
    ) => string | undefined);

type Preprocessor =
  | false
  | 'eta'
  | 'ejs'
  | 'handlebars'
  | 'nunjucks'
  | ((
      template: string,
      loaderContext: LoaderContext<Object> & { data: { [k: string]: any } | string }
    ) => string | Promise<any> | undefined);

type Postprocess = (content: string, info: ResourceInfo, compilation: Compilation) => string | undefined;

type ResourceInfo = {
  verbose: boolean;
  isEntry: boolean;
  filename: string | ((pathData: PathData) => string);
  outputPath: string;
  sourceFile: string;
  assetFile: string;
};

type Preload = Array<{
  test: RegExp;
  as?: string;
  rel?: string;
  type?: string;
  attributes?: {};
}>;

type Sources =
  | boolean
  | Array<{
      tag?: string;
      attributes?: Array<string>;
      filter?: (props: {
        tag: string;
        attribute: string;
        value: string;
        attributes: string;
        resourcePath: string;
      }) => boolean | undefined;
    }>;

type WatchFiles = {
  paths?: Array<string>;
  files?: Array<RegExp>;
  ignore?: Array<RegExp>;
};

export = HtmlBundlerPlugin;
