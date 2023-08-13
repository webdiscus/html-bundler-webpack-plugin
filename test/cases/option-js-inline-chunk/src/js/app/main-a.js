import { Lib } from './lib';
import mainB from './main-b';

const libValueA = Lib.methodA();
const libValueCommon = Lib.methodC();
const mainA =
  '+++ Main A: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam volu';

console.log('>> main-a:', { mainB, libValueA, libValueCommon });

export default mainA;
