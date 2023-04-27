(self["webpackChunk"] = self["webpackChunk"] || []).push([["scripts-___entryId_1_src_assets_js_main-a_js"],{

/***/ "(__entryId=1)/../../../node_modules/@test-fixtures/js/src/fixture-script.js":
/*!*********************************************************************!*\
  !*** ../../../node_modules/@test-fixtures/js/src/fixture-script.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*!
 * Test fixture - JS module with dependency (https://github.com/webdiscus/test-fixtures-js)
 * Copyleft 2022 @test-fixtures/js
 * Licensed under ISC (https://github.com/webdiscus/test-fixtures-js/blob/master/LICENSE)
 */

const lorem = __webpack_require__(/*! @test-fixtures/lorem */ "(__entryId=1)/../../../node_modules/@test-fixtures/lorem/src/fixture-lorem.js");
const libA = __webpack_require__(/*! ./lib-a */ "(__entryId=1)/../../../node_modules/@test-fixtures/js/src/lib-a.js");
const libB = __webpack_require__(/*! ./lib-b */ "(__entryId=1)/../../../node_modules/@test-fixtures/js/src/lib-b.js");

console.log('Fixture script');

module.exports = { lorem, libA, libB };


/***/ }),

/***/ "(__entryId=1)/../../../node_modules/@test-fixtures/js/src/lib-a.js":
/*!************************************************************!*\
  !*** ../../../node_modules/@test-fixtures/js/src/lib-a.js ***!
  \************************************************************/
/***/ ((module) => {

const libA = {
  name: 'Lib A',

  getName() {
    return this.name;
  }
}

module.exports = libA;


/***/ }),

/***/ "(__entryId=1)/../../../node_modules/@test-fixtures/js/src/lib-b.js":
/*!************************************************************!*\
  !*** ../../../node_modules/@test-fixtures/js/src/lib-b.js ***!
  \************************************************************/
/***/ ((module) => {

const libB = {
  name: 'Lib B',

  getName() {
    return this.name;
  }
}

module.exports = libB;


/***/ }),

/***/ "(__entryId=1)/../../../node_modules/@test-fixtures/lorem/src/fixture-lorem.js":
/*!***********************************************************************!*\
  !*** ../../../node_modules/@test-fixtures/lorem/src/fixture-lorem.js ***!
  \***********************************************************************/
/***/ ((module) => {

/*!
 * Test fixture - JS module Lorem (https://github.com/webdiscus/test-fixtures-lorem)
 * Copyleft 2022 @test-fixtures/lorem
 * Licensed under ISC (https://github.com/webdiscus/test-fixtures-lorem/blob/master/LICENSE)
 */

const Lorem = {
  title: 'Lorem Ipsum',

  // 1024 bytes of text
  data: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce efficitur pretium urna. Fusce condimentum dapibus lectus, et cursus turpis interdum ut. Nulla suscipit viverra turpis ac eleifend. Nulla dignissim auctor nulla, at imperdiet magna volutpat in. Proin neque elit, interdum sit amet mauris quis, aliquam placerat enim. Morbi cursus, ipsum eu finibus suscipit, odio velit iaculis orci, vitae malesuada orci lacus nec erat. Integer pellentesque velit a ex convallis, ac commodo justo tincidunt. Cras ac lorem et sem feugiat molestie non et est. Nullam id diam ut lorem bibendum congue. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras eget lectus gravida, dictum risus ac, rutrum ante. Phasellus faucibus lectus urna, eget vehicula magna fringilla et. Morbi tempus ipsum in velit auctor efficitur. Fusce luctus ultrices diam, ac pellentesque enim aliquet at. Cras finibus odio in nisl bibendum vulputate. Quisque ultrices nisi vel enim faucibus, non scelerisque ex portitor.',

  getTitle () {
    return this.title;
  },

  getText () {
    return this.data;
  },

  getSize() {
    return this.data.length
  },
}

module.exports = Lorem;


/***/ }),

/***/ "(__entryId=1)/./src/assets/js/lib.js":
/*!******************************!*\
  !*** ./src/assets/js/lib.js ***!
  \******************************/
/***/ ((module) => {

const Lib = {
  methodA() {
    return 'module A';
  },
  methodB() {
    return 'module B';
  },
  methodC() {
    return 'common used module';
  },
};

module.exports = Lib;

/***/ }),

/***/ "(__entryId=1)/./src/assets/js/main-a.js":
/*!*********************************!*\
  !*** ./src/assets/js/main-a.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const { lorem, libA, libB } = __webpack_require__(/*! @test-fixtures/js */ "(__entryId=1)/../../../node_modules/@test-fixtures/js/src/fixture-script.js");
const modA = __webpack_require__(/*! ./module-a */ "(__entryId=1)/./src/assets/js/module-a.js");
const modC = __webpack_require__(/*! ./module-c */ "(__entryId=1)/./src/assets/js/module-c.js");

console.log('>> main-a:');
console.log(' - A: ', modA);
console.log(' - C: ', modC);
console.log('Lorem: ', lorem.getTitle());


/***/ }),

/***/ "(__entryId=1)/./src/assets/js/module-a.js":
/*!***********************************!*\
  !*** ./src/assets/js/module-a.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const lib = __webpack_require__(/*! ./lib */ "(__entryId=1)/./src/assets/js/lib.js");
const value = lib.methodA();

module.exports = value;

/***/ }),

/***/ "(__entryId=1)/./src/assets/js/module-c.js":
/*!***********************************!*\
  !*** ./src/assets/js/module-c.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const lib = __webpack_require__(/*! ./lib */ "(__entryId=1)/./src/assets/js/lib.js");
const value = lib.methodC();

module.exports = value;

/***/ })

}]);