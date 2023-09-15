// 1) test import node module with a license comment,
//    which will be removed before hash computation
// 2) test dynamic import many chunk files

import '@test-fixtures/lorem';
import { libA } from '@test-fixtures/js';

import img from './imac.png';

console.log('>> chunk file: ', { img, libA });
