import { Lib } from './lib';
import mainA from './main-a';

const libValueCommon = Lib.methodC();

console.log('>> app: ', { mainA, libValueCommon });
