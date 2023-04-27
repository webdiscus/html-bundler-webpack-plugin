/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "(__entryId=1)/../../fixtures/images/apple.png":
/*!***************************************!*\
  !*** ../../fixtures/images/apple.png ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "assets/img/apple.02a7c382.png";

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
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "/html-bundler-webpack-plugin/test/cases/option-js-inline-auto-dev/dist/";
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!****************************************************************!*\
  !*** ./src/assets/scripts/script-inline-false.js?inline=false ***!
  \****************************************************************/
const image = __webpack_require__(/*! @images/apple.png */ "(__entryId=1)/../../fixtures/images/apple.png");

document.addEventListener('DOMContentLoaded', (event) => {
  const elm = document.querySelector('.js-image-script-inline-false');
  elm.style.backgroundImage = `url(${image})`;
  elm.style.width = '160px';
  elm.style.height = '130px';
  elm.style.border = '5px solid steelblue';
});

console.log('>> script-inline-false.js?inline=false', { image });

})();

/******/ })()
;