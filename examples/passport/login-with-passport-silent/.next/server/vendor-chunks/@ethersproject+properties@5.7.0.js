"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@ethersproject+properties@5.7.0";
exports.ids = ["vendor-chunks/@ethersproject+properties@5.7.0"];
exports.modules = {

/***/ "(ssr)/../../../node_modules/.pnpm/@ethersproject+properties@5.7.0/node_modules/@ethersproject/properties/lib.esm/_version.js":
/*!******************************************************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/@ethersproject+properties@5.7.0/node_modules/@ethersproject/properties/lib.esm/_version.js ***!
  \******************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   version: () => (/* binding */ version)\n/* harmony export */ });\nconst version = \"properties/5.7.0\";\n//# sourceMappingURL=_version.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BldGhlcnNwcm9qZWN0K3Byb3BlcnRpZXNANS43LjAvbm9kZV9tb2R1bGVzL0BldGhlcnNwcm9qZWN0L3Byb3BlcnRpZXMvbGliLmVzbS9fdmVyc2lvbi5qcyIsIm1hcHBpbmdzIjoiOzs7O0FBQU87QUFDUCIsInNvdXJjZXMiOlsid2VicGFjazovL0BleGFtcGxlcy9sb2dpbi13aXRoLXBhc3Nwb3J0LXNpbGVudC8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQGV0aGVyc3Byb2plY3QrcHJvcGVydGllc0A1LjcuMC9ub2RlX21vZHVsZXMvQGV0aGVyc3Byb2plY3QvcHJvcGVydGllcy9saWIuZXNtL192ZXJzaW9uLmpzP2JmYmUiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IHZlcnNpb24gPSBcInByb3BlcnRpZXMvNS43LjBcIjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPV92ZXJzaW9uLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/@ethersproject+properties@5.7.0/node_modules/@ethersproject/properties/lib.esm/_version.js\n");

/***/ }),

/***/ "(ssr)/../../../node_modules/.pnpm/@ethersproject+properties@5.7.0/node_modules/@ethersproject/properties/lib.esm/index.js":
/*!***************************************************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/@ethersproject+properties@5.7.0/node_modules/@ethersproject/properties/lib.esm/index.js ***!
  \***************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Description: () => (/* binding */ Description),\n/* harmony export */   checkProperties: () => (/* binding */ checkProperties),\n/* harmony export */   deepCopy: () => (/* binding */ deepCopy),\n/* harmony export */   defineReadOnly: () => (/* binding */ defineReadOnly),\n/* harmony export */   getStatic: () => (/* binding */ getStatic),\n/* harmony export */   resolveProperties: () => (/* binding */ resolveProperties),\n/* harmony export */   shallowCopy: () => (/* binding */ shallowCopy)\n/* harmony export */ });\n/* harmony import */ var _ethersproject_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ethersproject/logger */ \"(ssr)/../../../node_modules/.pnpm/@ethersproject+logger@5.7.0/node_modules/@ethersproject/logger/lib.esm/index.js\");\n/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_version */ \"(ssr)/../../../node_modules/.pnpm/@ethersproject+properties@5.7.0/node_modules/@ethersproject/properties/lib.esm/_version.js\");\n\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\n\n\nconst logger = new _ethersproject_logger__WEBPACK_IMPORTED_MODULE_0__.Logger(_version__WEBPACK_IMPORTED_MODULE_1__.version);\nfunction defineReadOnly(object, name, value) {\n    Object.defineProperty(object, name, {\n        enumerable: true,\n        value: value,\n        writable: false,\n    });\n}\n// Crawl up the constructor chain to find a static method\nfunction getStatic(ctor, key) {\n    for (let i = 0; i < 32; i++) {\n        if (ctor[key]) {\n            return ctor[key];\n        }\n        if (!ctor.prototype || typeof (ctor.prototype) !== \"object\") {\n            break;\n        }\n        ctor = Object.getPrototypeOf(ctor.prototype).constructor;\n    }\n    return null;\n}\nfunction resolveProperties(object) {\n    return __awaiter(this, void 0, void 0, function* () {\n        const promises = Object.keys(object).map((key) => {\n            const value = object[key];\n            return Promise.resolve(value).then((v) => ({ key: key, value: v }));\n        });\n        const results = yield Promise.all(promises);\n        return results.reduce((accum, result) => {\n            accum[(result.key)] = result.value;\n            return accum;\n        }, {});\n    });\n}\nfunction checkProperties(object, properties) {\n    if (!object || typeof (object) !== \"object\") {\n        logger.throwArgumentError(\"invalid object\", \"object\", object);\n    }\n    Object.keys(object).forEach((key) => {\n        if (!properties[key]) {\n            logger.throwArgumentError(\"invalid object key - \" + key, \"transaction:\" + key, object);\n        }\n    });\n}\nfunction shallowCopy(object) {\n    const result = {};\n    for (const key in object) {\n        result[key] = object[key];\n    }\n    return result;\n}\nconst opaque = { bigint: true, boolean: true, \"function\": true, number: true, string: true };\nfunction _isFrozen(object) {\n    // Opaque objects are not mutable, so safe to copy by assignment\n    if (object === undefined || object === null || opaque[typeof (object)]) {\n        return true;\n    }\n    if (Array.isArray(object) || typeof (object) === \"object\") {\n        if (!Object.isFrozen(object)) {\n            return false;\n        }\n        const keys = Object.keys(object);\n        for (let i = 0; i < keys.length; i++) {\n            let value = null;\n            try {\n                value = object[keys[i]];\n            }\n            catch (error) {\n                // If accessing a value triggers an error, it is a getter\n                // designed to do so (e.g. Result) and is therefore \"frozen\"\n                continue;\n            }\n            if (!_isFrozen(value)) {\n                return false;\n            }\n        }\n        return true;\n    }\n    return logger.throwArgumentError(`Cannot deepCopy ${typeof (object)}`, \"object\", object);\n}\n// Returns a new copy of object, such that no properties may be replaced.\n// New properties may be added only to objects.\nfunction _deepCopy(object) {\n    if (_isFrozen(object)) {\n        return object;\n    }\n    // Arrays are mutable, so we need to create a copy\n    if (Array.isArray(object)) {\n        return Object.freeze(object.map((item) => deepCopy(item)));\n    }\n    if (typeof (object) === \"object\") {\n        const result = {};\n        for (const key in object) {\n            const value = object[key];\n            if (value === undefined) {\n                continue;\n            }\n            defineReadOnly(result, key, deepCopy(value));\n        }\n        return result;\n    }\n    return logger.throwArgumentError(`Cannot deepCopy ${typeof (object)}`, \"object\", object);\n}\nfunction deepCopy(object) {\n    return _deepCopy(object);\n}\nclass Description {\n    constructor(info) {\n        for (const key in info) {\n            this[key] = deepCopy(info[key]);\n        }\n    }\n}\n//# sourceMappingURL=index.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BldGhlcnNwcm9qZWN0K3Byb3BlcnRpZXNANS43LjAvbm9kZV9tb2R1bGVzL0BldGhlcnNwcm9qZWN0L3Byb3BlcnRpZXMvbGliLmVzbS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBYTtBQUNiLGlCQUFpQixTQUFJLElBQUksU0FBSTtBQUM3Qiw0QkFBNEIsK0RBQStELGlCQUFpQjtBQUM1RztBQUNBLG9DQUFvQyxNQUFNLCtCQUErQixZQUFZO0FBQ3JGLG1DQUFtQyxNQUFNLG1DQUFtQyxZQUFZO0FBQ3hGLGdDQUFnQztBQUNoQztBQUNBLEtBQUs7QUFDTDtBQUMrQztBQUNWO0FBQ3JDLG1CQUFtQix5REFBTSxDQUFDLDZDQUFPO0FBQzFCO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNPO0FBQ1Asb0JBQW9CLFFBQVE7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBLHlEQUF5RCxvQkFBb0I7QUFDN0UsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUyxJQUFJO0FBQ2IsS0FBSztBQUNMO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGlCQUFpQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3REFBd0QsZ0JBQWdCO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0RBQXdELGdCQUFnQjtBQUN4RTtBQUNPO0FBQ1A7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZXhhbXBsZXMvbG9naW4td2l0aC1wYXNzcG9ydC1zaWxlbnQvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BldGhlcnNwcm9qZWN0K3Byb3BlcnRpZXNANS43LjAvbm9kZV9tb2R1bGVzL0BldGhlcnNwcm9qZWN0L3Byb3BlcnRpZXMvbGliLmVzbS9pbmRleC5qcz9lZmY1Il0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiQGV0aGVyc3Byb2plY3QvbG9nZ2VyXCI7XG5pbXBvcnQgeyB2ZXJzaW9uIH0gZnJvbSBcIi4vX3ZlcnNpb25cIjtcbmNvbnN0IGxvZ2dlciA9IG5ldyBMb2dnZXIodmVyc2lvbik7XG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lUmVhZE9ubHkob2JqZWN0LCBuYW1lLCB2YWx1ZSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIG5hbWUsIHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgfSk7XG59XG4vLyBDcmF3bCB1cCB0aGUgY29uc3RydWN0b3IgY2hhaW4gdG8gZmluZCBhIHN0YXRpYyBtZXRob2RcbmV4cG9ydCBmdW5jdGlvbiBnZXRTdGF0aWMoY3Rvciwga2V5KSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzMjsgaSsrKSB7XG4gICAgICAgIGlmIChjdG9yW2tleV0pIHtcbiAgICAgICAgICAgIHJldHVybiBjdG9yW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjdG9yLnByb3RvdHlwZSB8fCB0eXBlb2YgKGN0b3IucHJvdG90eXBlKSAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY3RvciA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjdG9yLnByb3RvdHlwZSkuY29uc3RydWN0b3I7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQcm9wZXJ0aWVzKG9iamVjdCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2VzID0gT2JqZWN0LmtleXMob2JqZWN0KS5tYXAoKGtleSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oKHYpID0+ICh7IGtleToga2V5LCB2YWx1ZTogdiB9KSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZXN1bHRzID0geWllbGQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cy5yZWR1Y2UoKGFjY3VtLCByZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGFjY3VtWyhyZXN1bHQua2V5KV0gPSByZXN1bHQudmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gYWNjdW07XG4gICAgICAgIH0sIHt9KTtcbiAgICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1Byb3BlcnRpZXMob2JqZWN0LCBwcm9wZXJ0aWVzKSB7XG4gICAgaWYgKCFvYmplY3QgfHwgdHlwZW9mIChvYmplY3QpICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIGxvZ2dlci50aHJvd0FyZ3VtZW50RXJyb3IoXCJpbnZhbGlkIG9iamVjdFwiLCBcIm9iamVjdFwiLCBvYmplY3QpO1xuICAgIH1cbiAgICBPYmplY3Qua2V5cyhvYmplY3QpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICBpZiAoIXByb3BlcnRpZXNba2V5XSkge1xuICAgICAgICAgICAgbG9nZ2VyLnRocm93QXJndW1lbnRFcnJvcihcImludmFsaWQgb2JqZWN0IGtleSAtIFwiICsga2V5LCBcInRyYW5zYWN0aW9uOlwiICsga2V5LCBvYmplY3QpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gc2hhbGxvd0NvcHkob2JqZWN0KSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gb2JqZWN0W2tleV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5jb25zdCBvcGFxdWUgPSB7IGJpZ2ludDogdHJ1ZSwgYm9vbGVhbjogdHJ1ZSwgXCJmdW5jdGlvblwiOiB0cnVlLCBudW1iZXI6IHRydWUsIHN0cmluZzogdHJ1ZSB9O1xuZnVuY3Rpb24gX2lzRnJvemVuKG9iamVjdCkge1xuICAgIC8vIE9wYXF1ZSBvYmplY3RzIGFyZSBub3QgbXV0YWJsZSwgc28gc2FmZSB0byBjb3B5IGJ5IGFzc2lnbm1lbnRcbiAgICBpZiAob2JqZWN0ID09PSB1bmRlZmluZWQgfHwgb2JqZWN0ID09PSBudWxsIHx8IG9wYXF1ZVt0eXBlb2YgKG9iamVjdCldKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShvYmplY3QpIHx8IHR5cGVvZiAob2JqZWN0KSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBpZiAoIU9iamVjdC5pc0Zyb3plbihvYmplY3QpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBvYmplY3Rba2V5c1tpXV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBhY2Nlc3NpbmcgYSB2YWx1ZSB0cmlnZ2VycyBhbiBlcnJvciwgaXQgaXMgYSBnZXR0ZXJcbiAgICAgICAgICAgICAgICAvLyBkZXNpZ25lZCB0byBkbyBzbyAoZS5nLiBSZXN1bHQpIGFuZCBpcyB0aGVyZWZvcmUgXCJmcm96ZW5cIlxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFfaXNGcm96ZW4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gbG9nZ2VyLnRocm93QXJndW1lbnRFcnJvcihgQ2Fubm90IGRlZXBDb3B5ICR7dHlwZW9mIChvYmplY3QpfWAsIFwib2JqZWN0XCIsIG9iamVjdCk7XG59XG4vLyBSZXR1cm5zIGEgbmV3IGNvcHkgb2Ygb2JqZWN0LCBzdWNoIHRoYXQgbm8gcHJvcGVydGllcyBtYXkgYmUgcmVwbGFjZWQuXG4vLyBOZXcgcHJvcGVydGllcyBtYXkgYmUgYWRkZWQgb25seSB0byBvYmplY3RzLlxuZnVuY3Rpb24gX2RlZXBDb3B5KG9iamVjdCkge1xuICAgIGlmIChfaXNGcm96ZW4ob2JqZWN0KSkge1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH1cbiAgICAvLyBBcnJheXMgYXJlIG11dGFibGUsIHNvIHdlIG5lZWQgdG8gY3JlYXRlIGEgY29weVxuICAgIGlmIChBcnJheS5pc0FycmF5KG9iamVjdCkpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcmVlemUob2JqZWN0Lm1hcCgoaXRlbSkgPT4gZGVlcENvcHkoaXRlbSkpKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiAob2JqZWN0KSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG9iamVjdFtrZXldO1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmluZVJlYWRPbmx5KHJlc3VsdCwga2V5LCBkZWVwQ29weSh2YWx1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIHJldHVybiBsb2dnZXIudGhyb3dBcmd1bWVudEVycm9yKGBDYW5ub3QgZGVlcENvcHkgJHt0eXBlb2YgKG9iamVjdCl9YCwgXCJvYmplY3RcIiwgb2JqZWN0KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkZWVwQ29weShvYmplY3QpIHtcbiAgICByZXR1cm4gX2RlZXBDb3B5KG9iamVjdCk7XG59XG5leHBvcnQgY2xhc3MgRGVzY3JpcHRpb24ge1xuICAgIGNvbnN0cnVjdG9yKGluZm8pIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gaW5mbykge1xuICAgICAgICAgICAgdGhpc1trZXldID0gZGVlcENvcHkoaW5mb1trZXldKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/@ethersproject+properties@5.7.0/node_modules/@ethersproject/properties/lib.esm/index.js\n");

/***/ })

};
;