"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@ethersproject+strings@5.7.0";
exports.ids = ["vendor-chunks/@ethersproject+strings@5.7.0"];
exports.modules = {

/***/ "(ssr)/../../../node_modules/.pnpm/@ethersproject+strings@5.7.0/node_modules/@ethersproject/strings/lib.esm/_version.js":
/*!************************************************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/@ethersproject+strings@5.7.0/node_modules/@ethersproject/strings/lib.esm/_version.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   version: () => (/* binding */ version)\n/* harmony export */ });\nconst version = \"strings/5.7.0\";\n//# sourceMappingURL=_version.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BldGhlcnNwcm9qZWN0K3N0cmluZ3NANS43LjAvbm9kZV9tb2R1bGVzL0BldGhlcnNwcm9qZWN0L3N0cmluZ3MvbGliLmVzbS9fdmVyc2lvbi5qcyIsIm1hcHBpbmdzIjoiOzs7O0FBQU87QUFDUCIsInNvdXJjZXMiOlsid2VicGFjazovL0BleGFtcGxlcy9sb2dpbi13aXRoLXBhc3Nwb3J0LWd1YXJkaWFuLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9AZXRoZXJzcHJvamVjdCtzdHJpbmdzQDUuNy4wL25vZGVfbW9kdWxlcy9AZXRoZXJzcHJvamVjdC9zdHJpbmdzL2xpYi5lc20vX3ZlcnNpb24uanM/ZjZmOCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgdmVyc2lvbiA9IFwic3RyaW5ncy81LjcuMFwiO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9X3ZlcnNpb24uanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/@ethersproject+strings@5.7.0/node_modules/@ethersproject/strings/lib.esm/_version.js\n");

/***/ }),

/***/ "(ssr)/../../../node_modules/.pnpm/@ethersproject+strings@5.7.0/node_modules/@ethersproject/strings/lib.esm/utf8.js":
/*!********************************************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/@ethersproject+strings@5.7.0/node_modules/@ethersproject/strings/lib.esm/utf8.js ***!
  \********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   UnicodeNormalizationForm: () => (/* binding */ UnicodeNormalizationForm),\n/* harmony export */   Utf8ErrorFuncs: () => (/* binding */ Utf8ErrorFuncs),\n/* harmony export */   Utf8ErrorReason: () => (/* binding */ Utf8ErrorReason),\n/* harmony export */   _toEscapedUtf8String: () => (/* binding */ _toEscapedUtf8String),\n/* harmony export */   _toUtf8String: () => (/* binding */ _toUtf8String),\n/* harmony export */   toUtf8Bytes: () => (/* binding */ toUtf8Bytes),\n/* harmony export */   toUtf8CodePoints: () => (/* binding */ toUtf8CodePoints),\n/* harmony export */   toUtf8String: () => (/* binding */ toUtf8String)\n/* harmony export */ });\n/* harmony import */ var _ethersproject_bytes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ethersproject/bytes */ \"(ssr)/../../../node_modules/.pnpm/@ethersproject+bytes@5.7.0/node_modules/@ethersproject/bytes/lib.esm/index.js\");\n/* harmony import */ var _ethersproject_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ethersproject/logger */ \"(ssr)/../../../node_modules/.pnpm/@ethersproject+logger@5.7.0/node_modules/@ethersproject/logger/lib.esm/index.js\");\n/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_version */ \"(ssr)/../../../node_modules/.pnpm/@ethersproject+strings@5.7.0/node_modules/@ethersproject/strings/lib.esm/_version.js\");\n\n\n\n\nconst logger = new _ethersproject_logger__WEBPACK_IMPORTED_MODULE_0__.Logger(_version__WEBPACK_IMPORTED_MODULE_1__.version);\n///////////////////////////////\nvar UnicodeNormalizationForm;\n(function (UnicodeNormalizationForm) {\n    UnicodeNormalizationForm[\"current\"] = \"\";\n    UnicodeNormalizationForm[\"NFC\"] = \"NFC\";\n    UnicodeNormalizationForm[\"NFD\"] = \"NFD\";\n    UnicodeNormalizationForm[\"NFKC\"] = \"NFKC\";\n    UnicodeNormalizationForm[\"NFKD\"] = \"NFKD\";\n})(UnicodeNormalizationForm || (UnicodeNormalizationForm = {}));\n;\nvar Utf8ErrorReason;\n(function (Utf8ErrorReason) {\n    // A continuation byte was present where there was nothing to continue\n    // - offset = the index the codepoint began in\n    Utf8ErrorReason[\"UNEXPECTED_CONTINUE\"] = \"unexpected continuation byte\";\n    // An invalid (non-continuation) byte to start a UTF-8 codepoint was found\n    // - offset = the index the codepoint began in\n    Utf8ErrorReason[\"BAD_PREFIX\"] = \"bad codepoint prefix\";\n    // The string is too short to process the expected codepoint\n    // - offset = the index the codepoint began in\n    Utf8ErrorReason[\"OVERRUN\"] = \"string overrun\";\n    // A missing continuation byte was expected but not found\n    // - offset = the index the continuation byte was expected at\n    Utf8ErrorReason[\"MISSING_CONTINUE\"] = \"missing continuation byte\";\n    // The computed code point is outside the range for UTF-8\n    // - offset       = start of this codepoint\n    // - badCodepoint = the computed codepoint; outside the UTF-8 range\n    Utf8ErrorReason[\"OUT_OF_RANGE\"] = \"out of UTF-8 range\";\n    // UTF-8 strings may not contain UTF-16 surrogate pairs\n    // - offset       = start of this codepoint\n    // - badCodepoint = the computed codepoint; inside the UTF-16 surrogate range\n    Utf8ErrorReason[\"UTF16_SURROGATE\"] = \"UTF-16 surrogate\";\n    // The string is an overlong representation\n    // - offset       = start of this codepoint\n    // - badCodepoint = the computed codepoint; already bounds checked\n    Utf8ErrorReason[\"OVERLONG\"] = \"overlong representation\";\n})(Utf8ErrorReason || (Utf8ErrorReason = {}));\n;\nfunction errorFunc(reason, offset, bytes, output, badCodepoint) {\n    return logger.throwArgumentError(`invalid codepoint at offset ${offset}; ${reason}`, \"bytes\", bytes);\n}\nfunction ignoreFunc(reason, offset, bytes, output, badCodepoint) {\n    // If there is an invalid prefix (including stray continuation), skip any additional continuation bytes\n    if (reason === Utf8ErrorReason.BAD_PREFIX || reason === Utf8ErrorReason.UNEXPECTED_CONTINUE) {\n        let i = 0;\n        for (let o = offset + 1; o < bytes.length; o++) {\n            if (bytes[o] >> 6 !== 0x02) {\n                break;\n            }\n            i++;\n        }\n        return i;\n    }\n    // This byte runs us past the end of the string, so just jump to the end\n    // (but the first byte was read already read and therefore skipped)\n    if (reason === Utf8ErrorReason.OVERRUN) {\n        return bytes.length - offset - 1;\n    }\n    // Nothing to skip\n    return 0;\n}\nfunction replaceFunc(reason, offset, bytes, output, badCodepoint) {\n    // Overlong representations are otherwise \"valid\" code points; just non-deistingtished\n    if (reason === Utf8ErrorReason.OVERLONG) {\n        output.push(badCodepoint);\n        return 0;\n    }\n    // Put the replacement character into the output\n    output.push(0xfffd);\n    // Otherwise, process as if ignoring errors\n    return ignoreFunc(reason, offset, bytes, output, badCodepoint);\n}\n// Common error handing strategies\nconst Utf8ErrorFuncs = Object.freeze({\n    error: errorFunc,\n    ignore: ignoreFunc,\n    replace: replaceFunc\n});\n// http://stackoverflow.com/questions/13356493/decode-utf-8-with-javascript#13691499\nfunction getUtf8CodePoints(bytes, onError) {\n    if (onError == null) {\n        onError = Utf8ErrorFuncs.error;\n    }\n    bytes = (0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_2__.arrayify)(bytes);\n    const result = [];\n    let i = 0;\n    // Invalid bytes are ignored\n    while (i < bytes.length) {\n        const c = bytes[i++];\n        // 0xxx xxxx\n        if (c >> 7 === 0) {\n            result.push(c);\n            continue;\n        }\n        // Multibyte; how many bytes left for this character?\n        let extraLength = null;\n        let overlongMask = null;\n        // 110x xxxx 10xx xxxx\n        if ((c & 0xe0) === 0xc0) {\n            extraLength = 1;\n            overlongMask = 0x7f;\n            // 1110 xxxx 10xx xxxx 10xx xxxx\n        }\n        else if ((c & 0xf0) === 0xe0) {\n            extraLength = 2;\n            overlongMask = 0x7ff;\n            // 1111 0xxx 10xx xxxx 10xx xxxx 10xx xxxx\n        }\n        else if ((c & 0xf8) === 0xf0) {\n            extraLength = 3;\n            overlongMask = 0xffff;\n        }\n        else {\n            if ((c & 0xc0) === 0x80) {\n                i += onError(Utf8ErrorReason.UNEXPECTED_CONTINUE, i - 1, bytes, result);\n            }\n            else {\n                i += onError(Utf8ErrorReason.BAD_PREFIX, i - 1, bytes, result);\n            }\n            continue;\n        }\n        // Do we have enough bytes in our data?\n        if (i - 1 + extraLength >= bytes.length) {\n            i += onError(Utf8ErrorReason.OVERRUN, i - 1, bytes, result);\n            continue;\n        }\n        // Remove the length prefix from the char\n        let res = c & ((1 << (8 - extraLength - 1)) - 1);\n        for (let j = 0; j < extraLength; j++) {\n            let nextChar = bytes[i];\n            // Invalid continuation byte\n            if ((nextChar & 0xc0) != 0x80) {\n                i += onError(Utf8ErrorReason.MISSING_CONTINUE, i, bytes, result);\n                res = null;\n                break;\n            }\n            ;\n            res = (res << 6) | (nextChar & 0x3f);\n            i++;\n        }\n        // See above loop for invalid continuation byte\n        if (res === null) {\n            continue;\n        }\n        // Maximum code point\n        if (res > 0x10ffff) {\n            i += onError(Utf8ErrorReason.OUT_OF_RANGE, i - 1 - extraLength, bytes, result, res);\n            continue;\n        }\n        // Reserved for UTF-16 surrogate halves\n        if (res >= 0xd800 && res <= 0xdfff) {\n            i += onError(Utf8ErrorReason.UTF16_SURROGATE, i - 1 - extraLength, bytes, result, res);\n            continue;\n        }\n        // Check for overlong sequences (more bytes than needed)\n        if (res <= overlongMask) {\n            i += onError(Utf8ErrorReason.OVERLONG, i - 1 - extraLength, bytes, result, res);\n            continue;\n        }\n        result.push(res);\n    }\n    return result;\n}\n// http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array\nfunction toUtf8Bytes(str, form = UnicodeNormalizationForm.current) {\n    if (form != UnicodeNormalizationForm.current) {\n        logger.checkNormalize();\n        str = str.normalize(form);\n    }\n    let result = [];\n    for (let i = 0; i < str.length; i++) {\n        const c = str.charCodeAt(i);\n        if (c < 0x80) {\n            result.push(c);\n        }\n        else if (c < 0x800) {\n            result.push((c >> 6) | 0xc0);\n            result.push((c & 0x3f) | 0x80);\n        }\n        else if ((c & 0xfc00) == 0xd800) {\n            i++;\n            const c2 = str.charCodeAt(i);\n            if (i >= str.length || (c2 & 0xfc00) !== 0xdc00) {\n                throw new Error(\"invalid utf-8 string\");\n            }\n            // Surrogate Pair\n            const pair = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);\n            result.push((pair >> 18) | 0xf0);\n            result.push(((pair >> 12) & 0x3f) | 0x80);\n            result.push(((pair >> 6) & 0x3f) | 0x80);\n            result.push((pair & 0x3f) | 0x80);\n        }\n        else {\n            result.push((c >> 12) | 0xe0);\n            result.push(((c >> 6) & 0x3f) | 0x80);\n            result.push((c & 0x3f) | 0x80);\n        }\n    }\n    return (0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_2__.arrayify)(result);\n}\n;\nfunction escapeChar(value) {\n    const hex = (\"0000\" + value.toString(16));\n    return \"\\\\u\" + hex.substring(hex.length - 4);\n}\nfunction _toEscapedUtf8String(bytes, onError) {\n    return '\"' + getUtf8CodePoints(bytes, onError).map((codePoint) => {\n        if (codePoint < 256) {\n            switch (codePoint) {\n                case 8: return \"\\\\b\";\n                case 9: return \"\\\\t\";\n                case 10: return \"\\\\n\";\n                case 13: return \"\\\\r\";\n                case 34: return \"\\\\\\\"\";\n                case 92: return \"\\\\\\\\\";\n            }\n            if (codePoint >= 32 && codePoint < 127) {\n                return String.fromCharCode(codePoint);\n            }\n        }\n        if (codePoint <= 0xffff) {\n            return escapeChar(codePoint);\n        }\n        codePoint -= 0x10000;\n        return escapeChar(((codePoint >> 10) & 0x3ff) + 0xd800) + escapeChar((codePoint & 0x3ff) + 0xdc00);\n    }).join(\"\") + '\"';\n}\nfunction _toUtf8String(codePoints) {\n    return codePoints.map((codePoint) => {\n        if (codePoint <= 0xffff) {\n            return String.fromCharCode(codePoint);\n        }\n        codePoint -= 0x10000;\n        return String.fromCharCode((((codePoint >> 10) & 0x3ff) + 0xd800), ((codePoint & 0x3ff) + 0xdc00));\n    }).join(\"\");\n}\nfunction toUtf8String(bytes, onError) {\n    return _toUtf8String(getUtf8CodePoints(bytes, onError));\n}\nfunction toUtf8CodePoints(str, form = UnicodeNormalizationForm.current) {\n    return getUtf8CodePoints(toUtf8Bytes(str, form));\n}\n//# sourceMappingURL=utf8.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BldGhlcnNwcm9qZWN0K3N0cmluZ3NANS43LjAvbm9kZV9tb2R1bGVzL0BldGhlcnNwcm9qZWN0L3N0cmluZ3MvbGliLmVzbS91dGY4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQWE7QUFDbUM7QUFDRDtBQUNWO0FBQ3JDLG1CQUFtQix5REFBTSxDQUFDLDZDQUFPO0FBQ2pDO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLDREQUE0RDtBQUM3RDtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0E7QUFDQSxnREFBZ0Q7QUFDaEQ7QUFDQSxDQUFDLDBDQUEwQztBQUMzQztBQUNBO0FBQ0Esb0VBQW9FLFNBQVMsRUFBRSxPQUFPO0FBQ3RGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsa0JBQWtCO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUVBQW1FO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksOERBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0I7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGlCQUFpQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGdCQUFnQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLDhEQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNPO0FBQ1A7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGV4YW1wbGVzL2xvZ2luLXdpdGgtcGFzc3BvcnQtZ3VhcmRpYW4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BldGhlcnNwcm9qZWN0K3N0cmluZ3NANS43LjAvbm9kZV9tb2R1bGVzL0BldGhlcnNwcm9qZWN0L3N0cmluZ3MvbGliLmVzbS91dGY4LmpzP2M3ZTMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5pbXBvcnQgeyBhcnJheWlmeSB9IGZyb20gXCJAZXRoZXJzcHJvamVjdC9ieXRlc1wiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIkBldGhlcnNwcm9qZWN0L2xvZ2dlclwiO1xuaW1wb3J0IHsgdmVyc2lvbiB9IGZyb20gXCIuL192ZXJzaW9uXCI7XG5jb25zdCBsb2dnZXIgPSBuZXcgTG9nZ2VyKHZlcnNpb24pO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZXhwb3J0IHZhciBVbmljb2RlTm9ybWFsaXphdGlvbkZvcm07XG4oZnVuY3Rpb24gKFVuaWNvZGVOb3JtYWxpemF0aW9uRm9ybSkge1xuICAgIFVuaWNvZGVOb3JtYWxpemF0aW9uRm9ybVtcImN1cnJlbnRcIl0gPSBcIlwiO1xuICAgIFVuaWNvZGVOb3JtYWxpemF0aW9uRm9ybVtcIk5GQ1wiXSA9IFwiTkZDXCI7XG4gICAgVW5pY29kZU5vcm1hbGl6YXRpb25Gb3JtW1wiTkZEXCJdID0gXCJORkRcIjtcbiAgICBVbmljb2RlTm9ybWFsaXphdGlvbkZvcm1bXCJORktDXCJdID0gXCJORktDXCI7XG4gICAgVW5pY29kZU5vcm1hbGl6YXRpb25Gb3JtW1wiTkZLRFwiXSA9IFwiTkZLRFwiO1xufSkoVW5pY29kZU5vcm1hbGl6YXRpb25Gb3JtIHx8IChVbmljb2RlTm9ybWFsaXphdGlvbkZvcm0gPSB7fSkpO1xuO1xuZXhwb3J0IHZhciBVdGY4RXJyb3JSZWFzb247XG4oZnVuY3Rpb24gKFV0ZjhFcnJvclJlYXNvbikge1xuICAgIC8vIEEgY29udGludWF0aW9uIGJ5dGUgd2FzIHByZXNlbnQgd2hlcmUgdGhlcmUgd2FzIG5vdGhpbmcgdG8gY29udGludWVcbiAgICAvLyAtIG9mZnNldCA9IHRoZSBpbmRleCB0aGUgY29kZXBvaW50IGJlZ2FuIGluXG4gICAgVXRmOEVycm9yUmVhc29uW1wiVU5FWFBFQ1RFRF9DT05USU5VRVwiXSA9IFwidW5leHBlY3RlZCBjb250aW51YXRpb24gYnl0ZVwiO1xuICAgIC8vIEFuIGludmFsaWQgKG5vbi1jb250aW51YXRpb24pIGJ5dGUgdG8gc3RhcnQgYSBVVEYtOCBjb2RlcG9pbnQgd2FzIGZvdW5kXG4gICAgLy8gLSBvZmZzZXQgPSB0aGUgaW5kZXggdGhlIGNvZGVwb2ludCBiZWdhbiBpblxuICAgIFV0ZjhFcnJvclJlYXNvbltcIkJBRF9QUkVGSVhcIl0gPSBcImJhZCBjb2RlcG9pbnQgcHJlZml4XCI7XG4gICAgLy8gVGhlIHN0cmluZyBpcyB0b28gc2hvcnQgdG8gcHJvY2VzcyB0aGUgZXhwZWN0ZWQgY29kZXBvaW50XG4gICAgLy8gLSBvZmZzZXQgPSB0aGUgaW5kZXggdGhlIGNvZGVwb2ludCBiZWdhbiBpblxuICAgIFV0ZjhFcnJvclJlYXNvbltcIk9WRVJSVU5cIl0gPSBcInN0cmluZyBvdmVycnVuXCI7XG4gICAgLy8gQSBtaXNzaW5nIGNvbnRpbnVhdGlvbiBieXRlIHdhcyBleHBlY3RlZCBidXQgbm90IGZvdW5kXG4gICAgLy8gLSBvZmZzZXQgPSB0aGUgaW5kZXggdGhlIGNvbnRpbnVhdGlvbiBieXRlIHdhcyBleHBlY3RlZCBhdFxuICAgIFV0ZjhFcnJvclJlYXNvbltcIk1JU1NJTkdfQ09OVElOVUVcIl0gPSBcIm1pc3NpbmcgY29udGludWF0aW9uIGJ5dGVcIjtcbiAgICAvLyBUaGUgY29tcHV0ZWQgY29kZSBwb2ludCBpcyBvdXRzaWRlIHRoZSByYW5nZSBmb3IgVVRGLThcbiAgICAvLyAtIG9mZnNldCAgICAgICA9IHN0YXJ0IG9mIHRoaXMgY29kZXBvaW50XG4gICAgLy8gLSBiYWRDb2RlcG9pbnQgPSB0aGUgY29tcHV0ZWQgY29kZXBvaW50OyBvdXRzaWRlIHRoZSBVVEYtOCByYW5nZVxuICAgIFV0ZjhFcnJvclJlYXNvbltcIk9VVF9PRl9SQU5HRVwiXSA9IFwib3V0IG9mIFVURi04IHJhbmdlXCI7XG4gICAgLy8gVVRGLTggc3RyaW5ncyBtYXkgbm90IGNvbnRhaW4gVVRGLTE2IHN1cnJvZ2F0ZSBwYWlyc1xuICAgIC8vIC0gb2Zmc2V0ICAgICAgID0gc3RhcnQgb2YgdGhpcyBjb2RlcG9pbnRcbiAgICAvLyAtIGJhZENvZGVwb2ludCA9IHRoZSBjb21wdXRlZCBjb2RlcG9pbnQ7IGluc2lkZSB0aGUgVVRGLTE2IHN1cnJvZ2F0ZSByYW5nZVxuICAgIFV0ZjhFcnJvclJlYXNvbltcIlVURjE2X1NVUlJPR0FURVwiXSA9IFwiVVRGLTE2IHN1cnJvZ2F0ZVwiO1xuICAgIC8vIFRoZSBzdHJpbmcgaXMgYW4gb3ZlcmxvbmcgcmVwcmVzZW50YXRpb25cbiAgICAvLyAtIG9mZnNldCAgICAgICA9IHN0YXJ0IG9mIHRoaXMgY29kZXBvaW50XG4gICAgLy8gLSBiYWRDb2RlcG9pbnQgPSB0aGUgY29tcHV0ZWQgY29kZXBvaW50OyBhbHJlYWR5IGJvdW5kcyBjaGVja2VkXG4gICAgVXRmOEVycm9yUmVhc29uW1wiT1ZFUkxPTkdcIl0gPSBcIm92ZXJsb25nIHJlcHJlc2VudGF0aW9uXCI7XG59KShVdGY4RXJyb3JSZWFzb24gfHwgKFV0ZjhFcnJvclJlYXNvbiA9IHt9KSk7XG47XG5mdW5jdGlvbiBlcnJvckZ1bmMocmVhc29uLCBvZmZzZXQsIGJ5dGVzLCBvdXRwdXQsIGJhZENvZGVwb2ludCkge1xuICAgIHJldHVybiBsb2dnZXIudGhyb3dBcmd1bWVudEVycm9yKGBpbnZhbGlkIGNvZGVwb2ludCBhdCBvZmZzZXQgJHtvZmZzZXR9OyAke3JlYXNvbn1gLCBcImJ5dGVzXCIsIGJ5dGVzKTtcbn1cbmZ1bmN0aW9uIGlnbm9yZUZ1bmMocmVhc29uLCBvZmZzZXQsIGJ5dGVzLCBvdXRwdXQsIGJhZENvZGVwb2ludCkge1xuICAgIC8vIElmIHRoZXJlIGlzIGFuIGludmFsaWQgcHJlZml4IChpbmNsdWRpbmcgc3RyYXkgY29udGludWF0aW9uKSwgc2tpcCBhbnkgYWRkaXRpb25hbCBjb250aW51YXRpb24gYnl0ZXNcbiAgICBpZiAocmVhc29uID09PSBVdGY4RXJyb3JSZWFzb24uQkFEX1BSRUZJWCB8fCByZWFzb24gPT09IFV0ZjhFcnJvclJlYXNvbi5VTkVYUEVDVEVEX0NPTlRJTlVFKSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZm9yIChsZXQgbyA9IG9mZnNldCArIDE7IG8gPCBieXRlcy5sZW5ndGg7IG8rKykge1xuICAgICAgICAgICAgaWYgKGJ5dGVzW29dID4+IDYgIT09IDB4MDIpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaTtcbiAgICB9XG4gICAgLy8gVGhpcyBieXRlIHJ1bnMgdXMgcGFzdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHNvIGp1c3QganVtcCB0byB0aGUgZW5kXG4gICAgLy8gKGJ1dCB0aGUgZmlyc3QgYnl0ZSB3YXMgcmVhZCBhbHJlYWR5IHJlYWQgYW5kIHRoZXJlZm9yZSBza2lwcGVkKVxuICAgIGlmIChyZWFzb24gPT09IFV0ZjhFcnJvclJlYXNvbi5PVkVSUlVOKSB7XG4gICAgICAgIHJldHVybiBieXRlcy5sZW5ndGggLSBvZmZzZXQgLSAxO1xuICAgIH1cbiAgICAvLyBOb3RoaW5nIHRvIHNraXBcbiAgICByZXR1cm4gMDtcbn1cbmZ1bmN0aW9uIHJlcGxhY2VGdW5jKHJlYXNvbiwgb2Zmc2V0LCBieXRlcywgb3V0cHV0LCBiYWRDb2RlcG9pbnQpIHtcbiAgICAvLyBPdmVybG9uZyByZXByZXNlbnRhdGlvbnMgYXJlIG90aGVyd2lzZSBcInZhbGlkXCIgY29kZSBwb2ludHM7IGp1c3Qgbm9uLWRlaXN0aW5ndGlzaGVkXG4gICAgaWYgKHJlYXNvbiA9PT0gVXRmOEVycm9yUmVhc29uLk9WRVJMT05HKSB7XG4gICAgICAgIG91dHB1dC5wdXNoKGJhZENvZGVwb2ludCk7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICAvLyBQdXQgdGhlIHJlcGxhY2VtZW50IGNoYXJhY3RlciBpbnRvIHRoZSBvdXRwdXRcbiAgICBvdXRwdXQucHVzaCgweGZmZmQpO1xuICAgIC8vIE90aGVyd2lzZSwgcHJvY2VzcyBhcyBpZiBpZ25vcmluZyBlcnJvcnNcbiAgICByZXR1cm4gaWdub3JlRnVuYyhyZWFzb24sIG9mZnNldCwgYnl0ZXMsIG91dHB1dCwgYmFkQ29kZXBvaW50KTtcbn1cbi8vIENvbW1vbiBlcnJvciBoYW5kaW5nIHN0cmF0ZWdpZXNcbmV4cG9ydCBjb25zdCBVdGY4RXJyb3JGdW5jcyA9IE9iamVjdC5mcmVlemUoe1xuICAgIGVycm9yOiBlcnJvckZ1bmMsXG4gICAgaWdub3JlOiBpZ25vcmVGdW5jLFxuICAgIHJlcGxhY2U6IHJlcGxhY2VGdW5jXG59KTtcbi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTMzNTY0OTMvZGVjb2RlLXV0Zi04LXdpdGgtamF2YXNjcmlwdCMxMzY5MTQ5OVxuZnVuY3Rpb24gZ2V0VXRmOENvZGVQb2ludHMoYnl0ZXMsIG9uRXJyb3IpIHtcbiAgICBpZiAob25FcnJvciA9PSBudWxsKSB7XG4gICAgICAgIG9uRXJyb3IgPSBVdGY4RXJyb3JGdW5jcy5lcnJvcjtcbiAgICB9XG4gICAgYnl0ZXMgPSBhcnJheWlmeShieXRlcyk7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgbGV0IGkgPSAwO1xuICAgIC8vIEludmFsaWQgYnl0ZXMgYXJlIGlnbm9yZWRcbiAgICB3aGlsZSAoaSA8IGJ5dGVzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBjID0gYnl0ZXNbaSsrXTtcbiAgICAgICAgLy8gMHh4eCB4eHh4XG4gICAgICAgIGlmIChjID4+IDcgPT09IDApIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGMpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTXVsdGlieXRlOyBob3cgbWFueSBieXRlcyBsZWZ0IGZvciB0aGlzIGNoYXJhY3Rlcj9cbiAgICAgICAgbGV0IGV4dHJhTGVuZ3RoID0gbnVsbDtcbiAgICAgICAgbGV0IG92ZXJsb25nTWFzayA9IG51bGw7XG4gICAgICAgIC8vIDExMHggeHh4eCAxMHh4IHh4eHhcbiAgICAgICAgaWYgKChjICYgMHhlMCkgPT09IDB4YzApIHtcbiAgICAgICAgICAgIGV4dHJhTGVuZ3RoID0gMTtcbiAgICAgICAgICAgIG92ZXJsb25nTWFzayA9IDB4N2Y7XG4gICAgICAgICAgICAvLyAxMTEwIHh4eHggMTB4eCB4eHh4IDEweHggeHh4eFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKChjICYgMHhmMCkgPT09IDB4ZTApIHtcbiAgICAgICAgICAgIGV4dHJhTGVuZ3RoID0gMjtcbiAgICAgICAgICAgIG92ZXJsb25nTWFzayA9IDB4N2ZmO1xuICAgICAgICAgICAgLy8gMTExMSAweHh4IDEweHggeHh4eCAxMHh4IHh4eHggMTB4eCB4eHh4XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoKGMgJiAweGY4KSA9PT0gMHhmMCkge1xuICAgICAgICAgICAgZXh0cmFMZW5ndGggPSAzO1xuICAgICAgICAgICAgb3ZlcmxvbmdNYXNrID0gMHhmZmZmO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKChjICYgMHhjMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgICAgICBpICs9IG9uRXJyb3IoVXRmOEVycm9yUmVhc29uLlVORVhQRUNURURfQ09OVElOVUUsIGkgLSAxLCBieXRlcywgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGkgKz0gb25FcnJvcihVdGY4RXJyb3JSZWFzb24uQkFEX1BSRUZJWCwgaSAtIDEsIGJ5dGVzLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRG8gd2UgaGF2ZSBlbm91Z2ggYnl0ZXMgaW4gb3VyIGRhdGE/XG4gICAgICAgIGlmIChpIC0gMSArIGV4dHJhTGVuZ3RoID49IGJ5dGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgaSArPSBvbkVycm9yKFV0ZjhFcnJvclJlYXNvbi5PVkVSUlVOLCBpIC0gMSwgYnl0ZXMsIHJlc3VsdCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZW1vdmUgdGhlIGxlbmd0aCBwcmVmaXggZnJvbSB0aGUgY2hhclxuICAgICAgICBsZXQgcmVzID0gYyAmICgoMSA8PCAoOCAtIGV4dHJhTGVuZ3RoIC0gMSkpIC0gMSk7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgZXh0cmFMZW5ndGg7IGorKykge1xuICAgICAgICAgICAgbGV0IG5leHRDaGFyID0gYnl0ZXNbaV07XG4gICAgICAgICAgICAvLyBJbnZhbGlkIGNvbnRpbnVhdGlvbiBieXRlXG4gICAgICAgICAgICBpZiAoKG5leHRDaGFyICYgMHhjMCkgIT0gMHg4MCkge1xuICAgICAgICAgICAgICAgIGkgKz0gb25FcnJvcihVdGY4RXJyb3JSZWFzb24uTUlTU0lOR19DT05USU5VRSwgaSwgYnl0ZXMsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgcmVzID0gbnVsbDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDtcbiAgICAgICAgICAgIHJlcyA9IChyZXMgPDwgNikgfCAobmV4dENoYXIgJiAweDNmKTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICAvLyBTZWUgYWJvdmUgbG9vcCBmb3IgaW52YWxpZCBjb250aW51YXRpb24gYnl0ZVxuICAgICAgICBpZiAocmVzID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBNYXhpbXVtIGNvZGUgcG9pbnRcbiAgICAgICAgaWYgKHJlcyA+IDB4MTBmZmZmKSB7XG4gICAgICAgICAgICBpICs9IG9uRXJyb3IoVXRmOEVycm9yUmVhc29uLk9VVF9PRl9SQU5HRSwgaSAtIDEgLSBleHRyYUxlbmd0aCwgYnl0ZXMsIHJlc3VsdCwgcmVzKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJlc2VydmVkIGZvciBVVEYtMTYgc3Vycm9nYXRlIGhhbHZlc1xuICAgICAgICBpZiAocmVzID49IDB4ZDgwMCAmJiByZXMgPD0gMHhkZmZmKSB7XG4gICAgICAgICAgICBpICs9IG9uRXJyb3IoVXRmOEVycm9yUmVhc29uLlVURjE2X1NVUlJPR0FURSwgaSAtIDEgLSBleHRyYUxlbmd0aCwgYnl0ZXMsIHJlc3VsdCwgcmVzKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGZvciBvdmVybG9uZyBzZXF1ZW5jZXMgKG1vcmUgYnl0ZXMgdGhhbiBuZWVkZWQpXG4gICAgICAgIGlmIChyZXMgPD0gb3ZlcmxvbmdNYXNrKSB7XG4gICAgICAgICAgICBpICs9IG9uRXJyb3IoVXRmOEVycm9yUmVhc29uLk9WRVJMT05HLCBpIC0gMSAtIGV4dHJhTGVuZ3RoLCBieXRlcywgcmVzdWx0LCByZXMpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2gocmVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTg3Mjk0MDUvaG93LXRvLWNvbnZlcnQtdXRmOC1zdHJpbmctdG8tYnl0ZS1hcnJheVxuZXhwb3J0IGZ1bmN0aW9uIHRvVXRmOEJ5dGVzKHN0ciwgZm9ybSA9IFVuaWNvZGVOb3JtYWxpemF0aW9uRm9ybS5jdXJyZW50KSB7XG4gICAgaWYgKGZvcm0gIT0gVW5pY29kZU5vcm1hbGl6YXRpb25Gb3JtLmN1cnJlbnQpIHtcbiAgICAgICAgbG9nZ2VyLmNoZWNrTm9ybWFsaXplKCk7XG4gICAgICAgIHN0ciA9IHN0ci5ub3JtYWxpemUoZm9ybSk7XG4gICAgfVxuICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGlmIChjIDwgMHg4MCkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goYyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYyA8IDB4ODAwKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgoYyA+PiA2KSB8IDB4YzApO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goKGMgJiAweDNmKSB8IDB4ODApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKChjICYgMHhmYzAwKSA9PSAweGQ4MDApIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIGNvbnN0IGMyID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgICBpZiAoaSA+PSBzdHIubGVuZ3RoIHx8IChjMiAmIDB4ZmMwMCkgIT09IDB4ZGMwMCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgdXRmLTggc3RyaW5nXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gU3Vycm9nYXRlIFBhaXJcbiAgICAgICAgICAgIGNvbnN0IHBhaXIgPSAweDEwMDAwICsgKChjICYgMHgwM2ZmKSA8PCAxMCkgKyAoYzIgJiAweDAzZmYpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goKHBhaXIgPj4gMTgpIHwgMHhmMCk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgoKHBhaXIgPj4gMTIpICYgMHgzZikgfCAweDgwKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKCgocGFpciA+PiA2KSAmIDB4M2YpIHwgMHg4MCk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgocGFpciAmIDB4M2YpIHwgMHg4MCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgoYyA+PiAxMikgfCAweGUwKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKCgoYyA+PiA2KSAmIDB4M2YpIHwgMHg4MCk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgoYyAmIDB4M2YpIHwgMHg4MCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycmF5aWZ5KHJlc3VsdCk7XG59XG47XG5mdW5jdGlvbiBlc2NhcGVDaGFyKHZhbHVlKSB7XG4gICAgY29uc3QgaGV4ID0gKFwiMDAwMFwiICsgdmFsdWUudG9TdHJpbmcoMTYpKTtcbiAgICByZXR1cm4gXCJcXFxcdVwiICsgaGV4LnN1YnN0cmluZyhoZXgubGVuZ3RoIC0gNCk7XG59XG5leHBvcnQgZnVuY3Rpb24gX3RvRXNjYXBlZFV0ZjhTdHJpbmcoYnl0ZXMsIG9uRXJyb3IpIHtcbiAgICByZXR1cm4gJ1wiJyArIGdldFV0ZjhDb2RlUG9pbnRzKGJ5dGVzLCBvbkVycm9yKS5tYXAoKGNvZGVQb2ludCkgPT4ge1xuICAgICAgICBpZiAoY29kZVBvaW50IDwgMjU2KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGNvZGVQb2ludCkge1xuICAgICAgICAgICAgICAgIGNhc2UgODogcmV0dXJuIFwiXFxcXGJcIjtcbiAgICAgICAgICAgICAgICBjYXNlIDk6IHJldHVybiBcIlxcXFx0XCI7XG4gICAgICAgICAgICAgICAgY2FzZSAxMDogcmV0dXJuIFwiXFxcXG5cIjtcbiAgICAgICAgICAgICAgICBjYXNlIDEzOiByZXR1cm4gXCJcXFxcclwiO1xuICAgICAgICAgICAgICAgIGNhc2UgMzQ6IHJldHVybiBcIlxcXFxcXFwiXCI7XG4gICAgICAgICAgICAgICAgY2FzZSA5MjogcmV0dXJuIFwiXFxcXFxcXFxcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb2RlUG9pbnQgPj0gMzIgJiYgY29kZVBvaW50IDwgMTI3KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZVBvaW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29kZVBvaW50IDw9IDB4ZmZmZikge1xuICAgICAgICAgICAgcmV0dXJuIGVzY2FwZUNoYXIoY29kZVBvaW50KTtcbiAgICAgICAgfVxuICAgICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMDtcbiAgICAgICAgcmV0dXJuIGVzY2FwZUNoYXIoKChjb2RlUG9pbnQgPj4gMTApICYgMHgzZmYpICsgMHhkODAwKSArIGVzY2FwZUNoYXIoKGNvZGVQb2ludCAmIDB4M2ZmKSArIDB4ZGMwMCk7XG4gICAgfSkuam9pbihcIlwiKSArICdcIic7XG59XG5leHBvcnQgZnVuY3Rpb24gX3RvVXRmOFN0cmluZyhjb2RlUG9pbnRzKSB7XG4gICAgcmV0dXJuIGNvZGVQb2ludHMubWFwKChjb2RlUG9pbnQpID0+IHtcbiAgICAgICAgaWYgKGNvZGVQb2ludCA8PSAweGZmZmYpIHtcbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGVQb2ludCk7XG4gICAgICAgIH1cbiAgICAgICAgY29kZVBvaW50IC09IDB4MTAwMDA7XG4gICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKCgoKGNvZGVQb2ludCA+PiAxMCkgJiAweDNmZikgKyAweGQ4MDApLCAoKGNvZGVQb2ludCAmIDB4M2ZmKSArIDB4ZGMwMCkpO1xuICAgIH0pLmpvaW4oXCJcIik7XG59XG5leHBvcnQgZnVuY3Rpb24gdG9VdGY4U3RyaW5nKGJ5dGVzLCBvbkVycm9yKSB7XG4gICAgcmV0dXJuIF90b1V0ZjhTdHJpbmcoZ2V0VXRmOENvZGVQb2ludHMoYnl0ZXMsIG9uRXJyb3IpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB0b1V0ZjhDb2RlUG9pbnRzKHN0ciwgZm9ybSA9IFVuaWNvZGVOb3JtYWxpemF0aW9uRm9ybS5jdXJyZW50KSB7XG4gICAgcmV0dXJuIGdldFV0ZjhDb2RlUG9pbnRzKHRvVXRmOEJ5dGVzKHN0ciwgZm9ybSkpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXRmOC5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/@ethersproject+strings@5.7.0/node_modules/@ethersproject/strings/lib.esm/utf8.js\n");

/***/ })

};
;