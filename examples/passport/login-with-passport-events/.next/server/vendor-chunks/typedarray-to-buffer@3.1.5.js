/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/typedarray-to-buffer@3.1.5";
exports.ids = ["vendor-chunks/typedarray-to-buffer@3.1.5"];
exports.modules = {

/***/ "(ssr)/../../../node_modules/.pnpm/typedarray-to-buffer@3.1.5/node_modules/typedarray-to-buffer/index.js":
/*!*********************************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/typedarray-to-buffer@3.1.5/node_modules/typedarray-to-buffer/index.js ***!
  \*********************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("/**\n * Convert a typed array to a Buffer without a copy\n *\n * Author:   Feross Aboukhadijeh <https://feross.org>\n * License:  MIT\n *\n * `npm install typedarray-to-buffer`\n */\n\nvar isTypedArray = (__webpack_require__(/*! is-typedarray */ \"(ssr)/../../../node_modules/.pnpm/is-typedarray@1.0.0/node_modules/is-typedarray/index.js\").strict)\n\nmodule.exports = function typedarrayToBuffer (arr) {\n  if (isTypedArray(arr)) {\n    // To avoid a copy, use the typed array's underlying ArrayBuffer to back new Buffer\n    var buf = Buffer.from(arr.buffer)\n    if (arr.byteLength !== arr.buffer.byteLength) {\n      // Respect the \"view\", i.e. byteOffset and byteLength, without doing a copy\n      buf = buf.slice(arr.byteOffset, arr.byteOffset + arr.byteLength)\n    }\n    return buf\n  } else {\n    // Pass through all other types to `Buffer.from`\n    return Buffer.from(arr)\n  }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3R5cGVkYXJyYXktdG8tYnVmZmVyQDMuMS41L25vZGVfbW9kdWxlcy90eXBlZGFycmF5LXRvLWJ1ZmZlci9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLG1CQUFtQiw4SUFBK0I7O0FBRWxEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL0BleGFtcGxlcy9sb2dpbi13aXRoLXBhc3Nwb3J0LWV2ZW50cy8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vdHlwZWRhcnJheS10by1idWZmZXJAMy4xLjUvbm9kZV9tb2R1bGVzL3R5cGVkYXJyYXktdG8tYnVmZmVyL2luZGV4LmpzP2VlMWMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb252ZXJ0IGEgdHlwZWQgYXJyYXkgdG8gYSBCdWZmZXIgd2l0aG91dCBhIGNvcHlcbiAqXG4gKiBBdXRob3I6ICAgRmVyb3NzIEFib3VraGFkaWplaCA8aHR0cHM6Ly9mZXJvc3Mub3JnPlxuICogTGljZW5zZTogIE1JVFxuICpcbiAqIGBucG0gaW5zdGFsbCB0eXBlZGFycmF5LXRvLWJ1ZmZlcmBcbiAqL1xuXG52YXIgaXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnaXMtdHlwZWRhcnJheScpLnN0cmljdFxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHR5cGVkYXJyYXlUb0J1ZmZlciAoYXJyKSB7XG4gIGlmIChpc1R5cGVkQXJyYXkoYXJyKSkge1xuICAgIC8vIFRvIGF2b2lkIGEgY29weSwgdXNlIHRoZSB0eXBlZCBhcnJheSdzIHVuZGVybHlpbmcgQXJyYXlCdWZmZXIgdG8gYmFjayBuZXcgQnVmZmVyXG4gICAgdmFyIGJ1ZiA9IEJ1ZmZlci5mcm9tKGFyci5idWZmZXIpXG4gICAgaWYgKGFyci5ieXRlTGVuZ3RoICE9PSBhcnIuYnVmZmVyLmJ5dGVMZW5ndGgpIHtcbiAgICAgIC8vIFJlc3BlY3QgdGhlIFwidmlld1wiLCBpLmUuIGJ5dGVPZmZzZXQgYW5kIGJ5dGVMZW5ndGgsIHdpdGhvdXQgZG9pbmcgYSBjb3B5XG4gICAgICBidWYgPSBidWYuc2xpY2UoYXJyLmJ5dGVPZmZzZXQsIGFyci5ieXRlT2Zmc2V0ICsgYXJyLmJ5dGVMZW5ndGgpXG4gICAgfVxuICAgIHJldHVybiBidWZcbiAgfSBlbHNlIHtcbiAgICAvLyBQYXNzIHRocm91Z2ggYWxsIG90aGVyIHR5cGVzIHRvIGBCdWZmZXIuZnJvbWBcbiAgICByZXR1cm4gQnVmZmVyLmZyb20oYXJyKVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/typedarray-to-buffer@3.1.5/node_modules/typedarray-to-buffer/index.js\n");

/***/ })

};
;