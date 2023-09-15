// 1) test import node module with a license comment,
//    which will be removed before hash computation
// 2) test dynamic import many chunk files

import '@test-fixtures/dius'; // test extractComments in dynamic loaded JS
import { libA } from '@test-fixtures/js';

console.log('>> chunk: ', { libA });
