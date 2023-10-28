import { Compiler, WebpackPluginInstance } from 'webpack';
import { FaviconOptions } from 'favicons';

declare class FaviconsBundlerPlugin implements WebpackPluginInstance {
  constructor(options?: FaviconsBundlerPlugin.PluginOptions);
  apply(compiler: Compiler): void;
}

declare namespace FaviconsBundlerPlugin {
  export interface PluginOptions {
    enabled?: 'auto' | boolean;
    faviconOptions?: FaviconOptions;
  }
}

export = FaviconsBundlerPlugin;
