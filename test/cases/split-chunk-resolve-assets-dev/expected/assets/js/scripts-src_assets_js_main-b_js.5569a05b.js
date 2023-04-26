/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk"] = self["webpackChunk"] || []).push([["scripts-src_assets_js_main-b_js"],{

/***/ "./src/assets/js/main-b.js":
/*!*********************************!*\
  !*** ./src/assets/js/main-b.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("const modB = __webpack_require__(/*! ./module-b */ \"./src/assets/js/module-b.js\");\nconst modC = __webpack_require__(/*! ./module-c */ \"./src/assets/js/module-c.js\");\n\nconsole.log('>> main-b:');\nconsole.log(' - B: ', modB);\nconsole.log(' - C: ', modC);\n\n//# sourceURL=webpack:///./src/assets/js/main-b.js?");

/***/ }),

/***/ "./src/assets/js/module-b.js":
/*!***********************************!*\
  !*** ./src/assets/js/module-b.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const lib = __webpack_require__(/*! ./lib */ \"./src/assets/js/lib.js\");\nconst value = lib.methodB();\n\nmodule.exports = value;\n\n//# sourceURL=webpack:///./src/assets/js/module-b.js?");

/***/ })

}]);