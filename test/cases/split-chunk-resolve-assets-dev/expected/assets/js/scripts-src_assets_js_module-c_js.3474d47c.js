/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk"] = self["webpackChunk"] || []).push([["scripts-src_assets_js_module-c_js"],{

/***/ "./src/assets/js/lib.js":
/*!******************************!*\
  !*** ./src/assets/js/lib.js ***!
  \******************************/
/***/ ((module) => {

eval("const Lib = {\n  methodA() {\n    return 'module A';\n  },\n  methodB() {\n    return 'module B';\n  },\n  methodC() {\n    return 'common used module';\n  },\n};\n\nmodule.exports = Lib;\n\n//# sourceURL=webpack:///./src/assets/js/lib.js?");

/***/ }),

/***/ "./src/assets/js/module-c.js":
/*!***********************************!*\
  !*** ./src/assets/js/module-c.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const lib = __webpack_require__(/*! ./lib */ \"./src/assets/js/lib.js\");\nconst value = lib.methodC();\n\nmodule.exports = value;\n\n//# sourceURL=webpack:///./src/assets/js/module-c.js?");

/***/ })

}]);