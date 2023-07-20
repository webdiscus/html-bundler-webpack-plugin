(self["webpackChunk"] = self["webpackChunk"] || []).push([["scripts-src_assets_js_main-a_js"],{

/***/ "./src/assets/js/main-a.js":
/*!*********************************!*\
  !*** ./src/assets/js/main-a.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const { lorem, libA, libB } = __webpack_require__(/*! @test-fixtures/js */ "../../../node_modules/@test-fixtures/js/src/fixture-script.js");
const modA = __webpack_require__(/*! ./module-a */ "./src/assets/js/module-a.js");
const modC = __webpack_require__(/*! ./module-c */ "./src/assets/js/module-c.js");

console.log('>> main-a:');
console.log(' - A: ', modA);
console.log(' - C: ', modC);
console.log('Lorem: ', lorem.getTitle());


/***/ }),

/***/ "./src/assets/js/module-a.js":
/*!***********************************!*\
  !*** ./src/assets/js/module-a.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const lib = __webpack_require__(/*! ./lib */ "./src/assets/js/lib.js");
const value = lib.methodA();

module.exports = value;

/***/ })

}]);