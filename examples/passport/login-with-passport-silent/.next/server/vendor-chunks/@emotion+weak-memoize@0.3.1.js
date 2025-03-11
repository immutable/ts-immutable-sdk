"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@emotion+weak-memoize@0.3.1";
exports.ids = ["vendor-chunks/@emotion+weak-memoize@0.3.1"];
exports.modules = {

/***/ "(ssr)/../../../node_modules/.pnpm/@emotion+weak-memoize@0.3.1/node_modules/@emotion/weak-memoize/dist/emotion-weak-memoize.esm.js":
/*!***********************************************************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/@emotion+weak-memoize@0.3.1/node_modules/@emotion/weak-memoize/dist/emotion-weak-memoize.esm.js ***!
  \***********************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ weakMemoize)\n/* harmony export */ });\nvar weakMemoize = function weakMemoize(func) {\n  // $FlowFixMe flow doesn't include all non-primitive types as allowed for weakmaps\n  var cache = new WeakMap();\n  return function (arg) {\n    if (cache.has(arg)) {\n      // $FlowFixMe\n      return cache.get(arg);\n    }\n\n    var ret = func(arg);\n    cache.set(arg, ret);\n    return ret;\n  };\n};\n\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BlbW90aW9uK3dlYWstbWVtb2l6ZUAwLjMuMS9ub2RlX21vZHVsZXMvQGVtb3Rpb24vd2Vhay1tZW1vaXplL2Rpc3QvZW1vdGlvbi13ZWFrLW1lbW9pemUuZXNtLmpzIiwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRWtDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGV4YW1wbGVzL2xvZ2luLXdpdGgtcGFzc3BvcnQtc2lsZW50Ly4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9AZW1vdGlvbit3ZWFrLW1lbW9pemVAMC4zLjEvbm9kZV9tb2R1bGVzL0BlbW90aW9uL3dlYWstbWVtb2l6ZS9kaXN0L2Vtb3Rpb24td2Vhay1tZW1vaXplLmVzbS5qcz9kMWNkIl0sInNvdXJjZXNDb250ZW50IjpbInZhciB3ZWFrTWVtb2l6ZSA9IGZ1bmN0aW9uIHdlYWtNZW1vaXplKGZ1bmMpIHtcbiAgLy8gJEZsb3dGaXhNZSBmbG93IGRvZXNuJ3QgaW5jbHVkZSBhbGwgbm9uLXByaW1pdGl2ZSB0eXBlcyBhcyBhbGxvd2VkIGZvciB3ZWFrbWFwc1xuICB2YXIgY2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuICByZXR1cm4gZnVuY3Rpb24gKGFyZykge1xuICAgIGlmIChjYWNoZS5oYXMoYXJnKSkge1xuICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgcmV0dXJuIGNhY2hlLmdldChhcmcpO1xuICAgIH1cblxuICAgIHZhciByZXQgPSBmdW5jKGFyZyk7XG4gICAgY2FjaGUuc2V0KGFyZywgcmV0KTtcbiAgICByZXR1cm4gcmV0O1xuICB9O1xufTtcblxuZXhwb3J0IHsgd2Vha01lbW9pemUgYXMgZGVmYXVsdCB9O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/@emotion+weak-memoize@0.3.1/node_modules/@emotion/weak-memoize/dist/emotion-weak-memoize.esm.js\n");

/***/ })

};
;