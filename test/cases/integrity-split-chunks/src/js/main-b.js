import { Lib } from './lib';

const libValueB = Lib.methodB();
const libValueCommon = Lib.methodC();
const mainB =
  '+++ Main B: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam volu';

console.log('>> main-b:', { libValueB, libValueCommon });

export default mainB;
