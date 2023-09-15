(self["webpackChunk"] = self["webpackChunk"] || []).push([["src_chunk_js"],{

/***/ "../../../node_modules/@test-fixtures/js/src/fixture-script.js":
/*!*********************************************************************!*\
  !*** ../../../node_modules/@test-fixtures/js/src/fixture-script.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*!
 * Test fixture - JS module with dependency (https://github.com/webdiscus/test-fixtures-js)
 * Copyleft 2022 @test-fixtures/js
 * Licensed under ISC (https://github.com/webdiscus/test-fixtures-js/blob/master/LICENSE)
 */

const lorem = __webpack_require__(/*! @test-fixtures/lorem */ "../../fixtures/node_modules/lorem/src/index.js");
const libA = __webpack_require__(/*! ./lib-a */ "../../../node_modules/@test-fixtures/js/src/lib-a.js");
const libB = __webpack_require__(/*! ./lib-b */ "../../../node_modules/@test-fixtures/js/src/lib-b.js");

console.log('Fixture script');

module.exports = { lorem, libA, libB };


/***/ }),

/***/ "../../../node_modules/@test-fixtures/js/src/lib-a.js":
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

/***/ "../../../node_modules/@test-fixtures/js/src/lib-b.js":
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

/***/ "./src/chunk.js":
/*!**********************!*\
  !*** ./src/chunk.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _test_fixtures_lorem__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @test-fixtures/lorem */ "../../fixtures/node_modules/lorem/src/index.js");
/* harmony import */ var _test_fixtures_lorem__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_test_fixtures_lorem__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _test_fixtures_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @test-fixtures/js */ "../../../node_modules/@test-fixtures/js/src/fixture-script.js");
/* harmony import */ var _test_fixtures_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_test_fixtures_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _imac_png__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./imac.png */ "./src/imac.png");
// 1) test import node module with a license comment,
//    which will be removed before hash computation
// 2) test dynamic import many chunk files






console.log('>> chunk file: ', { img: _imac_png__WEBPACK_IMPORTED_MODULE_2__, libA: _test_fixtures_js__WEBPACK_IMPORTED_MODULE_1__.libA });


/***/ }),

/***/ "../../fixtures/node_modules/lorem/src/index.js":
/*!******************************************************!*\
  !*** ../../fixtures/node_modules/lorem/src/index.js ***!
  \******************************************************/
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

/***/ "./src/imac.png":
/*!**********************!*\
  !*** ./src/imac.png ***!
  \**********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "imac.d12b81b0.png";

/***/ })

}]);
//# sourceMappingURL=src_chunk_js.js.map