/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/buffer-reverse@1.0.1";
exports.ids = ["vendor-chunks/buffer-reverse@1.0.1"];
exports.modules = {

/***/ "(ssr)/../../../node_modules/.pnpm/buffer-reverse@1.0.1/node_modules/buffer-reverse/index.js":
/*!*********************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/buffer-reverse@1.0.1/node_modules/buffer-reverse/index.js ***!
  \*********************************************************************************************/
/***/ ((module) => {

eval("module.exports = function reverse (src) {\n  var buffer = new Buffer(src.length)\n\n  for (var i = 0, j = src.length - 1; i <= j; ++i, --j) {\n    buffer[i] = src[j]\n    buffer[j] = src[i]\n  }\n\n  return buffer\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2J1ZmZlci1yZXZlcnNlQDEuMC4xL25vZGVfbW9kdWxlcy9idWZmZXItcmV2ZXJzZS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUVBLHNDQUFzQyxRQUFRO0FBQzlDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGV4YW1wbGVzL2xvZ2luLXdpdGgtcGFzc3BvcnQtZXZlbnRzLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9idWZmZXItcmV2ZXJzZUAxLjAuMS9ub2RlX21vZHVsZXMvYnVmZmVyLXJldmVyc2UvaW5kZXguanM/NGE4MCJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJldmVyc2UgKHNyYykge1xuICB2YXIgYnVmZmVyID0gbmV3IEJ1ZmZlcihzcmMubGVuZ3RoKVxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gc3JjLmxlbmd0aCAtIDE7IGkgPD0gajsgKytpLCAtLWopIHtcbiAgICBidWZmZXJbaV0gPSBzcmNbal1cbiAgICBidWZmZXJbal0gPSBzcmNbaV1cbiAgfVxuXG4gIHJldHVybiBidWZmZXJcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/buffer-reverse@1.0.1/node_modules/buffer-reverse/index.js\n");

/***/ })

};
;