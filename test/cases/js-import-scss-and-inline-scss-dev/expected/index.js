/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/import1.scss":
/*!**************************!*\
  !*** ./src/import1.scss ***!
  \**************************/
/***/ (() => {

/* extracted by HTMLBundler CSSLoader */

/***/ }),

/***/ "./src/import2.scss":
/*!**************************!*\
  !*** ./src/import2.scss ***!
  \**************************/
/***/ (() => {

/* extracted by HTMLBundler CSSLoader */

/***/ }),

/***/ "./src/import3.scss?inline":
/*!*********************************!*\
  !*** ./src/import3.scss?inline ***!
  \*********************************/
/***/ (() => {

/* extracted by HTMLBundler CSSLoader */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _import1_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./import1.scss */ "./src/import1.scss");
/* harmony import */ var _import1_scss__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_import1_scss__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _import2_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./import2.scss */ "./src/import2.scss");
/* harmony import */ var _import2_scss__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_import2_scss__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _import3_scss_inline__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./import3.scss?inline */ "./src/import3.scss?inline");
/* harmony import */ var _import3_scss_inline__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_import3_scss_inline__WEBPACK_IMPORTED_MODULE_2__);
// These two imports are not included in the bundled css when running `webpack --mode development`.
// However, they are included in the bundled css when running `webpack --mode production`.



// This css is always properly inlined in the HTML file.
// Interestingly, if you comment this line out, then it fixes the issue with thea above imports
// (they will be properly included in the bundled css in development mode).


console.log("Hello World!");

})();

/******/ })()
;