"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@ethersproject+address@5.7.0";
exports.ids = ["vendor-chunks/@ethersproject+address@5.7.0"];
exports.modules = {

/***/ "(ssr)/../../../node_modules/.pnpm/@ethersproject+address@5.7.0/node_modules/@ethersproject/address/lib.esm/_version.js":
/*!************************************************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/@ethersproject+address@5.7.0/node_modules/@ethersproject/address/lib.esm/_version.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   version: () => (/* binding */ version)\n/* harmony export */ });\nconst version = \"address/5.7.0\";\n//# sourceMappingURL=_version.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BldGhlcnNwcm9qZWN0K2FkZHJlc3NANS43LjAvbm9kZV9tb2R1bGVzL0BldGhlcnNwcm9qZWN0L2FkZHJlc3MvbGliLmVzbS9fdmVyc2lvbi5qcyIsIm1hcHBpbmdzIjoiOzs7O0FBQU87QUFDUCIsInNvdXJjZXMiOlsid2VicGFjazovL0BleGFtcGxlcy9sb2dpbi13aXRoLXBhc3Nwb3J0LWJyaWRnZS8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQGV0aGVyc3Byb2plY3QrYWRkcmVzc0A1LjcuMC9ub2RlX21vZHVsZXMvQGV0aGVyc3Byb2plY3QvYWRkcmVzcy9saWIuZXNtL192ZXJzaW9uLmpzP2YyZDEiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IHZlcnNpb24gPSBcImFkZHJlc3MvNS43LjBcIjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPV92ZXJzaW9uLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/@ethersproject+address@5.7.0/node_modules/@ethersproject/address/lib.esm/_version.js\n");

/***/ }),

/***/ "(ssr)/../../../node_modules/.pnpm/@ethersproject+address@5.7.0/node_modules/@ethersproject/address/lib.esm/index.js":
/*!*********************************************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/@ethersproject+address@5.7.0/node_modules/@ethersproject/address/lib.esm/index.js ***!
  \*********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getAddress: () => (/* binding */ getAddress),\n/* harmony export */   getContractAddress: () => (/* binding */ getContractAddress),\n/* harmony export */   getCreate2Address: () => (/* binding */ getCreate2Address),\n/* harmony export */   getIcapAddress: () => (/* binding */ getIcapAddress),\n/* harmony export */   isAddress: () => (/* binding */ isAddress)\n/* harmony export */ });\n/* harmony import */ var _ethersproject_bytes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ethersproject/bytes */ \"(ssr)/../../../node_modules/.pnpm/@ethersproject+bytes@5.7.0/node_modules/@ethersproject/bytes/lib.esm/index.js\");\n/* harmony import */ var _ethersproject_bignumber__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ethersproject/bignumber */ \"(ssr)/../../../node_modules/.pnpm/@ethersproject+bignumber@5.7.0/node_modules/@ethersproject/bignumber/lib.esm/bignumber.js\");\n/* harmony import */ var _ethersproject_keccak256__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ethersproject/keccak256 */ \"(ssr)/../../../node_modules/.pnpm/@ethersproject+keccak256@5.7.0/node_modules/@ethersproject/keccak256/lib.esm/index.js\");\n/* harmony import */ var _ethersproject_rlp__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ethersproject/rlp */ \"(ssr)/../../../node_modules/.pnpm/@ethersproject+rlp@5.7.0/node_modules/@ethersproject/rlp/lib.esm/index.js\");\n/* harmony import */ var _ethersproject_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ethersproject/logger */ \"(ssr)/../../../node_modules/.pnpm/@ethersproject+logger@5.7.0/node_modules/@ethersproject/logger/lib.esm/index.js\");\n/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_version */ \"(ssr)/../../../node_modules/.pnpm/@ethersproject+address@5.7.0/node_modules/@ethersproject/address/lib.esm/_version.js\");\n\n\n\n\n\n\n\nconst logger = new _ethersproject_logger__WEBPACK_IMPORTED_MODULE_0__.Logger(_version__WEBPACK_IMPORTED_MODULE_1__.version);\nfunction getChecksumAddress(address) {\n    if (!(0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_2__.isHexString)(address, 20)) {\n        logger.throwArgumentError(\"invalid address\", \"address\", address);\n    }\n    address = address.toLowerCase();\n    const chars = address.substring(2).split(\"\");\n    const expanded = new Uint8Array(40);\n    for (let i = 0; i < 40; i++) {\n        expanded[i] = chars[i].charCodeAt(0);\n    }\n    const hashed = (0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_2__.arrayify)((0,_ethersproject_keccak256__WEBPACK_IMPORTED_MODULE_3__.keccak256)(expanded));\n    for (let i = 0; i < 40; i += 2) {\n        if ((hashed[i >> 1] >> 4) >= 8) {\n            chars[i] = chars[i].toUpperCase();\n        }\n        if ((hashed[i >> 1] & 0x0f) >= 8) {\n            chars[i + 1] = chars[i + 1].toUpperCase();\n        }\n    }\n    return \"0x\" + chars.join(\"\");\n}\n// Shims for environments that are missing some required constants and functions\nconst MAX_SAFE_INTEGER = 0x1fffffffffffff;\nfunction log10(x) {\n    if (Math.log10) {\n        return Math.log10(x);\n    }\n    return Math.log(x) / Math.LN10;\n}\n// See: https://en.wikipedia.org/wiki/International_Bank_Account_Number\n// Create lookup table\nconst ibanLookup = {};\nfor (let i = 0; i < 10; i++) {\n    ibanLookup[String(i)] = String(i);\n}\nfor (let i = 0; i < 26; i++) {\n    ibanLookup[String.fromCharCode(65 + i)] = String(10 + i);\n}\n// How many decimal digits can we process? (for 64-bit float, this is 15)\nconst safeDigits = Math.floor(log10(MAX_SAFE_INTEGER));\nfunction ibanChecksum(address) {\n    address = address.toUpperCase();\n    address = address.substring(4) + address.substring(0, 2) + \"00\";\n    let expanded = address.split(\"\").map((c) => { return ibanLookup[c]; }).join(\"\");\n    // Javascript can handle integers safely up to 15 (decimal) digits\n    while (expanded.length >= safeDigits) {\n        let block = expanded.substring(0, safeDigits);\n        expanded = parseInt(block, 10) % 97 + expanded.substring(block.length);\n    }\n    let checksum = String(98 - (parseInt(expanded, 10) % 97));\n    while (checksum.length < 2) {\n        checksum = \"0\" + checksum;\n    }\n    return checksum;\n}\n;\nfunction getAddress(address) {\n    let result = null;\n    if (typeof (address) !== \"string\") {\n        logger.throwArgumentError(\"invalid address\", \"address\", address);\n    }\n    if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {\n        // Missing the 0x prefix\n        if (address.substring(0, 2) !== \"0x\") {\n            address = \"0x\" + address;\n        }\n        result = getChecksumAddress(address);\n        // It is a checksummed address with a bad checksum\n        if (address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && result !== address) {\n            logger.throwArgumentError(\"bad address checksum\", \"address\", address);\n        }\n        // Maybe ICAP? (we only support direct mode)\n    }\n    else if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {\n        // It is an ICAP address with a bad checksum\n        if (address.substring(2, 4) !== ibanChecksum(address)) {\n            logger.throwArgumentError(\"bad icap checksum\", \"address\", address);\n        }\n        result = (0,_ethersproject_bignumber__WEBPACK_IMPORTED_MODULE_4__._base36To16)(address.substring(4));\n        while (result.length < 40) {\n            result = \"0\" + result;\n        }\n        result = getChecksumAddress(\"0x\" + result);\n    }\n    else {\n        logger.throwArgumentError(\"invalid address\", \"address\", address);\n    }\n    return result;\n}\nfunction isAddress(address) {\n    try {\n        getAddress(address);\n        return true;\n    }\n    catch (error) { }\n    return false;\n}\nfunction getIcapAddress(address) {\n    let base36 = (0,_ethersproject_bignumber__WEBPACK_IMPORTED_MODULE_4__._base16To36)(getAddress(address).substring(2)).toUpperCase();\n    while (base36.length < 30) {\n        base36 = \"0\" + base36;\n    }\n    return \"XE\" + ibanChecksum(\"XE00\" + base36) + base36;\n}\n// http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed\nfunction getContractAddress(transaction) {\n    let from = null;\n    try {\n        from = getAddress(transaction.from);\n    }\n    catch (error) {\n        logger.throwArgumentError(\"missing from address\", \"transaction\", transaction);\n    }\n    const nonce = (0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_2__.stripZeros)((0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_2__.arrayify)(_ethersproject_bignumber__WEBPACK_IMPORTED_MODULE_4__.BigNumber.from(transaction.nonce).toHexString()));\n    return getAddress((0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_2__.hexDataSlice)((0,_ethersproject_keccak256__WEBPACK_IMPORTED_MODULE_3__.keccak256)((0,_ethersproject_rlp__WEBPACK_IMPORTED_MODULE_5__.encode)([from, nonce])), 12));\n}\nfunction getCreate2Address(from, salt, initCodeHash) {\n    if ((0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_2__.hexDataLength)(salt) !== 32) {\n        logger.throwArgumentError(\"salt must be 32 bytes\", \"salt\", salt);\n    }\n    if ((0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_2__.hexDataLength)(initCodeHash) !== 32) {\n        logger.throwArgumentError(\"initCodeHash must be 32 bytes\", \"initCodeHash\", initCodeHash);\n    }\n    return getAddress((0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_2__.hexDataSlice)((0,_ethersproject_keccak256__WEBPACK_IMPORTED_MODULE_3__.keccak256)((0,_ethersproject_bytes__WEBPACK_IMPORTED_MODULE_2__.concat)([\"0xff\", getAddress(from), salt, initCodeHash])), 12));\n}\n//# sourceMappingURL=index.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BldGhlcnNwcm9qZWN0K2FkZHJlc3NANS43LjAvbm9kZV9tb2R1bGVzL0BldGhlcnNwcm9qZWN0L2FkZHJlc3MvbGliLmVzbS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFhO0FBQ2lHO0FBQy9CO0FBQzFCO0FBQ1Q7QUFDRztBQUNWO0FBQ3JDLG1CQUFtQix5REFBTSxDQUFDLDZDQUFPO0FBQ2pDO0FBQ0EsU0FBUyxpRUFBVztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLFFBQVE7QUFDNUI7QUFDQTtBQUNBLG1CQUFtQiw4REFBUSxDQUFDLG1FQUFTO0FBQ3JDLG9CQUFvQixRQUFRO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsUUFBUTtBQUN4QjtBQUNBO0FBQ0EsZ0JBQWdCLFFBQVE7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrREFBa0QsdUJBQXVCO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsR0FBRztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLEVBQUUsWUFBWSxNQUFNO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLHFFQUFXO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1AsaUJBQWlCLHFFQUFXO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsZ0VBQVUsQ0FBQyw4REFBUSxDQUFDLCtEQUFTO0FBQy9DLHNCQUFzQixrRUFBWSxDQUFDLG1FQUFTLENBQUMsMERBQU07QUFDbkQ7QUFDTztBQUNQLFFBQVEsbUVBQWE7QUFDckI7QUFDQTtBQUNBLFFBQVEsbUVBQWE7QUFDckI7QUFDQTtBQUNBLHNCQUFzQixrRUFBWSxDQUFDLG1FQUFTLENBQUMsNERBQU07QUFDbkQ7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL0BleGFtcGxlcy9sb2dpbi13aXRoLXBhc3Nwb3J0LWJyaWRnZS8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQGV0aGVyc3Byb2plY3QrYWRkcmVzc0A1LjcuMC9ub2RlX21vZHVsZXMvQGV0aGVyc3Byb2plY3QvYWRkcmVzcy9saWIuZXNtL2luZGV4LmpzP2E3NDUiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5pbXBvcnQgeyBhcnJheWlmeSwgY29uY2F0LCBoZXhEYXRhTGVuZ3RoLCBoZXhEYXRhU2xpY2UsIGlzSGV4U3RyaW5nLCBzdHJpcFplcm9zIH0gZnJvbSBcIkBldGhlcnNwcm9qZWN0L2J5dGVzXCI7XG5pbXBvcnQgeyBCaWdOdW1iZXIsIF9iYXNlMTZUbzM2LCBfYmFzZTM2VG8xNiB9IGZyb20gXCJAZXRoZXJzcHJvamVjdC9iaWdudW1iZXJcIjtcbmltcG9ydCB7IGtlY2NhazI1NiB9IGZyb20gXCJAZXRoZXJzcHJvamVjdC9rZWNjYWsyNTZcIjtcbmltcG9ydCB7IGVuY29kZSB9IGZyb20gXCJAZXRoZXJzcHJvamVjdC9ybHBcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCJAZXRoZXJzcHJvamVjdC9sb2dnZXJcIjtcbmltcG9ydCB7IHZlcnNpb24gfSBmcm9tIFwiLi9fdmVyc2lvblwiO1xuY29uc3QgbG9nZ2VyID0gbmV3IExvZ2dlcih2ZXJzaW9uKTtcbmZ1bmN0aW9uIGdldENoZWNrc3VtQWRkcmVzcyhhZGRyZXNzKSB7XG4gICAgaWYgKCFpc0hleFN0cmluZyhhZGRyZXNzLCAyMCkpIHtcbiAgICAgICAgbG9nZ2VyLnRocm93QXJndW1lbnRFcnJvcihcImludmFsaWQgYWRkcmVzc1wiLCBcImFkZHJlc3NcIiwgYWRkcmVzcyk7XG4gICAgfVxuICAgIGFkZHJlc3MgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3QgY2hhcnMgPSBhZGRyZXNzLnN1YnN0cmluZygyKS5zcGxpdChcIlwiKTtcbiAgICBjb25zdCBleHBhbmRlZCA9IG5ldyBVaW50OEFycmF5KDQwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQwOyBpKyspIHtcbiAgICAgICAgZXhwYW5kZWRbaV0gPSBjaGFyc1tpXS5jaGFyQ29kZUF0KDApO1xuICAgIH1cbiAgICBjb25zdCBoYXNoZWQgPSBhcnJheWlmeShrZWNjYWsyNTYoZXhwYW5kZWQpKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQwOyBpICs9IDIpIHtcbiAgICAgICAgaWYgKChoYXNoZWRbaSA+PiAxXSA+PiA0KSA+PSA4KSB7XG4gICAgICAgICAgICBjaGFyc1tpXSA9IGNoYXJzW2ldLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChoYXNoZWRbaSA+PiAxXSAmIDB4MGYpID49IDgpIHtcbiAgICAgICAgICAgIGNoYXJzW2kgKyAxXSA9IGNoYXJzW2kgKyAxXS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBcIjB4XCIgKyBjaGFycy5qb2luKFwiXCIpO1xufVxuLy8gU2hpbXMgZm9yIGVudmlyb25tZW50cyB0aGF0IGFyZSBtaXNzaW5nIHNvbWUgcmVxdWlyZWQgY29uc3RhbnRzIGFuZCBmdW5jdGlvbnNcbmNvbnN0IE1BWF9TQUZFX0lOVEVHRVIgPSAweDFmZmZmZmZmZmZmZmZmO1xuZnVuY3Rpb24gbG9nMTAoeCkge1xuICAgIGlmIChNYXRoLmxvZzEwKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmxvZzEwKHgpO1xuICAgIH1cbiAgICByZXR1cm4gTWF0aC5sb2coeCkgLyBNYXRoLkxOMTA7XG59XG4vLyBTZWU6IGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0ludGVybmF0aW9uYWxfQmFua19BY2NvdW50X051bWJlclxuLy8gQ3JlYXRlIGxvb2t1cCB0YWJsZVxuY29uc3QgaWJhbkxvb2t1cCA9IHt9O1xuZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgaWJhbkxvb2t1cFtTdHJpbmcoaSldID0gU3RyaW5nKGkpO1xufVxuZm9yIChsZXQgaSA9IDA7IGkgPCAyNjsgaSsrKSB7XG4gICAgaWJhbkxvb2t1cFtTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgaSldID0gU3RyaW5nKDEwICsgaSk7XG59XG4vLyBIb3cgbWFueSBkZWNpbWFsIGRpZ2l0cyBjYW4gd2UgcHJvY2Vzcz8gKGZvciA2NC1iaXQgZmxvYXQsIHRoaXMgaXMgMTUpXG5jb25zdCBzYWZlRGlnaXRzID0gTWF0aC5mbG9vcihsb2cxMChNQVhfU0FGRV9JTlRFR0VSKSk7XG5mdW5jdGlvbiBpYmFuQ2hlY2tzdW0oYWRkcmVzcykge1xuICAgIGFkZHJlc3MgPSBhZGRyZXNzLnRvVXBwZXJDYXNlKCk7XG4gICAgYWRkcmVzcyA9IGFkZHJlc3Muc3Vic3RyaW5nKDQpICsgYWRkcmVzcy5zdWJzdHJpbmcoMCwgMikgKyBcIjAwXCI7XG4gICAgbGV0IGV4cGFuZGVkID0gYWRkcmVzcy5zcGxpdChcIlwiKS5tYXAoKGMpID0+IHsgcmV0dXJuIGliYW5Mb29rdXBbY107IH0pLmpvaW4oXCJcIik7XG4gICAgLy8gSmF2YXNjcmlwdCBjYW4gaGFuZGxlIGludGVnZXJzIHNhZmVseSB1cCB0byAxNSAoZGVjaW1hbCkgZGlnaXRzXG4gICAgd2hpbGUgKGV4cGFuZGVkLmxlbmd0aCA+PSBzYWZlRGlnaXRzKSB7XG4gICAgICAgIGxldCBibG9jayA9IGV4cGFuZGVkLnN1YnN0cmluZygwLCBzYWZlRGlnaXRzKTtcbiAgICAgICAgZXhwYW5kZWQgPSBwYXJzZUludChibG9jaywgMTApICUgOTcgKyBleHBhbmRlZC5zdWJzdHJpbmcoYmxvY2subGVuZ3RoKTtcbiAgICB9XG4gICAgbGV0IGNoZWNrc3VtID0gU3RyaW5nKDk4IC0gKHBhcnNlSW50KGV4cGFuZGVkLCAxMCkgJSA5NykpO1xuICAgIHdoaWxlIChjaGVja3N1bS5sZW5ndGggPCAyKSB7XG4gICAgICAgIGNoZWNrc3VtID0gXCIwXCIgKyBjaGVja3N1bTtcbiAgICB9XG4gICAgcmV0dXJuIGNoZWNrc3VtO1xufVxuO1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFkZHJlc3MoYWRkcmVzcykge1xuICAgIGxldCByZXN1bHQgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgKGFkZHJlc3MpICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGxvZ2dlci50aHJvd0FyZ3VtZW50RXJyb3IoXCJpbnZhbGlkIGFkZHJlc3NcIiwgXCJhZGRyZXNzXCIsIGFkZHJlc3MpO1xuICAgIH1cbiAgICBpZiAoYWRkcmVzcy5tYXRjaCgvXigweCk/WzAtOWEtZkEtRl17NDB9JC8pKSB7XG4gICAgICAgIC8vIE1pc3NpbmcgdGhlIDB4IHByZWZpeFxuICAgICAgICBpZiAoYWRkcmVzcy5zdWJzdHJpbmcoMCwgMikgIT09IFwiMHhcIikge1xuICAgICAgICAgICAgYWRkcmVzcyA9IFwiMHhcIiArIGFkZHJlc3M7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gZ2V0Q2hlY2tzdW1BZGRyZXNzKGFkZHJlc3MpO1xuICAgICAgICAvLyBJdCBpcyBhIGNoZWNrc3VtbWVkIGFkZHJlc3Mgd2l0aCBhIGJhZCBjaGVja3N1bVxuICAgICAgICBpZiAoYWRkcmVzcy5tYXRjaCgvKFtBLUZdLipbYS1mXSl8KFthLWZdLipbQS1GXSkvKSAmJiByZXN1bHQgIT09IGFkZHJlc3MpIHtcbiAgICAgICAgICAgIGxvZ2dlci50aHJvd0FyZ3VtZW50RXJyb3IoXCJiYWQgYWRkcmVzcyBjaGVja3N1bVwiLCBcImFkZHJlc3NcIiwgYWRkcmVzcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWF5YmUgSUNBUD8gKHdlIG9ubHkgc3VwcG9ydCBkaXJlY3QgbW9kZSlcbiAgICB9XG4gICAgZWxzZSBpZiAoYWRkcmVzcy5tYXRjaCgvXlhFWzAtOV17Mn1bMC05QS1aYS16XXszMCwzMX0kLykpIHtcbiAgICAgICAgLy8gSXQgaXMgYW4gSUNBUCBhZGRyZXNzIHdpdGggYSBiYWQgY2hlY2tzdW1cbiAgICAgICAgaWYgKGFkZHJlc3Muc3Vic3RyaW5nKDIsIDQpICE9PSBpYmFuQ2hlY2tzdW0oYWRkcmVzcykpIHtcbiAgICAgICAgICAgIGxvZ2dlci50aHJvd0FyZ3VtZW50RXJyb3IoXCJiYWQgaWNhcCBjaGVja3N1bVwiLCBcImFkZHJlc3NcIiwgYWRkcmVzcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gX2Jhc2UzNlRvMTYoYWRkcmVzcy5zdWJzdHJpbmcoNCkpO1xuICAgICAgICB3aGlsZSAocmVzdWx0Lmxlbmd0aCA8IDQwKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBcIjBcIiArIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBnZXRDaGVja3N1bUFkZHJlc3MoXCIweFwiICsgcmVzdWx0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxvZ2dlci50aHJvd0FyZ3VtZW50RXJyb3IoXCJpbnZhbGlkIGFkZHJlc3NcIiwgXCJhZGRyZXNzXCIsIGFkZHJlc3MpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQWRkcmVzcyhhZGRyZXNzKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgZ2V0QWRkcmVzcyhhZGRyZXNzKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikgeyB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldEljYXBBZGRyZXNzKGFkZHJlc3MpIHtcbiAgICBsZXQgYmFzZTM2ID0gX2Jhc2UxNlRvMzYoZ2V0QWRkcmVzcyhhZGRyZXNzKS5zdWJzdHJpbmcoMikpLnRvVXBwZXJDYXNlKCk7XG4gICAgd2hpbGUgKGJhc2UzNi5sZW5ndGggPCAzMCkge1xuICAgICAgICBiYXNlMzYgPSBcIjBcIiArIGJhc2UzNjtcbiAgICB9XG4gICAgcmV0dXJuIFwiWEVcIiArIGliYW5DaGVja3N1bShcIlhFMDBcIiArIGJhc2UzNikgKyBiYXNlMzY7XG59XG4vLyBodHRwOi8vZXRoZXJldW0uc3RhY2tleGNoYW5nZS5jb20vcXVlc3Rpb25zLzc2MC9ob3ctaXMtdGhlLWFkZHJlc3Mtb2YtYW4tZXRoZXJldW0tY29udHJhY3QtY29tcHV0ZWRcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250cmFjdEFkZHJlc3ModHJhbnNhY3Rpb24pIHtcbiAgICBsZXQgZnJvbSA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgZnJvbSA9IGdldEFkZHJlc3ModHJhbnNhY3Rpb24uZnJvbSk7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICBsb2dnZXIudGhyb3dBcmd1bWVudEVycm9yKFwibWlzc2luZyBmcm9tIGFkZHJlc3NcIiwgXCJ0cmFuc2FjdGlvblwiLCB0cmFuc2FjdGlvbik7XG4gICAgfVxuICAgIGNvbnN0IG5vbmNlID0gc3RyaXBaZXJvcyhhcnJheWlmeShCaWdOdW1iZXIuZnJvbSh0cmFuc2FjdGlvbi5ub25jZSkudG9IZXhTdHJpbmcoKSkpO1xuICAgIHJldHVybiBnZXRBZGRyZXNzKGhleERhdGFTbGljZShrZWNjYWsyNTYoZW5jb2RlKFtmcm9tLCBub25jZV0pKSwgMTIpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRDcmVhdGUyQWRkcmVzcyhmcm9tLCBzYWx0LCBpbml0Q29kZUhhc2gpIHtcbiAgICBpZiAoaGV4RGF0YUxlbmd0aChzYWx0KSAhPT0gMzIpIHtcbiAgICAgICAgbG9nZ2VyLnRocm93QXJndW1lbnRFcnJvcihcInNhbHQgbXVzdCBiZSAzMiBieXRlc1wiLCBcInNhbHRcIiwgc2FsdCk7XG4gICAgfVxuICAgIGlmIChoZXhEYXRhTGVuZ3RoKGluaXRDb2RlSGFzaCkgIT09IDMyKSB7XG4gICAgICAgIGxvZ2dlci50aHJvd0FyZ3VtZW50RXJyb3IoXCJpbml0Q29kZUhhc2ggbXVzdCBiZSAzMiBieXRlc1wiLCBcImluaXRDb2RlSGFzaFwiLCBpbml0Q29kZUhhc2gpO1xuICAgIH1cbiAgICByZXR1cm4gZ2V0QWRkcmVzcyhoZXhEYXRhU2xpY2Uoa2VjY2FrMjU2KGNvbmNhdChbXCIweGZmXCIsIGdldEFkZHJlc3MoZnJvbSksIHNhbHQsIGluaXRDb2RlSGFzaF0pKSwgMTIpKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/@ethersproject+address@5.7.0/node_modules/@ethersproject/address/lib.esm/index.js\n");

/***/ })

};
;