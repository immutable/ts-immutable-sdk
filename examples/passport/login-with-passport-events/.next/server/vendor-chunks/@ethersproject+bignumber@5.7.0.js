"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@ethersproject+bignumber@5.7.0";
exports.ids = ["vendor-chunks/@ethersproject+bignumber@5.7.0"];
exports.modules = {

/***/ "(ssr)/../../../node_modules/.pnpm/@ethersproject+bignumber@5.7.0/node_modules/@ethersproject/bignumber/lib.esm/_version.js":
/*!****************************************************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/@ethersproject+bignumber@5.7.0/node_modules/@ethersproject/bignumber/lib.esm/_version.js ***!
  \****************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   version: () => (/* binding */ version)\n/* harmony export */ });\nconst version = \"bignumber/5.7.0\";\n//# sourceMappingURL=_version.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BldGhlcnNwcm9qZWN0K2JpZ251bWJlckA1LjcuMC9ub2RlX21vZHVsZXMvQGV0aGVyc3Byb2plY3QvYmlnbnVtYmVyL2xpYi5lc20vX3ZlcnNpb24uanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFPO0FBQ1AiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZXhhbXBsZXMvbG9naW4td2l0aC1wYXNzcG9ydC1ldmVudHMvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BldGhlcnNwcm9qZWN0K2JpZ251bWJlckA1LjcuMC9ub2RlX21vZHVsZXMvQGV0aGVyc3Byb2plY3QvYmlnbnVtYmVyL2xpYi5lc20vX3ZlcnNpb24uanM/NTVkZSJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgdmVyc2lvbiA9IFwiYmlnbnVtYmVyLzUuNy4wXCI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1fdmVyc2lvbi5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/@ethersproject+bignumber@5.7.0/node_modules/@ethersproject/bignumber/lib.esm/_version.js\n");

/***/ }),

/***/ "(ssr)/../../../node_modules/.pnpm/@ethersproject+bignumber@5.7.0/node_modules/@ethersproject/bignumber/lib.esm/bignumber.js":
/*!*****************************************************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/@ethersproject+bignumber@5.7.0/node_modules/@ethersproject/bignumber/lib.esm/bignumber.js ***!
  \*****************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   BigNumber: () => (/* binding */ BigNumber),\n/* harmony export */   _base16To36: () => (/* binding */ _base16To36),\n/* harmony export */   _base36To16: () => (/* binding */ _base36To16),\n/* harmony export */   isBigNumberish: () => (/* binding */ isBigNumberish)\n/* harmony export */ });\n/* harmony import */ var bn_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bn.js */ \"(ssr)/../../../node_modules/.pnpm/bn.js@5.2.1/node_modules/bn.js/lib/bn.js\");\n/* harmony import */ var bn_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(bn_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _ethersproject_bytes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ethersproject/bytes */ \"(ssr)/../../../node_modules/.pnpm/@ethersproject+bytes@5.7.0/node_modules/@ethersproject/bytes/lib.esm/index.js\");\n/* harmony import */ var _ethersproject_logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ethersproject/logger */ \"(ssr)/../../../node_modules/.pnpm/@ethersproject+logger@5.7.0/node_modules/@ethersproject/logger/lib.esm/index.js\");\n/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_version */ \"(ssr)/../../../node_modules/.pnpm/@ethersproject+bignumber@5.7.0/node_modules/@ethersproject/bignumber/lib.esm/_version.js\");\n\n/**\n *  BigNumber\n *\n *  A wrapper around the BN.js object. We use the BN.js library\n *  because it is used by elliptic, so it is required regardless.\n *\n */\n\nvar BN = (bn_js__WEBPACK_IMPORTED_MODULE_0___default().BN);\n\n\n\nconst logger = new _ethersproject_logger__WEBPACK_IMPORTED_MODULE_1__.Logger(_version__WEBPACK_IMPORTED_MODULE_2__.version);\nconst _constructorGuard = {};\nconst MAX_SAFE = 0x1fffffffffffff;\nfunction isBigNumberish(value) {\n    return (value != null) && (BigNumber.isBigNumber(value) ||\n        (typeof (value) === \"number\" && (value % 1) === 0) ||\n        (typeof (value) === \"string\" && !!value.match(/^-?[0-9]+$/)) ||\n        (0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_3__.isHexString)(value) ||\n        (typeof (value) === \"bigint\") ||\n        (0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_3__.isBytes)(value));\n}\n// Only warn about passing 10 into radix once\nlet _warnedToStringRadix = false;\nclass BigNumber {\n    constructor(constructorGuard, hex) {\n        if (constructorGuard !== _constructorGuard) {\n            logger.throwError(\"cannot call constructor directly; use BigNumber.from\", _ethersproject_logger__WEBPACK_IMPORTED_MODULE_1__.Logger.errors.UNSUPPORTED_OPERATION, {\n                operation: \"new (BigNumber)\"\n            });\n        }\n        this._hex = hex;\n        this._isBigNumber = true;\n        Object.freeze(this);\n    }\n    fromTwos(value) {\n        return toBigNumber(toBN(this).fromTwos(value));\n    }\n    toTwos(value) {\n        return toBigNumber(toBN(this).toTwos(value));\n    }\n    abs() {\n        if (this._hex[0] === \"-\") {\n            return BigNumber.from(this._hex.substring(1));\n        }\n        return this;\n    }\n    add(other) {\n        return toBigNumber(toBN(this).add(toBN(other)));\n    }\n    sub(other) {\n        return toBigNumber(toBN(this).sub(toBN(other)));\n    }\n    div(other) {\n        const o = BigNumber.from(other);\n        if (o.isZero()) {\n            throwFault(\"division-by-zero\", \"div\");\n        }\n        return toBigNumber(toBN(this).div(toBN(other)));\n    }\n    mul(other) {\n        return toBigNumber(toBN(this).mul(toBN(other)));\n    }\n    mod(other) {\n        const value = toBN(other);\n        if (value.isNeg()) {\n            throwFault(\"division-by-zero\", \"mod\");\n        }\n        return toBigNumber(toBN(this).umod(value));\n    }\n    pow(other) {\n        const value = toBN(other);\n        if (value.isNeg()) {\n            throwFault(\"negative-power\", \"pow\");\n        }\n        return toBigNumber(toBN(this).pow(value));\n    }\n    and(other) {\n        const value = toBN(other);\n        if (this.isNegative() || value.isNeg()) {\n            throwFault(\"unbound-bitwise-result\", \"and\");\n        }\n        return toBigNumber(toBN(this).and(value));\n    }\n    or(other) {\n        const value = toBN(other);\n        if (this.isNegative() || value.isNeg()) {\n            throwFault(\"unbound-bitwise-result\", \"or\");\n        }\n        return toBigNumber(toBN(this).or(value));\n    }\n    xor(other) {\n        const value = toBN(other);\n        if (this.isNegative() || value.isNeg()) {\n            throwFault(\"unbound-bitwise-result\", \"xor\");\n        }\n        return toBigNumber(toBN(this).xor(value));\n    }\n    mask(value) {\n        if (this.isNegative() || value < 0) {\n            throwFault(\"negative-width\", \"mask\");\n        }\n        return toBigNumber(toBN(this).maskn(value));\n    }\n    shl(value) {\n        if (this.isNegative() || value < 0) {\n            throwFault(\"negative-width\", \"shl\");\n        }\n        return toBigNumber(toBN(this).shln(value));\n    }\n    shr(value) {\n        if (this.isNegative() || value < 0) {\n            throwFault(\"negative-width\", \"shr\");\n        }\n        return toBigNumber(toBN(this).shrn(value));\n    }\n    eq(other) {\n        return toBN(this).eq(toBN(other));\n    }\n    lt(other) {\n        return toBN(this).lt(toBN(other));\n    }\n    lte(other) {\n        return toBN(this).lte(toBN(other));\n    }\n    gt(other) {\n        return toBN(this).gt(toBN(other));\n    }\n    gte(other) {\n        return toBN(this).gte(toBN(other));\n    }\n    isNegative() {\n        return (this._hex[0] === \"-\");\n    }\n    isZero() {\n        return toBN(this).isZero();\n    }\n    toNumber() {\n        try {\n            return toBN(this).toNumber();\n        }\n        catch (error) {\n            throwFault(\"overflow\", \"toNumber\", this.toString());\n        }\n        return null;\n    }\n    toBigInt() {\n        try {\n            return BigInt(this.toString());\n        }\n        catch (e) { }\n        return logger.throwError(\"this platform does not support BigInt\", _ethersproject_logger__WEBPACK_IMPORTED_MODULE_1__.Logger.errors.UNSUPPORTED_OPERATION, {\n            value: this.toString()\n        });\n    }\n    toString() {\n        // Lots of people expect this, which we do not support, so check (See: #889)\n        if (arguments.length > 0) {\n            if (arguments[0] === 10) {\n                if (!_warnedToStringRadix) {\n                    _warnedToStringRadix = true;\n                    logger.warn(\"BigNumber.toString does not accept any parameters; base-10 is assumed\");\n                }\n            }\n            else if (arguments[0] === 16) {\n                logger.throwError(\"BigNumber.toString does not accept any parameters; use bigNumber.toHexString()\", _ethersproject_logger__WEBPACK_IMPORTED_MODULE_1__.Logger.errors.UNEXPECTED_ARGUMENT, {});\n            }\n            else {\n                logger.throwError(\"BigNumber.toString does not accept parameters\", _ethersproject_logger__WEBPACK_IMPORTED_MODULE_1__.Logger.errors.UNEXPECTED_ARGUMENT, {});\n            }\n        }\n        return toBN(this).toString(10);\n    }\n    toHexString() {\n        return this._hex;\n    }\n    toJSON(key) {\n        return { type: \"BigNumber\", hex: this.toHexString() };\n    }\n    static from(value) {\n        if (value instanceof BigNumber) {\n            return value;\n        }\n        if (typeof (value) === \"string\") {\n            if (value.match(/^-?0x[0-9a-f]+$/i)) {\n                return new BigNumber(_constructorGuard, toHex(value));\n            }\n            if (value.match(/^-?[0-9]+$/)) {\n                return new BigNumber(_constructorGuard, toHex(new BN(value)));\n            }\n            return logger.throwArgumentError(\"invalid BigNumber string\", \"value\", value);\n        }\n        if (typeof (value) === \"number\") {\n            if (value % 1) {\n                throwFault(\"underflow\", \"BigNumber.from\", value);\n            }\n            if (value >= MAX_SAFE || value <= -MAX_SAFE) {\n                throwFault(\"overflow\", \"BigNumber.from\", value);\n            }\n            return BigNumber.from(String(value));\n        }\n        const anyValue = value;\n        if (typeof (anyValue) === \"bigint\") {\n            return BigNumber.from(anyValue.toString());\n        }\n        if ((0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_3__.isBytes)(anyValue)) {\n            return BigNumber.from((0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_3__.hexlify)(anyValue));\n        }\n        if (anyValue) {\n            // Hexable interface (takes priority)\n            if (anyValue.toHexString) {\n                const hex = anyValue.toHexString();\n                if (typeof (hex) === \"string\") {\n                    return BigNumber.from(hex);\n                }\n            }\n            else {\n                // For now, handle legacy JSON-ified values (goes away in v6)\n                let hex = anyValue._hex;\n                // New-form JSON\n                if (hex == null && anyValue.type === \"BigNumber\") {\n                    hex = anyValue.hex;\n                }\n                if (typeof (hex) === \"string\") {\n                    if ((0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_3__.isHexString)(hex) || (hex[0] === \"-\" && (0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_3__.isHexString)(hex.substring(1)))) {\n                        return BigNumber.from(hex);\n                    }\n                }\n            }\n        }\n        return logger.throwArgumentError(\"invalid BigNumber value\", \"value\", value);\n    }\n    static isBigNumber(value) {\n        return !!(value && value._isBigNumber);\n    }\n}\n// Normalize the hex string\nfunction toHex(value) {\n    // For BN, call on the hex string\n    if (typeof (value) !== \"string\") {\n        return toHex(value.toString(16));\n    }\n    // If negative, prepend the negative sign to the normalized positive value\n    if (value[0] === \"-\") {\n        // Strip off the negative sign\n        value = value.substring(1);\n        // Cannot have multiple negative signs (e.g. \"--0x04\")\n        if (value[0] === \"-\") {\n            logger.throwArgumentError(\"invalid hex\", \"value\", value);\n        }\n        // Call toHex on the positive component\n        value = toHex(value);\n        // Do not allow \"-0x00\"\n        if (value === \"0x00\") {\n            return value;\n        }\n        // Negate the value\n        return \"-\" + value;\n    }\n    // Add a \"0x\" prefix if missing\n    if (value.substring(0, 2) !== \"0x\") {\n        value = \"0x\" + value;\n    }\n    // Normalize zero\n    if (value === \"0x\") {\n        return \"0x00\";\n    }\n    // Make the string even length\n    if (value.length % 2) {\n        value = \"0x0\" + value.substring(2);\n    }\n    // Trim to smallest even-length string\n    while (value.length > 4 && value.substring(0, 4) === \"0x00\") {\n        value = \"0x\" + value.substring(4);\n    }\n    return value;\n}\nfunction toBigNumber(value) {\n    return BigNumber.from(toHex(value));\n}\nfunction toBN(value) {\n    const hex = BigNumber.from(value).toHexString();\n    if (hex[0] === \"-\") {\n        return (new BN(\"-\" + hex.substring(3), 16));\n    }\n    return new BN(hex.substring(2), 16);\n}\nfunction throwFault(fault, operation, value) {\n    const params = { fault: fault, operation: operation };\n    if (value != null) {\n        params.value = value;\n    }\n    return logger.throwError(fault, _ethersproject_logger__WEBPACK_IMPORTED_MODULE_1__.Logger.errors.NUMERIC_FAULT, params);\n}\n// value should have no prefix\nfunction _base36To16(value) {\n    return (new BN(value, 36)).toString(16);\n}\n// value should have no prefix\nfunction _base16To36(value) {\n    return (new BN(value, 16)).toString(36);\n}\n//# sourceMappingURL=bignumber.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BldGhlcnNwcm9qZWN0K2JpZ251bWJlckA1LjcuMC9ub2RlX21vZHVsZXMvQGV0aGVyc3Byb2plY3QvYmlnbnVtYmVyL2xpYi5lc20vYmlnbnVtYmVyLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDd0I7QUFDeEIsU0FBUyxpREFBTTtBQUNzRDtBQUN0QjtBQUNWO0FBQ3JDLG1CQUFtQix5REFBTSxDQUFDLDZDQUFPO0FBQ2pDO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQVc7QUFDbkI7QUFDQSxRQUFRLDZEQUFPO0FBQ2Y7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0EsaUVBQWlFLHFCQUFxQix5REFBTTtBQUM1RjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBFQUEwRSx5REFBTTtBQUNoRjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9GQUFvRjtBQUNwRjtBQUNBO0FBQ0E7QUFDQSxzRkFBc0YsOEJBQThCLHlEQUFNLCtCQUErQjtBQUN6SjtBQUNBO0FBQ0EsbUZBQW1GLHlEQUFNLCtCQUErQjtBQUN4SDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksNkRBQU87QUFDbkIsa0NBQWtDLDZEQUFPO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsaUVBQVcsNEJBQTRCLGlFQUFXO0FBQzFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MseURBQU07QUFDMUM7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZXhhbXBsZXMvbG9naW4td2l0aC1wYXNzcG9ydC1ldmVudHMvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BldGhlcnNwcm9qZWN0K2JpZ251bWJlckA1LjcuMC9ub2RlX21vZHVsZXMvQGV0aGVyc3Byb2plY3QvYmlnbnVtYmVyL2xpYi5lc20vYmlnbnVtYmVyLmpzP2M3ZDUiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiAqICBCaWdOdW1iZXJcbiAqXG4gKiAgQSB3cmFwcGVyIGFyb3VuZCB0aGUgQk4uanMgb2JqZWN0LiBXZSB1c2UgdGhlIEJOLmpzIGxpYnJhcnlcbiAqICBiZWNhdXNlIGl0IGlzIHVzZWQgYnkgZWxsaXB0aWMsIHNvIGl0IGlzIHJlcXVpcmVkIHJlZ2FyZGxlc3MuXG4gKlxuICovXG5pbXBvcnQgX0JOIGZyb20gXCJibi5qc1wiO1xudmFyIEJOID0gX0JOLkJOO1xuaW1wb3J0IHsgaGV4bGlmeSwgaXNCeXRlcywgaXNIZXhTdHJpbmcgfSBmcm9tIFwiQGV0aGVyc3Byb2plY3QvYnl0ZXNcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCJAZXRoZXJzcHJvamVjdC9sb2dnZXJcIjtcbmltcG9ydCB7IHZlcnNpb24gfSBmcm9tIFwiLi9fdmVyc2lvblwiO1xuY29uc3QgbG9nZ2VyID0gbmV3IExvZ2dlcih2ZXJzaW9uKTtcbmNvbnN0IF9jb25zdHJ1Y3Rvckd1YXJkID0ge307XG5jb25zdCBNQVhfU0FGRSA9IDB4MWZmZmZmZmZmZmZmZmY7XG5leHBvcnQgZnVuY3Rpb24gaXNCaWdOdW1iZXJpc2godmFsdWUpIHtcbiAgICByZXR1cm4gKHZhbHVlICE9IG51bGwpICYmIChCaWdOdW1iZXIuaXNCaWdOdW1iZXIodmFsdWUpIHx8XG4gICAgICAgICh0eXBlb2YgKHZhbHVlKSA9PT0gXCJudW1iZXJcIiAmJiAodmFsdWUgJSAxKSA9PT0gMCkgfHxcbiAgICAgICAgKHR5cGVvZiAodmFsdWUpID09PSBcInN0cmluZ1wiICYmICEhdmFsdWUubWF0Y2goL14tP1swLTldKyQvKSkgfHxcbiAgICAgICAgaXNIZXhTdHJpbmcodmFsdWUpIHx8XG4gICAgICAgICh0eXBlb2YgKHZhbHVlKSA9PT0gXCJiaWdpbnRcIikgfHxcbiAgICAgICAgaXNCeXRlcyh2YWx1ZSkpO1xufVxuLy8gT25seSB3YXJuIGFib3V0IHBhc3NpbmcgMTAgaW50byByYWRpeCBvbmNlXG5sZXQgX3dhcm5lZFRvU3RyaW5nUmFkaXggPSBmYWxzZTtcbmV4cG9ydCBjbGFzcyBCaWdOdW1iZXIge1xuICAgIGNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yR3VhcmQsIGhleCkge1xuICAgICAgICBpZiAoY29uc3RydWN0b3JHdWFyZCAhPT0gX2NvbnN0cnVjdG9yR3VhcmQpIHtcbiAgICAgICAgICAgIGxvZ2dlci50aHJvd0Vycm9yKFwiY2Fubm90IGNhbGwgY29uc3RydWN0b3IgZGlyZWN0bHk7IHVzZSBCaWdOdW1iZXIuZnJvbVwiLCBMb2dnZXIuZXJyb3JzLlVOU1VQUE9SVEVEX09QRVJBVElPTiwge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbjogXCJuZXcgKEJpZ051bWJlcilcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faGV4ID0gaGV4O1xuICAgICAgICB0aGlzLl9pc0JpZ051bWJlciA9IHRydWU7XG4gICAgICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gICAgfVxuICAgIGZyb21Ud29zKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0b0JpZ051bWJlcih0b0JOKHRoaXMpLmZyb21Ud29zKHZhbHVlKSk7XG4gICAgfVxuICAgIHRvVHdvcyh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdG9CaWdOdW1iZXIodG9CTih0aGlzKS50b1R3b3ModmFsdWUpKTtcbiAgICB9XG4gICAgYWJzKCkge1xuICAgICAgICBpZiAodGhpcy5faGV4WzBdID09PSBcIi1cIikge1xuICAgICAgICAgICAgcmV0dXJuIEJpZ051bWJlci5mcm9tKHRoaXMuX2hleC5zdWJzdHJpbmcoMSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBhZGQob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRvQmlnTnVtYmVyKHRvQk4odGhpcykuYWRkKHRvQk4ob3RoZXIpKSk7XG4gICAgfVxuICAgIHN1YihvdGhlcikge1xuICAgICAgICByZXR1cm4gdG9CaWdOdW1iZXIodG9CTih0aGlzKS5zdWIodG9CTihvdGhlcikpKTtcbiAgICB9XG4gICAgZGl2KG90aGVyKSB7XG4gICAgICAgIGNvbnN0IG8gPSBCaWdOdW1iZXIuZnJvbShvdGhlcik7XG4gICAgICAgIGlmIChvLmlzWmVybygpKSB7XG4gICAgICAgICAgICB0aHJvd0ZhdWx0KFwiZGl2aXNpb24tYnktemVyb1wiLCBcImRpdlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9CaWdOdW1iZXIodG9CTih0aGlzKS5kaXYodG9CTihvdGhlcikpKTtcbiAgICB9XG4gICAgbXVsKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0b0JpZ051bWJlcih0b0JOKHRoaXMpLm11bCh0b0JOKG90aGVyKSkpO1xuICAgIH1cbiAgICBtb2Qob3RoZXIpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0b0JOKG90aGVyKTtcbiAgICAgICAgaWYgKHZhbHVlLmlzTmVnKCkpIHtcbiAgICAgICAgICAgIHRocm93RmF1bHQoXCJkaXZpc2lvbi1ieS16ZXJvXCIsIFwibW9kXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b0JpZ051bWJlcih0b0JOKHRoaXMpLnVtb2QodmFsdWUpKTtcbiAgICB9XG4gICAgcG93KG90aGVyKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdG9CTihvdGhlcik7XG4gICAgICAgIGlmICh2YWx1ZS5pc05lZygpKSB7XG4gICAgICAgICAgICB0aHJvd0ZhdWx0KFwibmVnYXRpdmUtcG93ZXJcIiwgXCJwb3dcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRvQmlnTnVtYmVyKHRvQk4odGhpcykucG93KHZhbHVlKSk7XG4gICAgfVxuICAgIGFuZChvdGhlcikge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHRvQk4ob3RoZXIpO1xuICAgICAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkgfHwgdmFsdWUuaXNOZWcoKSkge1xuICAgICAgICAgICAgdGhyb3dGYXVsdChcInVuYm91bmQtYml0d2lzZS1yZXN1bHRcIiwgXCJhbmRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRvQmlnTnVtYmVyKHRvQk4odGhpcykuYW5kKHZhbHVlKSk7XG4gICAgfVxuICAgIG9yKG90aGVyKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdG9CTihvdGhlcik7XG4gICAgICAgIGlmICh0aGlzLmlzTmVnYXRpdmUoKSB8fCB2YWx1ZS5pc05lZygpKSB7XG4gICAgICAgICAgICB0aHJvd0ZhdWx0KFwidW5ib3VuZC1iaXR3aXNlLXJlc3VsdFwiLCBcIm9yXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b0JpZ051bWJlcih0b0JOKHRoaXMpLm9yKHZhbHVlKSk7XG4gICAgfVxuICAgIHhvcihvdGhlcikge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHRvQk4ob3RoZXIpO1xuICAgICAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkgfHwgdmFsdWUuaXNOZWcoKSkge1xuICAgICAgICAgICAgdGhyb3dGYXVsdChcInVuYm91bmQtYml0d2lzZS1yZXN1bHRcIiwgXCJ4b3JcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRvQmlnTnVtYmVyKHRvQk4odGhpcykueG9yKHZhbHVlKSk7XG4gICAgfVxuICAgIG1hc2sodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpIHx8IHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgdGhyb3dGYXVsdChcIm5lZ2F0aXZlLXdpZHRoXCIsIFwibWFza1wiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9CaWdOdW1iZXIodG9CTih0aGlzKS5tYXNrbih2YWx1ZSkpO1xuICAgIH1cbiAgICBzaGwodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpIHx8IHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgdGhyb3dGYXVsdChcIm5lZ2F0aXZlLXdpZHRoXCIsIFwic2hsXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b0JpZ051bWJlcih0b0JOKHRoaXMpLnNobG4odmFsdWUpKTtcbiAgICB9XG4gICAgc2hyKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLmlzTmVnYXRpdmUoKSB8fCB2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgIHRocm93RmF1bHQoXCJuZWdhdGl2ZS13aWR0aFwiLCBcInNoclwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9CaWdOdW1iZXIodG9CTih0aGlzKS5zaHJuKHZhbHVlKSk7XG4gICAgfVxuICAgIGVxKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0b0JOKHRoaXMpLmVxKHRvQk4ob3RoZXIpKTtcbiAgICB9XG4gICAgbHQob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRvQk4odGhpcykubHQodG9CTihvdGhlcikpO1xuICAgIH1cbiAgICBsdGUob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRvQk4odGhpcykubHRlKHRvQk4ob3RoZXIpKTtcbiAgICB9XG4gICAgZ3Qob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRvQk4odGhpcykuZ3QodG9CTihvdGhlcikpO1xuICAgIH1cbiAgICBndGUob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRvQk4odGhpcykuZ3RlKHRvQk4ob3RoZXIpKTtcbiAgICB9XG4gICAgaXNOZWdhdGl2ZSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9oZXhbMF0gPT09IFwiLVwiKTtcbiAgICB9XG4gICAgaXNaZXJvKCkge1xuICAgICAgICByZXR1cm4gdG9CTih0aGlzKS5pc1plcm8oKTtcbiAgICB9XG4gICAgdG9OdW1iZXIoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gdG9CTih0aGlzKS50b051bWJlcigpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhyb3dGYXVsdChcIm92ZXJmbG93XCIsIFwidG9OdW1iZXJcIiwgdGhpcy50b1N0cmluZygpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdG9CaWdJbnQoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gQmlnSW50KHRoaXMudG9TdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHsgfVxuICAgICAgICByZXR1cm4gbG9nZ2VyLnRocm93RXJyb3IoXCJ0aGlzIHBsYXRmb3JtIGRvZXMgbm90IHN1cHBvcnQgQmlnSW50XCIsIExvZ2dlci5lcnJvcnMuVU5TVVBQT1JURURfT1BFUkFUSU9OLCB7XG4gICAgICAgICAgICB2YWx1ZTogdGhpcy50b1N0cmluZygpXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgLy8gTG90cyBvZiBwZW9wbGUgZXhwZWN0IHRoaXMsIHdoaWNoIHdlIGRvIG5vdCBzdXBwb3J0LCBzbyBjaGVjayAoU2VlOiAjODg5KVxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbMF0gPT09IDEwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFfd2FybmVkVG9TdHJpbmdSYWRpeCkge1xuICAgICAgICAgICAgICAgICAgICBfd2FybmVkVG9TdHJpbmdSYWRpeCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKFwiQmlnTnVtYmVyLnRvU3RyaW5nIGRvZXMgbm90IGFjY2VwdCBhbnkgcGFyYW1ldGVyczsgYmFzZS0xMCBpcyBhc3N1bWVkXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGFyZ3VtZW50c1swXSA9PT0gMTYpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIudGhyb3dFcnJvcihcIkJpZ051bWJlci50b1N0cmluZyBkb2VzIG5vdCBhY2NlcHQgYW55IHBhcmFtZXRlcnM7IHVzZSBiaWdOdW1iZXIudG9IZXhTdHJpbmcoKVwiLCBMb2dnZXIuZXJyb3JzLlVORVhQRUNURURfQVJHVU1FTlQsIHt9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci50aHJvd0Vycm9yKFwiQmlnTnVtYmVyLnRvU3RyaW5nIGRvZXMgbm90IGFjY2VwdCBwYXJhbWV0ZXJzXCIsIExvZ2dlci5lcnJvcnMuVU5FWFBFQ1RFRF9BUkdVTUVOVCwge30pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b0JOKHRoaXMpLnRvU3RyaW5nKDEwKTtcbiAgICB9XG4gICAgdG9IZXhTdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oZXg7XG4gICAgfVxuICAgIHRvSlNPTihrZXkpIHtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJCaWdOdW1iZXJcIiwgaGV4OiB0aGlzLnRvSGV4U3RyaW5nKCkgfTtcbiAgICB9XG4gICAgc3RhdGljIGZyb20odmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQmlnTnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiAodmFsdWUpID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUubWF0Y2goL14tPzB4WzAtOWEtZl0rJC9pKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQmlnTnVtYmVyKF9jb25zdHJ1Y3Rvckd1YXJkLCB0b0hleCh2YWx1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZhbHVlLm1hdGNoKC9eLT9bMC05XSskLykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJpZ051bWJlcihfY29uc3RydWN0b3JHdWFyZCwgdG9IZXgobmV3IEJOKHZhbHVlKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGxvZ2dlci50aHJvd0FyZ3VtZW50RXJyb3IoXCJpbnZhbGlkIEJpZ051bWJlciBzdHJpbmdcIiwgXCJ2YWx1ZVwiLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiAodmFsdWUpID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgJSAxKSB7XG4gICAgICAgICAgICAgICAgdGhyb3dGYXVsdChcInVuZGVyZmxvd1wiLCBcIkJpZ051bWJlci5mcm9tXCIsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2YWx1ZSA+PSBNQVhfU0FGRSB8fCB2YWx1ZSA8PSAtTUFYX1NBRkUpIHtcbiAgICAgICAgICAgICAgICB0aHJvd0ZhdWx0KFwib3ZlcmZsb3dcIiwgXCJCaWdOdW1iZXIuZnJvbVwiLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gQmlnTnVtYmVyLmZyb20oU3RyaW5nKHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYW55VmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgaWYgKHR5cGVvZiAoYW55VmFsdWUpID09PSBcImJpZ2ludFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gQmlnTnVtYmVyLmZyb20oYW55VmFsdWUudG9TdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQnl0ZXMoYW55VmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gQmlnTnVtYmVyLmZyb20oaGV4bGlmeShhbnlWYWx1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhbnlWYWx1ZSkge1xuICAgICAgICAgICAgLy8gSGV4YWJsZSBpbnRlcmZhY2UgKHRha2VzIHByaW9yaXR5KVxuICAgICAgICAgICAgaWYgKGFueVZhbHVlLnRvSGV4U3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaGV4ID0gYW55VmFsdWUudG9IZXhTdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIChoZXgpID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCaWdOdW1iZXIuZnJvbShoZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZvciBub3csIGhhbmRsZSBsZWdhY3kgSlNPTi1pZmllZCB2YWx1ZXMgKGdvZXMgYXdheSBpbiB2NilcbiAgICAgICAgICAgICAgICBsZXQgaGV4ID0gYW55VmFsdWUuX2hleDtcbiAgICAgICAgICAgICAgICAvLyBOZXctZm9ybSBKU09OXG4gICAgICAgICAgICAgICAgaWYgKGhleCA9PSBudWxsICYmIGFueVZhbHVlLnR5cGUgPT09IFwiQmlnTnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaGV4ID0gYW55VmFsdWUuaGV4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIChoZXgpID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0hleFN0cmluZyhoZXgpIHx8IChoZXhbMF0gPT09IFwiLVwiICYmIGlzSGV4U3RyaW5nKGhleC5zdWJzdHJpbmcoMSkpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJpZ051bWJlci5mcm9tKGhleCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxvZ2dlci50aHJvd0FyZ3VtZW50RXJyb3IoXCJpbnZhbGlkIEJpZ051bWJlciB2YWx1ZVwiLCBcInZhbHVlXCIsIHZhbHVlKTtcbiAgICB9XG4gICAgc3RhdGljIGlzQmlnTnVtYmVyKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5faXNCaWdOdW1iZXIpO1xuICAgIH1cbn1cbi8vIE5vcm1hbGl6ZSB0aGUgaGV4IHN0cmluZ1xuZnVuY3Rpb24gdG9IZXgodmFsdWUpIHtcbiAgICAvLyBGb3IgQk4sIGNhbGwgb24gdGhlIGhleCBzdHJpbmdcbiAgICBpZiAodHlwZW9mICh2YWx1ZSkgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmV0dXJuIHRvSGV4KHZhbHVlLnRvU3RyaW5nKDE2KSk7XG4gICAgfVxuICAgIC8vIElmIG5lZ2F0aXZlLCBwcmVwZW5kIHRoZSBuZWdhdGl2ZSBzaWduIHRvIHRoZSBub3JtYWxpemVkIHBvc2l0aXZlIHZhbHVlXG4gICAgaWYgKHZhbHVlWzBdID09PSBcIi1cIikge1xuICAgICAgICAvLyBTdHJpcCBvZmYgdGhlIG5lZ2F0aXZlIHNpZ25cbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgIC8vIENhbm5vdCBoYXZlIG11bHRpcGxlIG5lZ2F0aXZlIHNpZ25zIChlLmcuIFwiLS0weDA0XCIpXG4gICAgICAgIGlmICh2YWx1ZVswXSA9PT0gXCItXCIpIHtcbiAgICAgICAgICAgIGxvZ2dlci50aHJvd0FyZ3VtZW50RXJyb3IoXCJpbnZhbGlkIGhleFwiLCBcInZhbHVlXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDYWxsIHRvSGV4IG9uIHRoZSBwb3NpdGl2ZSBjb21wb25lbnRcbiAgICAgICAgdmFsdWUgPSB0b0hleCh2YWx1ZSk7XG4gICAgICAgIC8vIERvIG5vdCBhbGxvdyBcIi0weDAwXCJcbiAgICAgICAgaWYgKHZhbHVlID09PSBcIjB4MDBcIikge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIE5lZ2F0ZSB0aGUgdmFsdWVcbiAgICAgICAgcmV0dXJuIFwiLVwiICsgdmFsdWU7XG4gICAgfVxuICAgIC8vIEFkZCBhIFwiMHhcIiBwcmVmaXggaWYgbWlzc2luZ1xuICAgIGlmICh2YWx1ZS5zdWJzdHJpbmcoMCwgMikgIT09IFwiMHhcIikge1xuICAgICAgICB2YWx1ZSA9IFwiMHhcIiArIHZhbHVlO1xuICAgIH1cbiAgICAvLyBOb3JtYWxpemUgemVyb1xuICAgIGlmICh2YWx1ZSA9PT0gXCIweFwiKSB7XG4gICAgICAgIHJldHVybiBcIjB4MDBcIjtcbiAgICB9XG4gICAgLy8gTWFrZSB0aGUgc3RyaW5nIGV2ZW4gbGVuZ3RoXG4gICAgaWYgKHZhbHVlLmxlbmd0aCAlIDIpIHtcbiAgICAgICAgdmFsdWUgPSBcIjB4MFwiICsgdmFsdWUuc3Vic3RyaW5nKDIpO1xuICAgIH1cbiAgICAvLyBUcmltIHRvIHNtYWxsZXN0IGV2ZW4tbGVuZ3RoIHN0cmluZ1xuICAgIHdoaWxlICh2YWx1ZS5sZW5ndGggPiA0ICYmIHZhbHVlLnN1YnN0cmluZygwLCA0KSA9PT0gXCIweDAwXCIpIHtcbiAgICAgICAgdmFsdWUgPSBcIjB4XCIgKyB2YWx1ZS5zdWJzdHJpbmcoNCk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHRvQmlnTnVtYmVyKHZhbHVlKSB7XG4gICAgcmV0dXJuIEJpZ051bWJlci5mcm9tKHRvSGV4KHZhbHVlKSk7XG59XG5mdW5jdGlvbiB0b0JOKHZhbHVlKSB7XG4gICAgY29uc3QgaGV4ID0gQmlnTnVtYmVyLmZyb20odmFsdWUpLnRvSGV4U3RyaW5nKCk7XG4gICAgaWYgKGhleFswXSA9PT0gXCItXCIpIHtcbiAgICAgICAgcmV0dXJuIChuZXcgQk4oXCItXCIgKyBoZXguc3Vic3RyaW5nKDMpLCAxNikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEJOKGhleC5zdWJzdHJpbmcoMiksIDE2KTtcbn1cbmZ1bmN0aW9uIHRocm93RmF1bHQoZmF1bHQsIG9wZXJhdGlvbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwYXJhbXMgPSB7IGZhdWx0OiBmYXVsdCwgb3BlcmF0aW9uOiBvcGVyYXRpb24gfTtcbiAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICBwYXJhbXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGxvZ2dlci50aHJvd0Vycm9yKGZhdWx0LCBMb2dnZXIuZXJyb3JzLk5VTUVSSUNfRkFVTFQsIHBhcmFtcyk7XG59XG4vLyB2YWx1ZSBzaG91bGQgaGF2ZSBubyBwcmVmaXhcbmV4cG9ydCBmdW5jdGlvbiBfYmFzZTM2VG8xNih2YWx1ZSkge1xuICAgIHJldHVybiAobmV3IEJOKHZhbHVlLCAzNikpLnRvU3RyaW5nKDE2KTtcbn1cbi8vIHZhbHVlIHNob3VsZCBoYXZlIG5vIHByZWZpeFxuZXhwb3J0IGZ1bmN0aW9uIF9iYXNlMTZUbzM2KHZhbHVlKSB7XG4gICAgcmV0dXJuIChuZXcgQk4odmFsdWUsIDE2KSkudG9TdHJpbmcoMzYpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YmlnbnVtYmVyLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/@ethersproject+bignumber@5.7.0/node_modules/@ethersproject/bignumber/lib.esm/bignumber.js\n");

/***/ })

};
;