"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/js-base64@3.7.7";
exports.ids = ["vendor-chunks/js-base64@3.7.7"];
exports.modules = {

/***/ "(ssr)/../../../node_modules/.pnpm/js-base64@3.7.7/node_modules/js-base64/base64.mjs":
/*!*************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/js-base64@3.7.7/node_modules/js-base64/base64.mjs ***!
  \*************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Base64: () => (/* binding */ gBase64),\n/* harmony export */   VERSION: () => (/* binding */ VERSION),\n/* harmony export */   atob: () => (/* binding */ _atob),\n/* harmony export */   atobPolyfill: () => (/* binding */ atobPolyfill),\n/* harmony export */   btoa: () => (/* binding */ _btoa),\n/* harmony export */   btoaPolyfill: () => (/* binding */ btoaPolyfill),\n/* harmony export */   btou: () => (/* binding */ btou),\n/* harmony export */   decode: () => (/* binding */ decode),\n/* harmony export */   encode: () => (/* binding */ encode),\n/* harmony export */   encodeURI: () => (/* binding */ encodeURI),\n/* harmony export */   encodeURL: () => (/* binding */ encodeURI),\n/* harmony export */   extendBuiltins: () => (/* binding */ extendBuiltins),\n/* harmony export */   extendString: () => (/* binding */ extendString),\n/* harmony export */   extendUint8Array: () => (/* binding */ extendUint8Array),\n/* harmony export */   fromBase64: () => (/* binding */ decode),\n/* harmony export */   fromUint8Array: () => (/* binding */ fromUint8Array),\n/* harmony export */   isValid: () => (/* binding */ isValid),\n/* harmony export */   toBase64: () => (/* binding */ encode),\n/* harmony export */   toUint8Array: () => (/* binding */ toUint8Array),\n/* harmony export */   utob: () => (/* binding */ utob),\n/* harmony export */   version: () => (/* binding */ version)\n/* harmony export */ });\n/**\n *  base64.ts\n *\n *  Licensed under the BSD 3-Clause License.\n *    http://opensource.org/licenses/BSD-3-Clause\n *\n *  References:\n *    http://en.wikipedia.org/wiki/Base64\n *\n * @author Dan Kogai (https://github.com/dankogai)\n */\nconst version = '3.7.7';\n/**\n * @deprecated use lowercase `version`.\n */\nconst VERSION = version;\nconst _hasBuffer = typeof Buffer === 'function';\nconst _TD = typeof TextDecoder === 'function' ? new TextDecoder() : undefined;\nconst _TE = typeof TextEncoder === 'function' ? new TextEncoder() : undefined;\nconst b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';\nconst b64chs = Array.prototype.slice.call(b64ch);\nconst b64tab = ((a) => {\n    let tab = {};\n    a.forEach((c, i) => tab[c] = i);\n    return tab;\n})(b64chs);\nconst b64re = /^(?:[A-Za-z\\d+\\/]{4})*?(?:[A-Za-z\\d+\\/]{2}(?:==)?|[A-Za-z\\d+\\/]{3}=?)?$/;\nconst _fromCC = String.fromCharCode.bind(String);\nconst _U8Afrom = typeof Uint8Array.from === 'function'\n    ? Uint8Array.from.bind(Uint8Array)\n    : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));\nconst _mkUriSafe = (src) => src\n    .replace(/=/g, '').replace(/[+\\/]/g, (m0) => m0 == '+' ? '-' : '_');\nconst _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\\+\\/]/g, '');\n/**\n * polyfill version of `btoa`\n */\nconst btoaPolyfill = (bin) => {\n    // console.log('polyfilled');\n    let u32, c0, c1, c2, asc = '';\n    const pad = bin.length % 3;\n    for (let i = 0; i < bin.length;) {\n        if ((c0 = bin.charCodeAt(i++)) > 255 ||\n            (c1 = bin.charCodeAt(i++)) > 255 ||\n            (c2 = bin.charCodeAt(i++)) > 255)\n            throw new TypeError('invalid character found');\n        u32 = (c0 << 16) | (c1 << 8) | c2;\n        asc += b64chs[u32 >> 18 & 63]\n            + b64chs[u32 >> 12 & 63]\n            + b64chs[u32 >> 6 & 63]\n            + b64chs[u32 & 63];\n    }\n    return pad ? asc.slice(0, pad - 3) + \"===\".substring(pad) : asc;\n};\n/**\n * does what `window.btoa` of web browsers do.\n * @param {String} bin binary string\n * @returns {string} Base64-encoded string\n */\nconst _btoa = typeof btoa === 'function' ? (bin) => btoa(bin)\n    : _hasBuffer ? (bin) => Buffer.from(bin, 'binary').toString('base64')\n        : btoaPolyfill;\nconst _fromUint8Array = _hasBuffer\n    ? (u8a) => Buffer.from(u8a).toString('base64')\n    : (u8a) => {\n        // cf. https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/12713326#12713326\n        const maxargs = 0x1000;\n        let strs = [];\n        for (let i = 0, l = u8a.length; i < l; i += maxargs) {\n            strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));\n        }\n        return _btoa(strs.join(''));\n    };\n/**\n * converts a Uint8Array to a Base64 string.\n * @param {boolean} [urlsafe] URL-and-filename-safe a la RFC4648 §5\n * @returns {string} Base64 string\n */\nconst fromUint8Array = (u8a, urlsafe = false) => urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);\n// This trick is found broken https://github.com/dankogai/js-base64/issues/130\n// const utob = (src: string) => unescape(encodeURIComponent(src));\n// reverting good old fationed regexp\nconst cb_utob = (c) => {\n    if (c.length < 2) {\n        var cc = c.charCodeAt(0);\n        return cc < 0x80 ? c\n            : cc < 0x800 ? (_fromCC(0xc0 | (cc >>> 6))\n                + _fromCC(0x80 | (cc & 0x3f)))\n                : (_fromCC(0xe0 | ((cc >>> 12) & 0x0f))\n                    + _fromCC(0x80 | ((cc >>> 6) & 0x3f))\n                    + _fromCC(0x80 | (cc & 0x3f)));\n    }\n    else {\n        var cc = 0x10000\n            + (c.charCodeAt(0) - 0xD800) * 0x400\n            + (c.charCodeAt(1) - 0xDC00);\n        return (_fromCC(0xf0 | ((cc >>> 18) & 0x07))\n            + _fromCC(0x80 | ((cc >>> 12) & 0x3f))\n            + _fromCC(0x80 | ((cc >>> 6) & 0x3f))\n            + _fromCC(0x80 | (cc & 0x3f)));\n    }\n};\nconst re_utob = /[\\uD800-\\uDBFF][\\uDC00-\\uDFFFF]|[^\\x00-\\x7F]/g;\n/**\n * @deprecated should have been internal use only.\n * @param {string} src UTF-8 string\n * @returns {string} UTF-16 string\n */\nconst utob = (u) => u.replace(re_utob, cb_utob);\n//\nconst _encode = _hasBuffer\n    ? (s) => Buffer.from(s, 'utf8').toString('base64')\n    : _TE\n        ? (s) => _fromUint8Array(_TE.encode(s))\n        : (s) => _btoa(utob(s));\n/**\n * converts a UTF-8-encoded string to a Base64 string.\n * @param {boolean} [urlsafe] if `true` make the result URL-safe\n * @returns {string} Base64 string\n */\nconst encode = (src, urlsafe = false) => urlsafe\n    ? _mkUriSafe(_encode(src))\n    : _encode(src);\n/**\n * converts a UTF-8-encoded string to URL-safe Base64 RFC4648 §5.\n * @returns {string} Base64 string\n */\nconst encodeURI = (src) => encode(src, true);\n// This trick is found broken https://github.com/dankogai/js-base64/issues/130\n// const btou = (src: string) => decodeURIComponent(escape(src));\n// reverting good old fationed regexp\nconst re_btou = /[\\xC0-\\xDF][\\x80-\\xBF]|[\\xE0-\\xEF][\\x80-\\xBF]{2}|[\\xF0-\\xF7][\\x80-\\xBF]{3}/g;\nconst cb_btou = (cccc) => {\n    switch (cccc.length) {\n        case 4:\n            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)\n                | ((0x3f & cccc.charCodeAt(1)) << 12)\n                | ((0x3f & cccc.charCodeAt(2)) << 6)\n                | (0x3f & cccc.charCodeAt(3)), offset = cp - 0x10000;\n            return (_fromCC((offset >>> 10) + 0xD800)\n                + _fromCC((offset & 0x3FF) + 0xDC00));\n        case 3:\n            return _fromCC(((0x0f & cccc.charCodeAt(0)) << 12)\n                | ((0x3f & cccc.charCodeAt(1)) << 6)\n                | (0x3f & cccc.charCodeAt(2)));\n        default:\n            return _fromCC(((0x1f & cccc.charCodeAt(0)) << 6)\n                | (0x3f & cccc.charCodeAt(1)));\n    }\n};\n/**\n * @deprecated should have been internal use only.\n * @param {string} src UTF-16 string\n * @returns {string} UTF-8 string\n */\nconst btou = (b) => b.replace(re_btou, cb_btou);\n/**\n * polyfill version of `atob`\n */\nconst atobPolyfill = (asc) => {\n    // console.log('polyfilled');\n    asc = asc.replace(/\\s+/g, '');\n    if (!b64re.test(asc))\n        throw new TypeError('malformed base64.');\n    asc += '=='.slice(2 - (asc.length & 3));\n    let u24, bin = '', r1, r2;\n    for (let i = 0; i < asc.length;) {\n        u24 = b64tab[asc.charAt(i++)] << 18\n            | b64tab[asc.charAt(i++)] << 12\n            | (r1 = b64tab[asc.charAt(i++)]) << 6\n            | (r2 = b64tab[asc.charAt(i++)]);\n        bin += r1 === 64 ? _fromCC(u24 >> 16 & 255)\n            : r2 === 64 ? _fromCC(u24 >> 16 & 255, u24 >> 8 & 255)\n                : _fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255);\n    }\n    return bin;\n};\n/**\n * does what `window.atob` of web browsers do.\n * @param {String} asc Base64-encoded string\n * @returns {string} binary string\n */\nconst _atob = typeof atob === 'function' ? (asc) => atob(_tidyB64(asc))\n    : _hasBuffer ? (asc) => Buffer.from(asc, 'base64').toString('binary')\n        : atobPolyfill;\n//\nconst _toUint8Array = _hasBuffer\n    ? (a) => _U8Afrom(Buffer.from(a, 'base64'))\n    : (a) => _U8Afrom(_atob(a).split('').map(c => c.charCodeAt(0)));\n/**\n * converts a Base64 string to a Uint8Array.\n */\nconst toUint8Array = (a) => _toUint8Array(_unURI(a));\n//\nconst _decode = _hasBuffer\n    ? (a) => Buffer.from(a, 'base64').toString('utf8')\n    : _TD\n        ? (a) => _TD.decode(_toUint8Array(a))\n        : (a) => btou(_atob(a));\nconst _unURI = (a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == '-' ? '+' : '/'));\n/**\n * converts a Base64 string to a UTF-8 string.\n * @param {String} src Base64 string.  Both normal and URL-safe are supported\n * @returns {string} UTF-8 string\n */\nconst decode = (src) => _decode(_unURI(src));\n/**\n * check if a value is a valid Base64 string\n * @param {String} src a value to check\n  */\nconst isValid = (src) => {\n    if (typeof src !== 'string')\n        return false;\n    const s = src.replace(/\\s+/g, '').replace(/={0,2}$/, '');\n    return !/[^\\s0-9a-zA-Z\\+/]/.test(s) || !/[^\\s0-9a-zA-Z\\-_]/.test(s);\n};\n//\nconst _noEnum = (v) => {\n    return {\n        value: v, enumerable: false, writable: true, configurable: true\n    };\n};\n/**\n * extend String.prototype with relevant methods\n */\nconst extendString = function () {\n    const _add = (name, body) => Object.defineProperty(String.prototype, name, _noEnum(body));\n    _add('fromBase64', function () { return decode(this); });\n    _add('toBase64', function (urlsafe) { return encode(this, urlsafe); });\n    _add('toBase64URI', function () { return encode(this, true); });\n    _add('toBase64URL', function () { return encode(this, true); });\n    _add('toUint8Array', function () { return toUint8Array(this); });\n};\n/**\n * extend Uint8Array.prototype with relevant methods\n */\nconst extendUint8Array = function () {\n    const _add = (name, body) => Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));\n    _add('toBase64', function (urlsafe) { return fromUint8Array(this, urlsafe); });\n    _add('toBase64URI', function () { return fromUint8Array(this, true); });\n    _add('toBase64URL', function () { return fromUint8Array(this, true); });\n};\n/**\n * extend Builtin prototypes with relevant methods\n */\nconst extendBuiltins = () => {\n    extendString();\n    extendUint8Array();\n};\nconst gBase64 = {\n    version: version,\n    VERSION: VERSION,\n    atob: _atob,\n    atobPolyfill: atobPolyfill,\n    btoa: _btoa,\n    btoaPolyfill: btoaPolyfill,\n    fromBase64: decode,\n    toBase64: encode,\n    encode: encode,\n    encodeURI: encodeURI,\n    encodeURL: encodeURI,\n    utob: utob,\n    btou: btou,\n    decode: decode,\n    isValid: isValid,\n    fromUint8Array: fromUint8Array,\n    toUint8Array: toUint8Array,\n    extendString: extendString,\n    extendUint8Array: extendUint8Array,\n    extendBuiltins: extendBuiltins\n};\n// makecjs:CUT //\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n// and finally,\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2pzLWJhc2U2NEAzLjcuNy9ub2RlX21vZHVsZXMvanMtYmFzZTY0L2Jhc2U2NC5tanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsaUNBQWlDLEVBQUUsb0JBQW9CLEVBQUUsc0JBQXNCLEVBQUU7QUFDakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixlQUFlO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLE9BQU87QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFNBQVM7QUFDcEIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0RBQStELEVBQUUsd0JBQXdCLEVBQUU7QUFDM0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGVBQWU7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQWlELElBQUk7QUFDckQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUMsc0JBQXNCO0FBQzNELDBDQUEwQywrQkFBK0I7QUFDekUsc0NBQXNDLDRCQUE0QjtBQUNsRSxzQ0FBc0MsNEJBQTRCO0FBQ2xFLHVDQUF1Qyw0QkFBNEI7QUFDbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLHVDQUF1QztBQUNqRixzQ0FBc0Msb0NBQW9DO0FBQzFFLHNDQUFzQyxvQ0FBb0M7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDbUI7QUFDQTtBQUNNO0FBQ0Q7QUFDQztBQUNEO0FBQ1E7QUFDRjtBQUNkO0FBQ0U7QUFDRztBQUNhO0FBQ2xCO0FBQ0U7QUFDQztBQUNPO0FBQ0Y7QUFDQTtBQUNJO0FBQ0Y7QUFDMUI7QUFDNkIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZXhhbXBsZXMvbG9naW4td2l0aC1wYXNzcG9ydC1icmlkZ2UvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2pzLWJhc2U2NEAzLjcuNy9ub2RlX21vZHVsZXMvanMtYmFzZTY0L2Jhc2U2NC5tanM/N2EwZiJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqICBiYXNlNjQudHNcbiAqXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIEJTRCAzLUNsYXVzZSBMaWNlbnNlLlxuICogICAgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICpcbiAqICBSZWZlcmVuY2VzOlxuICogICAgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CYXNlNjRcbiAqXG4gKiBAYXV0aG9yIERhbiBLb2dhaSAoaHR0cHM6Ly9naXRodWIuY29tL2RhbmtvZ2FpKVxuICovXG5jb25zdCB2ZXJzaW9uID0gJzMuNy43Jztcbi8qKlxuICogQGRlcHJlY2F0ZWQgdXNlIGxvd2VyY2FzZSBgdmVyc2lvbmAuXG4gKi9cbmNvbnN0IFZFUlNJT04gPSB2ZXJzaW9uO1xuY29uc3QgX2hhc0J1ZmZlciA9IHR5cGVvZiBCdWZmZXIgPT09ICdmdW5jdGlvbic7XG5jb25zdCBfVEQgPSB0eXBlb2YgVGV4dERlY29kZXIgPT09ICdmdW5jdGlvbicgPyBuZXcgVGV4dERlY29kZXIoKSA6IHVuZGVmaW5lZDtcbmNvbnN0IF9URSA9IHR5cGVvZiBUZXh0RW5jb2RlciA9PT0gJ2Z1bmN0aW9uJyA/IG5ldyBUZXh0RW5jb2RlcigpIDogdW5kZWZpbmVkO1xuY29uc3QgYjY0Y2ggPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nO1xuY29uc3QgYjY0Y2hzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYjY0Y2gpO1xuY29uc3QgYjY0dGFiID0gKChhKSA9PiB7XG4gICAgbGV0IHRhYiA9IHt9O1xuICAgIGEuZm9yRWFjaCgoYywgaSkgPT4gdGFiW2NdID0gaSk7XG4gICAgcmV0dXJuIHRhYjtcbn0pKGI2NGNocyk7XG5jb25zdCBiNjRyZSA9IC9eKD86W0EtWmEtelxcZCtcXC9dezR9KSo/KD86W0EtWmEtelxcZCtcXC9dezJ9KD86PT0pP3xbQS1aYS16XFxkK1xcL117M309Pyk/JC87XG5jb25zdCBfZnJvbUNDID0gU3RyaW5nLmZyb21DaGFyQ29kZS5iaW5kKFN0cmluZyk7XG5jb25zdCBfVThBZnJvbSA9IHR5cGVvZiBVaW50OEFycmF5LmZyb20gPT09ICdmdW5jdGlvbidcbiAgICA/IFVpbnQ4QXJyYXkuZnJvbS5iaW5kKFVpbnQ4QXJyYXkpXG4gICAgOiAoaXQpID0+IG5ldyBVaW50OEFycmF5KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGl0LCAwKSk7XG5jb25zdCBfbWtVcmlTYWZlID0gKHNyYykgPT4gc3JjXG4gICAgLnJlcGxhY2UoLz0vZywgJycpLnJlcGxhY2UoL1srXFwvXS9nLCAobTApID0+IG0wID09ICcrJyA/ICctJyA6ICdfJyk7XG5jb25zdCBfdGlkeUI2NCA9IChzKSA9PiBzLnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXS9nLCAnJyk7XG4vKipcbiAqIHBvbHlmaWxsIHZlcnNpb24gb2YgYGJ0b2FgXG4gKi9cbmNvbnN0IGJ0b2FQb2x5ZmlsbCA9IChiaW4pID0+IHtcbiAgICAvLyBjb25zb2xlLmxvZygncG9seWZpbGxlZCcpO1xuICAgIGxldCB1MzIsIGMwLCBjMSwgYzIsIGFzYyA9ICcnO1xuICAgIGNvbnN0IHBhZCA9IGJpbi5sZW5ndGggJSAzO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmluLmxlbmd0aDspIHtcbiAgICAgICAgaWYgKChjMCA9IGJpbi5jaGFyQ29kZUF0KGkrKykpID4gMjU1IHx8XG4gICAgICAgICAgICAoYzEgPSBiaW4uY2hhckNvZGVBdChpKyspKSA+IDI1NSB8fFxuICAgICAgICAgICAgKGMyID0gYmluLmNoYXJDb2RlQXQoaSsrKSkgPiAyNTUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpbnZhbGlkIGNoYXJhY3RlciBmb3VuZCcpO1xuICAgICAgICB1MzIgPSAoYzAgPDwgMTYpIHwgKGMxIDw8IDgpIHwgYzI7XG4gICAgICAgIGFzYyArPSBiNjRjaHNbdTMyID4+IDE4ICYgNjNdXG4gICAgICAgICAgICArIGI2NGNoc1t1MzIgPj4gMTIgJiA2M11cbiAgICAgICAgICAgICsgYjY0Y2hzW3UzMiA+PiA2ICYgNjNdXG4gICAgICAgICAgICArIGI2NGNoc1t1MzIgJiA2M107XG4gICAgfVxuICAgIHJldHVybiBwYWQgPyBhc2Muc2xpY2UoMCwgcGFkIC0gMykgKyBcIj09PVwiLnN1YnN0cmluZyhwYWQpIDogYXNjO1xufTtcbi8qKlxuICogZG9lcyB3aGF0IGB3aW5kb3cuYnRvYWAgb2Ygd2ViIGJyb3dzZXJzIGRvLlxuICogQHBhcmFtIHtTdHJpbmd9IGJpbiBiaW5hcnkgc3RyaW5nXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBCYXNlNjQtZW5jb2RlZCBzdHJpbmdcbiAqL1xuY29uc3QgX2J0b2EgPSB0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJyA/IChiaW4pID0+IGJ0b2EoYmluKVxuICAgIDogX2hhc0J1ZmZlciA/IChiaW4pID0+IEJ1ZmZlci5mcm9tKGJpbiwgJ2JpbmFyeScpLnRvU3RyaW5nKCdiYXNlNjQnKVxuICAgICAgICA6IGJ0b2FQb2x5ZmlsbDtcbmNvbnN0IF9mcm9tVWludDhBcnJheSA9IF9oYXNCdWZmZXJcbiAgICA/ICh1OGEpID0+IEJ1ZmZlci5mcm9tKHU4YSkudG9TdHJpbmcoJ2Jhc2U2NCcpXG4gICAgOiAodThhKSA9PiB7XG4gICAgICAgIC8vIGNmLiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjcxMDAwMS9ob3ctdG8tY29udmVydC11aW50OC1hcnJheS10by1iYXNlNjQtZW5jb2RlZC1zdHJpbmcvMTI3MTMzMjYjMTI3MTMzMjZcbiAgICAgICAgY29uc3QgbWF4YXJncyA9IDB4MTAwMDtcbiAgICAgICAgbGV0IHN0cnMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB1OGEubGVuZ3RoOyBpIDwgbDsgaSArPSBtYXhhcmdzKSB7XG4gICAgICAgICAgICBzdHJzLnB1c2goX2Zyb21DQy5hcHBseShudWxsLCB1OGEuc3ViYXJyYXkoaSwgaSArIG1heGFyZ3MpKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9idG9hKHN0cnMuam9pbignJykpO1xuICAgIH07XG4vKipcbiAqIGNvbnZlcnRzIGEgVWludDhBcnJheSB0byBhIEJhc2U2NCBzdHJpbmcuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFt1cmxzYWZlXSBVUkwtYW5kLWZpbGVuYW1lLXNhZmUgYSBsYSBSRkM0NjQ4IMKnNVxuICogQHJldHVybnMge3N0cmluZ30gQmFzZTY0IHN0cmluZ1xuICovXG5jb25zdCBmcm9tVWludDhBcnJheSA9ICh1OGEsIHVybHNhZmUgPSBmYWxzZSkgPT4gdXJsc2FmZSA/IF9ta1VyaVNhZmUoX2Zyb21VaW50OEFycmF5KHU4YSkpIDogX2Zyb21VaW50OEFycmF5KHU4YSk7XG4vLyBUaGlzIHRyaWNrIGlzIGZvdW5kIGJyb2tlbiBodHRwczovL2dpdGh1Yi5jb20vZGFua29nYWkvanMtYmFzZTY0L2lzc3Vlcy8xMzBcbi8vIGNvbnN0IHV0b2IgPSAoc3JjOiBzdHJpbmcpID0+IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChzcmMpKTtcbi8vIHJldmVydGluZyBnb29kIG9sZCBmYXRpb25lZCByZWdleHBcbmNvbnN0IGNiX3V0b2IgPSAoYykgPT4ge1xuICAgIGlmIChjLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgdmFyIGNjID0gYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICByZXR1cm4gY2MgPCAweDgwID8gY1xuICAgICAgICAgICAgOiBjYyA8IDB4ODAwID8gKF9mcm9tQ0MoMHhjMCB8IChjYyA+Pj4gNikpXG4gICAgICAgICAgICAgICAgKyBfZnJvbUNDKDB4ODAgfCAoY2MgJiAweDNmKSkpXG4gICAgICAgICAgICAgICAgOiAoX2Zyb21DQygweGUwIHwgKChjYyA+Pj4gMTIpICYgMHgwZikpXG4gICAgICAgICAgICAgICAgICAgICsgX2Zyb21DQygweDgwIHwgKChjYyA+Pj4gNikgJiAweDNmKSlcbiAgICAgICAgICAgICAgICAgICAgKyBfZnJvbUNDKDB4ODAgfCAoY2MgJiAweDNmKSkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIGNjID0gMHgxMDAwMFxuICAgICAgICAgICAgKyAoYy5jaGFyQ29kZUF0KDApIC0gMHhEODAwKSAqIDB4NDAwXG4gICAgICAgICAgICArIChjLmNoYXJDb2RlQXQoMSkgLSAweERDMDApO1xuICAgICAgICByZXR1cm4gKF9mcm9tQ0MoMHhmMCB8ICgoY2MgPj4+IDE4KSAmIDB4MDcpKVxuICAgICAgICAgICAgKyBfZnJvbUNDKDB4ODAgfCAoKGNjID4+PiAxMikgJiAweDNmKSlcbiAgICAgICAgICAgICsgX2Zyb21DQygweDgwIHwgKChjYyA+Pj4gNikgJiAweDNmKSlcbiAgICAgICAgICAgICsgX2Zyb21DQygweDgwIHwgKGNjICYgMHgzZikpKTtcbiAgICB9XG59O1xuY29uc3QgcmVfdXRvYiA9IC9bXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZGXXxbXlxceDAwLVxceDdGXS9nO1xuLyoqXG4gKiBAZGVwcmVjYXRlZCBzaG91bGQgaGF2ZSBiZWVuIGludGVybmFsIHVzZSBvbmx5LlxuICogQHBhcmFtIHtzdHJpbmd9IHNyYyBVVEYtOCBzdHJpbmdcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFVURi0xNiBzdHJpbmdcbiAqL1xuY29uc3QgdXRvYiA9ICh1KSA9PiB1LnJlcGxhY2UocmVfdXRvYiwgY2JfdXRvYik7XG4vL1xuY29uc3QgX2VuY29kZSA9IF9oYXNCdWZmZXJcbiAgICA/IChzKSA9PiBCdWZmZXIuZnJvbShzLCAndXRmOCcpLnRvU3RyaW5nKCdiYXNlNjQnKVxuICAgIDogX1RFXG4gICAgICAgID8gKHMpID0+IF9mcm9tVWludDhBcnJheShfVEUuZW5jb2RlKHMpKVxuICAgICAgICA6IChzKSA9PiBfYnRvYSh1dG9iKHMpKTtcbi8qKlxuICogY29udmVydHMgYSBVVEYtOC1lbmNvZGVkIHN0cmluZyB0byBhIEJhc2U2NCBzdHJpbmcuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFt1cmxzYWZlXSBpZiBgdHJ1ZWAgbWFrZSB0aGUgcmVzdWx0IFVSTC1zYWZlXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBCYXNlNjQgc3RyaW5nXG4gKi9cbmNvbnN0IGVuY29kZSA9IChzcmMsIHVybHNhZmUgPSBmYWxzZSkgPT4gdXJsc2FmZVxuICAgID8gX21rVXJpU2FmZShfZW5jb2RlKHNyYykpXG4gICAgOiBfZW5jb2RlKHNyYyk7XG4vKipcbiAqIGNvbnZlcnRzIGEgVVRGLTgtZW5jb2RlZCBzdHJpbmcgdG8gVVJMLXNhZmUgQmFzZTY0IFJGQzQ2NDggwqc1LlxuICogQHJldHVybnMge3N0cmluZ30gQmFzZTY0IHN0cmluZ1xuICovXG5jb25zdCBlbmNvZGVVUkkgPSAoc3JjKSA9PiBlbmNvZGUoc3JjLCB0cnVlKTtcbi8vIFRoaXMgdHJpY2sgaXMgZm91bmQgYnJva2VuIGh0dHBzOi8vZ2l0aHViLmNvbS9kYW5rb2dhaS9qcy1iYXNlNjQvaXNzdWVzLzEzMFxuLy8gY29uc3QgYnRvdSA9IChzcmM6IHN0cmluZykgPT4gZGVjb2RlVVJJQ29tcG9uZW50KGVzY2FwZShzcmMpKTtcbi8vIHJldmVydGluZyBnb29kIG9sZCBmYXRpb25lZCByZWdleHBcbmNvbnN0IHJlX2J0b3UgPSAvW1xceEMwLVxceERGXVtcXHg4MC1cXHhCRl18W1xceEUwLVxceEVGXVtcXHg4MC1cXHhCRl17Mn18W1xceEYwLVxceEY3XVtcXHg4MC1cXHhCRl17M30vZztcbmNvbnN0IGNiX2J0b3UgPSAoY2NjYykgPT4ge1xuICAgIHN3aXRjaCAoY2NjYy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgdmFyIGNwID0gKCgweDA3ICYgY2NjYy5jaGFyQ29kZUF0KDApKSA8PCAxOClcbiAgICAgICAgICAgICAgICB8ICgoMHgzZiAmIGNjY2MuY2hhckNvZGVBdCgxKSkgPDwgMTIpXG4gICAgICAgICAgICAgICAgfCAoKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMikpIDw8IDYpXG4gICAgICAgICAgICAgICAgfCAoMHgzZiAmIGNjY2MuY2hhckNvZGVBdCgzKSksIG9mZnNldCA9IGNwIC0gMHgxMDAwMDtcbiAgICAgICAgICAgIHJldHVybiAoX2Zyb21DQygob2Zmc2V0ID4+PiAxMCkgKyAweEQ4MDApXG4gICAgICAgICAgICAgICAgKyBfZnJvbUNDKChvZmZzZXQgJiAweDNGRikgKyAweERDMDApKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIF9mcm9tQ0MoKCgweDBmICYgY2NjYy5jaGFyQ29kZUF0KDApKSA8PCAxMilcbiAgICAgICAgICAgICAgICB8ICgoMHgzZiAmIGNjY2MuY2hhckNvZGVBdCgxKSkgPDwgNilcbiAgICAgICAgICAgICAgICB8ICgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDIpKSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gX2Zyb21DQygoKDB4MWYgJiBjY2NjLmNoYXJDb2RlQXQoMCkpIDw8IDYpXG4gICAgICAgICAgICAgICAgfCAoMHgzZiAmIGNjY2MuY2hhckNvZGVBdCgxKSkpO1xuICAgIH1cbn07XG4vKipcbiAqIEBkZXByZWNhdGVkIHNob3VsZCBoYXZlIGJlZW4gaW50ZXJuYWwgdXNlIG9ubHkuXG4gKiBAcGFyYW0ge3N0cmluZ30gc3JjIFVURi0xNiBzdHJpbmdcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFVURi04IHN0cmluZ1xuICovXG5jb25zdCBidG91ID0gKGIpID0+IGIucmVwbGFjZShyZV9idG91LCBjYl9idG91KTtcbi8qKlxuICogcG9seWZpbGwgdmVyc2lvbiBvZiBgYXRvYmBcbiAqL1xuY29uc3QgYXRvYlBvbHlmaWxsID0gKGFzYykgPT4ge1xuICAgIC8vIGNvbnNvbGUubG9nKCdwb2x5ZmlsbGVkJyk7XG4gICAgYXNjID0gYXNjLnJlcGxhY2UoL1xccysvZywgJycpO1xuICAgIGlmICghYjY0cmUudGVzdChhc2MpKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtYWxmb3JtZWQgYmFzZTY0LicpO1xuICAgIGFzYyArPSAnPT0nLnNsaWNlKDIgLSAoYXNjLmxlbmd0aCAmIDMpKTtcbiAgICBsZXQgdTI0LCBiaW4gPSAnJywgcjEsIHIyO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXNjLmxlbmd0aDspIHtcbiAgICAgICAgdTI0ID0gYjY0dGFiW2FzYy5jaGFyQXQoaSsrKV0gPDwgMThcbiAgICAgICAgICAgIHwgYjY0dGFiW2FzYy5jaGFyQXQoaSsrKV0gPDwgMTJcbiAgICAgICAgICAgIHwgKHIxID0gYjY0dGFiW2FzYy5jaGFyQXQoaSsrKV0pIDw8IDZcbiAgICAgICAgICAgIHwgKHIyID0gYjY0dGFiW2FzYy5jaGFyQXQoaSsrKV0pO1xuICAgICAgICBiaW4gKz0gcjEgPT09IDY0ID8gX2Zyb21DQyh1MjQgPj4gMTYgJiAyNTUpXG4gICAgICAgICAgICA6IHIyID09PSA2NCA/IF9mcm9tQ0ModTI0ID4+IDE2ICYgMjU1LCB1MjQgPj4gOCAmIDI1NSlcbiAgICAgICAgICAgICAgICA6IF9mcm9tQ0ModTI0ID4+IDE2ICYgMjU1LCB1MjQgPj4gOCAmIDI1NSwgdTI0ICYgMjU1KTtcbiAgICB9XG4gICAgcmV0dXJuIGJpbjtcbn07XG4vKipcbiAqIGRvZXMgd2hhdCBgd2luZG93LmF0b2JgIG9mIHdlYiBicm93c2VycyBkby5cbiAqIEBwYXJhbSB7U3RyaW5nfSBhc2MgQmFzZTY0LWVuY29kZWQgc3RyaW5nXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBiaW5hcnkgc3RyaW5nXG4gKi9cbmNvbnN0IF9hdG9iID0gdHlwZW9mIGF0b2IgPT09ICdmdW5jdGlvbicgPyAoYXNjKSA9PiBhdG9iKF90aWR5QjY0KGFzYykpXG4gICAgOiBfaGFzQnVmZmVyID8gKGFzYykgPT4gQnVmZmVyLmZyb20oYXNjLCAnYmFzZTY0JykudG9TdHJpbmcoJ2JpbmFyeScpXG4gICAgICAgIDogYXRvYlBvbHlmaWxsO1xuLy9cbmNvbnN0IF90b1VpbnQ4QXJyYXkgPSBfaGFzQnVmZmVyXG4gICAgPyAoYSkgPT4gX1U4QWZyb20oQnVmZmVyLmZyb20oYSwgJ2Jhc2U2NCcpKVxuICAgIDogKGEpID0+IF9VOEFmcm9tKF9hdG9iKGEpLnNwbGl0KCcnKS5tYXAoYyA9PiBjLmNoYXJDb2RlQXQoMCkpKTtcbi8qKlxuICogY29udmVydHMgYSBCYXNlNjQgc3RyaW5nIHRvIGEgVWludDhBcnJheS5cbiAqL1xuY29uc3QgdG9VaW50OEFycmF5ID0gKGEpID0+IF90b1VpbnQ4QXJyYXkoX3VuVVJJKGEpKTtcbi8vXG5jb25zdCBfZGVjb2RlID0gX2hhc0J1ZmZlclxuICAgID8gKGEpID0+IEJ1ZmZlci5mcm9tKGEsICdiYXNlNjQnKS50b1N0cmluZygndXRmOCcpXG4gICAgOiBfVERcbiAgICAgICAgPyAoYSkgPT4gX1RELmRlY29kZShfdG9VaW50OEFycmF5KGEpKVxuICAgICAgICA6IChhKSA9PiBidG91KF9hdG9iKGEpKTtcbmNvbnN0IF91blVSSSA9IChhKSA9PiBfdGlkeUI2NChhLnJlcGxhY2UoL1stX10vZywgKG0wKSA9PiBtMCA9PSAnLScgPyAnKycgOiAnLycpKTtcbi8qKlxuICogY29udmVydHMgYSBCYXNlNjQgc3RyaW5nIHRvIGEgVVRGLTggc3RyaW5nLlxuICogQHBhcmFtIHtTdHJpbmd9IHNyYyBCYXNlNjQgc3RyaW5nLiAgQm90aCBub3JtYWwgYW5kIFVSTC1zYWZlIGFyZSBzdXBwb3J0ZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFVURi04IHN0cmluZ1xuICovXG5jb25zdCBkZWNvZGUgPSAoc3JjKSA9PiBfZGVjb2RlKF91blVSSShzcmMpKTtcbi8qKlxuICogY2hlY2sgaWYgYSB2YWx1ZSBpcyBhIHZhbGlkIEJhc2U2NCBzdHJpbmdcbiAqIEBwYXJhbSB7U3RyaW5nfSBzcmMgYSB2YWx1ZSB0byBjaGVja1xuICAqL1xuY29uc3QgaXNWYWxpZCA9IChzcmMpID0+IHtcbiAgICBpZiAodHlwZW9mIHNyYyAhPT0gJ3N0cmluZycpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBzID0gc3JjLnJlcGxhY2UoL1xccysvZywgJycpLnJlcGxhY2UoLz17MCwyfSQvLCAnJyk7XG4gICAgcmV0dXJuICEvW15cXHMwLTlhLXpBLVpcXCsvXS8udGVzdChzKSB8fCAhL1teXFxzMC05YS16QS1aXFwtX10vLnRlc3Qocyk7XG59O1xuLy9cbmNvbnN0IF9ub0VudW0gPSAodikgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB2LCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH07XG59O1xuLyoqXG4gKiBleHRlbmQgU3RyaW5nLnByb3RvdHlwZSB3aXRoIHJlbGV2YW50IG1ldGhvZHNcbiAqL1xuY29uc3QgZXh0ZW5kU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IF9hZGQgPSAobmFtZSwgYm9keSkgPT4gT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0cmluZy5wcm90b3R5cGUsIG5hbWUsIF9ub0VudW0oYm9keSkpO1xuICAgIF9hZGQoJ2Zyb21CYXNlNjQnLCBmdW5jdGlvbiAoKSB7IHJldHVybiBkZWNvZGUodGhpcyk7IH0pO1xuICAgIF9hZGQoJ3RvQmFzZTY0JywgZnVuY3Rpb24gKHVybHNhZmUpIHsgcmV0dXJuIGVuY29kZSh0aGlzLCB1cmxzYWZlKTsgfSk7XG4gICAgX2FkZCgndG9CYXNlNjRVUkknLCBmdW5jdGlvbiAoKSB7IHJldHVybiBlbmNvZGUodGhpcywgdHJ1ZSk7IH0pO1xuICAgIF9hZGQoJ3RvQmFzZTY0VVJMJywgZnVuY3Rpb24gKCkgeyByZXR1cm4gZW5jb2RlKHRoaXMsIHRydWUpOyB9KTtcbiAgICBfYWRkKCd0b1VpbnQ4QXJyYXknLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0b1VpbnQ4QXJyYXkodGhpcyk7IH0pO1xufTtcbi8qKlxuICogZXh0ZW5kIFVpbnQ4QXJyYXkucHJvdG90eXBlIHdpdGggcmVsZXZhbnQgbWV0aG9kc1xuICovXG5jb25zdCBleHRlbmRVaW50OEFycmF5ID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IF9hZGQgPSAobmFtZSwgYm9keSkgPT4gT2JqZWN0LmRlZmluZVByb3BlcnR5KFVpbnQ4QXJyYXkucHJvdG90eXBlLCBuYW1lLCBfbm9FbnVtKGJvZHkpKTtcbiAgICBfYWRkKCd0b0Jhc2U2NCcsIGZ1bmN0aW9uICh1cmxzYWZlKSB7IHJldHVybiBmcm9tVWludDhBcnJheSh0aGlzLCB1cmxzYWZlKTsgfSk7XG4gICAgX2FkZCgndG9CYXNlNjRVUkknLCBmdW5jdGlvbiAoKSB7IHJldHVybiBmcm9tVWludDhBcnJheSh0aGlzLCB0cnVlKTsgfSk7XG4gICAgX2FkZCgndG9CYXNlNjRVUkwnLCBmdW5jdGlvbiAoKSB7IHJldHVybiBmcm9tVWludDhBcnJheSh0aGlzLCB0cnVlKTsgfSk7XG59O1xuLyoqXG4gKiBleHRlbmQgQnVpbHRpbiBwcm90b3R5cGVzIHdpdGggcmVsZXZhbnQgbWV0aG9kc1xuICovXG5jb25zdCBleHRlbmRCdWlsdGlucyA9ICgpID0+IHtcbiAgICBleHRlbmRTdHJpbmcoKTtcbiAgICBleHRlbmRVaW50OEFycmF5KCk7XG59O1xuY29uc3QgZ0Jhc2U2NCA9IHtcbiAgICB2ZXJzaW9uOiB2ZXJzaW9uLFxuICAgIFZFUlNJT046IFZFUlNJT04sXG4gICAgYXRvYjogX2F0b2IsXG4gICAgYXRvYlBvbHlmaWxsOiBhdG9iUG9seWZpbGwsXG4gICAgYnRvYTogX2J0b2EsXG4gICAgYnRvYVBvbHlmaWxsOiBidG9hUG9seWZpbGwsXG4gICAgZnJvbUJhc2U2NDogZGVjb2RlLFxuICAgIHRvQmFzZTY0OiBlbmNvZGUsXG4gICAgZW5jb2RlOiBlbmNvZGUsXG4gICAgZW5jb2RlVVJJOiBlbmNvZGVVUkksXG4gICAgZW5jb2RlVVJMOiBlbmNvZGVVUkksXG4gICAgdXRvYjogdXRvYixcbiAgICBidG91OiBidG91LFxuICAgIGRlY29kZTogZGVjb2RlLFxuICAgIGlzVmFsaWQ6IGlzVmFsaWQsXG4gICAgZnJvbVVpbnQ4QXJyYXk6IGZyb21VaW50OEFycmF5LFxuICAgIHRvVWludDhBcnJheTogdG9VaW50OEFycmF5LFxuICAgIGV4dGVuZFN0cmluZzogZXh0ZW5kU3RyaW5nLFxuICAgIGV4dGVuZFVpbnQ4QXJyYXk6IGV4dGVuZFVpbnQ4QXJyYXksXG4gICAgZXh0ZW5kQnVpbHRpbnM6IGV4dGVuZEJ1aWx0aW5zXG59O1xuLy8gbWFrZWNqczpDVVQgLy9cbmV4cG9ydCB7IHZlcnNpb24gfTtcbmV4cG9ydCB7IFZFUlNJT04gfTtcbmV4cG9ydCB7IF9hdG9iIGFzIGF0b2IgfTtcbmV4cG9ydCB7IGF0b2JQb2x5ZmlsbCB9O1xuZXhwb3J0IHsgX2J0b2EgYXMgYnRvYSB9O1xuZXhwb3J0IHsgYnRvYVBvbHlmaWxsIH07XG5leHBvcnQgeyBkZWNvZGUgYXMgZnJvbUJhc2U2NCB9O1xuZXhwb3J0IHsgZW5jb2RlIGFzIHRvQmFzZTY0IH07XG5leHBvcnQgeyB1dG9iIH07XG5leHBvcnQgeyBlbmNvZGUgfTtcbmV4cG9ydCB7IGVuY29kZVVSSSB9O1xuZXhwb3J0IHsgZW5jb2RlVVJJIGFzIGVuY29kZVVSTCB9O1xuZXhwb3J0IHsgYnRvdSB9O1xuZXhwb3J0IHsgZGVjb2RlIH07XG5leHBvcnQgeyBpc1ZhbGlkIH07XG5leHBvcnQgeyBmcm9tVWludDhBcnJheSB9O1xuZXhwb3J0IHsgdG9VaW50OEFycmF5IH07XG5leHBvcnQgeyBleHRlbmRTdHJpbmcgfTtcbmV4cG9ydCB7IGV4dGVuZFVpbnQ4QXJyYXkgfTtcbmV4cG9ydCB7IGV4dGVuZEJ1aWx0aW5zIH07XG4vLyBhbmQgZmluYWxseSxcbmV4cG9ydCB7IGdCYXNlNjQgYXMgQmFzZTY0IH07XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/js-base64@3.7.7/node_modules/js-base64/base64.mjs\n");

/***/ })

};
;