// simulate where data.assets[].sourceFile can be an array for the single generated CSS:
import mainStyle from '@src/style.css';
import modStyle from '@src/moduleB.css';

import img from '@src/apple.png';

console.log('>> moduleB', { mainStyle, modStyle, img });
