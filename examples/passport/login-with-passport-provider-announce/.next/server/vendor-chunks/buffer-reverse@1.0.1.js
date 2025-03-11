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

eval("module.exports = function reverse (src) {\n  var buffer = new Buffer(src.length)\n\n  for (var i = 0, j = src.length - 1; i <= j; ++i, --j) {\n    buffer[i] = src[j]\n    buffer[j] = src[i]\n  }\n\n  return buffer\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2J1ZmZlci1yZXZlcnNlQDEuMC4xL25vZGVfbW9kdWxlcy9idWZmZXItcmV2ZXJzZS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUVBLHNDQUFzQyxRQUFRO0FBQzlDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGV4YW1wbGVzL2xvZ2luLXdpdGgtcGFzc3BvcnQtcHJvdmlkZXItYW5ub3VuY2UvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2J1ZmZlci1yZXZlcnNlQDEuMC4xL25vZGVfbW9kdWxlcy9idWZmZXItcmV2ZXJzZS9pbmRleC5qcz80YTgwIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmV2ZXJzZSAoc3JjKSB7XG4gIHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKHNyYy5sZW5ndGgpXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBzcmMubGVuZ3RoIC0gMTsgaSA8PSBqOyArK2ksIC0taikge1xuICAgIGJ1ZmZlcltpXSA9IHNyY1tqXVxuICAgIGJ1ZmZlcltqXSA9IHNyY1tpXVxuICB9XG5cbiAgcmV0dXJuIGJ1ZmZlclxufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/buffer-reverse@1.0.1/node_modules/buffer-reverse/index.js\n");

/***/ })

};
;