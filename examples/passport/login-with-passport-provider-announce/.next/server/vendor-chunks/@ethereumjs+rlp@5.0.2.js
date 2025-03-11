"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@ethereumjs+rlp@5.0.2";
exports.ids = ["vendor-chunks/@ethereumjs+rlp@5.0.2"];
exports.modules = {

/***/ "(ssr)/../../../node_modules/.pnpm/@ethereumjs+rlp@5.0.2/node_modules/@ethereumjs/rlp/dist/esm/index.js":
/*!********************************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/@ethereumjs+rlp@5.0.2/node_modules/@ethereumjs/rlp/dist/esm/index.js ***!
  \********************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   RLP: () => (/* binding */ RLP),\n/* harmony export */   decode: () => (/* binding */ decode),\n/* harmony export */   encode: () => (/* binding */ encode),\n/* harmony export */   utils: () => (/* binding */ utils)\n/* harmony export */ });\n/**\n * RLP Encoding based on https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp/\n * This function takes in data, converts it to Uint8Array if not,\n * and adds a length for recursion.\n * @param input Will be converted to Uint8Array\n * @returns Uint8Array of encoded data\n **/\nfunction encode(input) {\n    if (Array.isArray(input)) {\n        const output = [];\n        let outputLength = 0;\n        for (let i = 0; i < input.length; i++) {\n            const encoded = encode(input[i]);\n            output.push(encoded);\n            outputLength += encoded.length;\n        }\n        return concatBytes(encodeLength(outputLength, 192), ...output);\n    }\n    const inputBuf = toBytes(input);\n    if (inputBuf.length === 1 && inputBuf[0] < 128) {\n        return inputBuf;\n    }\n    return concatBytes(encodeLength(inputBuf.length, 128), inputBuf);\n}\n/**\n * Slices a Uint8Array, throws if the slice goes out-of-bounds of the Uint8Array.\n * E.g. `safeSlice(hexToBytes('aa'), 1, 2)` will throw.\n * @param input\n * @param start\n * @param end\n */\nfunction safeSlice(input, start, end) {\n    if (end > input.length) {\n        throw new Error('invalid RLP (safeSlice): end slice of Uint8Array out-of-bounds');\n    }\n    return input.slice(start, end);\n}\n/**\n * Parse integers. Check if there is no leading zeros\n * @param v The value to parse\n */\nfunction decodeLength(v) {\n    if (v[0] === 0) {\n        throw new Error('invalid RLP: extra zeros');\n    }\n    return parseHexByte(bytesToHex(v));\n}\nfunction encodeLength(len, offset) {\n    if (len < 56) {\n        return Uint8Array.from([len + offset]);\n    }\n    const hexLength = numberToHex(len);\n    const lLength = hexLength.length / 2;\n    const firstByte = numberToHex(offset + 55 + lLength);\n    return Uint8Array.from(hexToBytes(firstByte + hexLength));\n}\nfunction decode(input, stream = false) {\n    if (typeof input === 'undefined' || input === null || input.length === 0) {\n        return Uint8Array.from([]);\n    }\n    const inputBytes = toBytes(input);\n    const decoded = _decode(inputBytes);\n    if (stream) {\n        return {\n            data: decoded.data,\n            remainder: decoded.remainder.slice(),\n        };\n    }\n    if (decoded.remainder.length !== 0) {\n        throw new Error('invalid RLP: remainder must be zero');\n    }\n    return decoded.data;\n}\n/** Decode an input with RLP */\nfunction _decode(input) {\n    let length, llength, data, innerRemainder, d;\n    const decoded = [];\n    const firstByte = input[0];\n    if (firstByte <= 0x7f) {\n        // a single byte whose value is in the [0x00, 0x7f] range, that byte is its own RLP encoding.\n        return {\n            data: input.slice(0, 1),\n            remainder: input.subarray(1),\n        };\n    }\n    else if (firstByte <= 0xb7) {\n        // string is 0-55 bytes long. A single byte with value 0x80 plus the length of the string followed by the string\n        // The range of the first byte is [0x80, 0xb7]\n        length = firstByte - 0x7f;\n        // set 0x80 null to 0\n        if (firstByte === 0x80) {\n            data = Uint8Array.from([]);\n        }\n        else {\n            data = safeSlice(input, 1, length);\n        }\n        if (length === 2 && data[0] < 0x80) {\n            throw new Error('invalid RLP encoding: invalid prefix, single byte < 0x80 are not prefixed');\n        }\n        return {\n            data,\n            remainder: input.subarray(length),\n        };\n    }\n    else if (firstByte <= 0xbf) {\n        // string is greater than 55 bytes long. A single byte with the value (0xb7 plus the length of the length),\n        // followed by the length, followed by the string\n        llength = firstByte - 0xb6;\n        if (input.length - 1 < llength) {\n            throw new Error('invalid RLP: not enough bytes for string length');\n        }\n        length = decodeLength(safeSlice(input, 1, llength));\n        if (length <= 55) {\n            throw new Error('invalid RLP: expected string length to be greater than 55');\n        }\n        data = safeSlice(input, llength, length + llength);\n        return {\n            data,\n            remainder: input.subarray(length + llength),\n        };\n    }\n    else if (firstByte <= 0xf7) {\n        // a list between 0-55 bytes long\n        length = firstByte - 0xbf;\n        innerRemainder = safeSlice(input, 1, length);\n        while (innerRemainder.length) {\n            d = _decode(innerRemainder);\n            decoded.push(d.data);\n            innerRemainder = d.remainder;\n        }\n        return {\n            data: decoded,\n            remainder: input.subarray(length),\n        };\n    }\n    else {\n        // a list over 55 bytes long\n        llength = firstByte - 0xf6;\n        length = decodeLength(safeSlice(input, 1, llength));\n        if (length < 56) {\n            throw new Error('invalid RLP: encoded list too short');\n        }\n        const totalLength = llength + length;\n        if (totalLength > input.length) {\n            throw new Error('invalid RLP: total length is larger than the data');\n        }\n        innerRemainder = safeSlice(input, llength, totalLength);\n        while (innerRemainder.length) {\n            d = _decode(innerRemainder);\n            decoded.push(d.data);\n            innerRemainder = d.remainder;\n        }\n        return {\n            data: decoded,\n            remainder: input.subarray(totalLength),\n        };\n    }\n}\nconst cachedHexes = Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, '0'));\nfunction bytesToHex(uint8a) {\n    // Pre-caching chars with `cachedHexes` speeds this up 6x\n    let hex = '';\n    for (let i = 0; i < uint8a.length; i++) {\n        hex += cachedHexes[uint8a[i]];\n    }\n    return hex;\n}\nfunction parseHexByte(hexByte) {\n    const byte = Number.parseInt(hexByte, 16);\n    if (Number.isNaN(byte))\n        throw new Error('Invalid byte sequence');\n    return byte;\n}\n// Caching slows it down 2-3x\nfunction hexToBytes(hex) {\n    if (typeof hex !== 'string') {\n        throw new TypeError('hexToBytes: expected string, got ' + typeof hex);\n    }\n    if (hex.length % 2)\n        throw new Error('hexToBytes: received invalid unpadded hex');\n    const array = new Uint8Array(hex.length / 2);\n    for (let i = 0; i < array.length; i++) {\n        const j = i * 2;\n        array[i] = parseHexByte(hex.slice(j, j + 2));\n    }\n    return array;\n}\n/** Concatenates two Uint8Arrays into one. */\nfunction concatBytes(...arrays) {\n    if (arrays.length === 1)\n        return arrays[0];\n    const length = arrays.reduce((a, arr) => a + arr.length, 0);\n    const result = new Uint8Array(length);\n    for (let i = 0, pad = 0; i < arrays.length; i++) {\n        const arr = arrays[i];\n        result.set(arr, pad);\n        pad += arr.length;\n    }\n    return result;\n}\nfunction utf8ToBytes(utf) {\n    return new TextEncoder().encode(utf);\n}\n/** Transform an integer into its hexadecimal value */\nfunction numberToHex(integer) {\n    if (integer < 0) {\n        throw new Error('Invalid integer as argument, must be unsigned!');\n    }\n    const hex = integer.toString(16);\n    return hex.length % 2 ? `0${hex}` : hex;\n}\n/** Pad a string to be even */\nfunction padToEven(a) {\n    return a.length % 2 ? `0${a}` : a;\n}\n/** Check if a string is prefixed by 0x */\nfunction isHexPrefixed(str) {\n    return str.length >= 2 && str[0] === '0' && str[1] === 'x';\n}\n/** Removes 0x from a given String */\nfunction stripHexPrefix(str) {\n    if (typeof str !== 'string') {\n        return str;\n    }\n    return isHexPrefixed(str) ? str.slice(2) : str;\n}\n/** Transform anything into a Uint8Array */\nfunction toBytes(v) {\n    if (v instanceof Uint8Array) {\n        return v;\n    }\n    if (typeof v === 'string') {\n        if (isHexPrefixed(v)) {\n            return hexToBytes(padToEven(stripHexPrefix(v)));\n        }\n        return utf8ToBytes(v);\n    }\n    if (typeof v === 'number' || typeof v === 'bigint') {\n        if (!v) {\n            return Uint8Array.from([]);\n        }\n        return hexToBytes(numberToHex(v));\n    }\n    if (v === null || v === undefined) {\n        return Uint8Array.from([]);\n    }\n    throw new Error('toBytes: received unsupported type ' + typeof v);\n}\nconst utils = {\n    bytesToHex,\n    concatBytes,\n    hexToBytes,\n    utf8ToBytes,\n};\nconst RLP = { encode, decode };\n//# sourceMappingURL=index.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BldGhlcmV1bWpzK3JscEA1LjAuMi9ub2RlX21vZHVsZXMvQGV0aGVyZXVtanMvcmxwL2Rpc3QvZXNtL2luZGV4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGtCQUFrQjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLGFBQWE7QUFDOUM7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLG1CQUFtQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0Isa0JBQWtCO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsbUJBQW1CO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyxJQUFJO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixFQUFFO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sY0FBYztBQUNyQiIsInNvdXJjZXMiOlsid2VicGFjazovL0BleGFtcGxlcy9sb2dpbi13aXRoLXBhc3Nwb3J0LXByb3ZpZGVyLWFubm91bmNlLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9AZXRoZXJldW1qcytybHBANS4wLjIvbm9kZV9tb2R1bGVzL0BldGhlcmV1bWpzL3JscC9kaXN0L2VzbS9pbmRleC5qcz83ODE2Il0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUkxQIEVuY29kaW5nIGJhc2VkIG9uIGh0dHBzOi8vZXRoZXJldW0ub3JnL2VuL2RldmVsb3BlcnMvZG9jcy9kYXRhLXN0cnVjdHVyZXMtYW5kLWVuY29kaW5nL3JscC9cbiAqIFRoaXMgZnVuY3Rpb24gdGFrZXMgaW4gZGF0YSwgY29udmVydHMgaXQgdG8gVWludDhBcnJheSBpZiBub3QsXG4gKiBhbmQgYWRkcyBhIGxlbmd0aCBmb3IgcmVjdXJzaW9uLlxuICogQHBhcmFtIGlucHV0IFdpbGwgYmUgY29udmVydGVkIHRvIFVpbnQ4QXJyYXlcbiAqIEByZXR1cm5zIFVpbnQ4QXJyYXkgb2YgZW5jb2RlZCBkYXRhXG4gKiovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlKGlucHV0KSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICAgIGNvbnN0IG91dHB1dCA9IFtdO1xuICAgICAgICBsZXQgb3V0cHV0TGVuZ3RoID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZW5jb2RlZCA9IGVuY29kZShpbnB1dFtpXSk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChlbmNvZGVkKTtcbiAgICAgICAgICAgIG91dHB1dExlbmd0aCArPSBlbmNvZGVkLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29uY2F0Qnl0ZXMoZW5jb2RlTGVuZ3RoKG91dHB1dExlbmd0aCwgMTkyKSwgLi4ub3V0cHV0KTtcbiAgICB9XG4gICAgY29uc3QgaW5wdXRCdWYgPSB0b0J5dGVzKGlucHV0KTtcbiAgICBpZiAoaW5wdXRCdWYubGVuZ3RoID09PSAxICYmIGlucHV0QnVmWzBdIDwgMTI4KSB7XG4gICAgICAgIHJldHVybiBpbnB1dEJ1ZjtcbiAgICB9XG4gICAgcmV0dXJuIGNvbmNhdEJ5dGVzKGVuY29kZUxlbmd0aChpbnB1dEJ1Zi5sZW5ndGgsIDEyOCksIGlucHV0QnVmKTtcbn1cbi8qKlxuICogU2xpY2VzIGEgVWludDhBcnJheSwgdGhyb3dzIGlmIHRoZSBzbGljZSBnb2VzIG91dC1vZi1ib3VuZHMgb2YgdGhlIFVpbnQ4QXJyYXkuXG4gKiBFLmcuIGBzYWZlU2xpY2UoaGV4VG9CeXRlcygnYWEnKSwgMSwgMilgIHdpbGwgdGhyb3cuXG4gKiBAcGFyYW0gaW5wdXRcbiAqIEBwYXJhbSBzdGFydFxuICogQHBhcmFtIGVuZFxuICovXG5mdW5jdGlvbiBzYWZlU2xpY2UoaW5wdXQsIHN0YXJ0LCBlbmQpIHtcbiAgICBpZiAoZW5kID4gaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBSTFAgKHNhZmVTbGljZSk6IGVuZCBzbGljZSBvZiBVaW50OEFycmF5IG91dC1vZi1ib3VuZHMnKTtcbiAgICB9XG4gICAgcmV0dXJuIGlucHV0LnNsaWNlKHN0YXJ0LCBlbmQpO1xufVxuLyoqXG4gKiBQYXJzZSBpbnRlZ2Vycy4gQ2hlY2sgaWYgdGhlcmUgaXMgbm8gbGVhZGluZyB6ZXJvc1xuICogQHBhcmFtIHYgVGhlIHZhbHVlIHRvIHBhcnNlXG4gKi9cbmZ1bmN0aW9uIGRlY29kZUxlbmd0aCh2KSB7XG4gICAgaWYgKHZbMF0gPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIFJMUDogZXh0cmEgemVyb3MnKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlSGV4Qnl0ZShieXRlc1RvSGV4KHYpKTtcbn1cbmZ1bmN0aW9uIGVuY29kZUxlbmd0aChsZW4sIG9mZnNldCkge1xuICAgIGlmIChsZW4gPCA1Nikge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5mcm9tKFtsZW4gKyBvZmZzZXRdKTtcbiAgICB9XG4gICAgY29uc3QgaGV4TGVuZ3RoID0gbnVtYmVyVG9IZXgobGVuKTtcbiAgICBjb25zdCBsTGVuZ3RoID0gaGV4TGVuZ3RoLmxlbmd0aCAvIDI7XG4gICAgY29uc3QgZmlyc3RCeXRlID0gbnVtYmVyVG9IZXgob2Zmc2V0ICsgNTUgKyBsTGVuZ3RoKTtcbiAgICByZXR1cm4gVWludDhBcnJheS5mcm9tKGhleFRvQnl0ZXMoZmlyc3RCeXRlICsgaGV4TGVuZ3RoKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlKGlucHV0LCBzdHJlYW0gPSBmYWxzZSkge1xuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICd1bmRlZmluZWQnIHx8IGlucHV0ID09PSBudWxsIHx8IGlucHV0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5mcm9tKFtdKTtcbiAgICB9XG4gICAgY29uc3QgaW5wdXRCeXRlcyA9IHRvQnl0ZXMoaW5wdXQpO1xuICAgIGNvbnN0IGRlY29kZWQgPSBfZGVjb2RlKGlucHV0Qnl0ZXMpO1xuICAgIGlmIChzdHJlYW0pIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IGRlY29kZWQuZGF0YSxcbiAgICAgICAgICAgIHJlbWFpbmRlcjogZGVjb2RlZC5yZW1haW5kZXIuc2xpY2UoKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKGRlY29kZWQucmVtYWluZGVyLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgUkxQOiByZW1haW5kZXIgbXVzdCBiZSB6ZXJvJyk7XG4gICAgfVxuICAgIHJldHVybiBkZWNvZGVkLmRhdGE7XG59XG4vKiogRGVjb2RlIGFuIGlucHV0IHdpdGggUkxQICovXG5mdW5jdGlvbiBfZGVjb2RlKGlucHV0KSB7XG4gICAgbGV0IGxlbmd0aCwgbGxlbmd0aCwgZGF0YSwgaW5uZXJSZW1haW5kZXIsIGQ7XG4gICAgY29uc3QgZGVjb2RlZCA9IFtdO1xuICAgIGNvbnN0IGZpcnN0Qnl0ZSA9IGlucHV0WzBdO1xuICAgIGlmIChmaXJzdEJ5dGUgPD0gMHg3Zikge1xuICAgICAgICAvLyBhIHNpbmdsZSBieXRlIHdob3NlIHZhbHVlIGlzIGluIHRoZSBbMHgwMCwgMHg3Zl0gcmFuZ2UsIHRoYXQgYnl0ZSBpcyBpdHMgb3duIFJMUCBlbmNvZGluZy5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IGlucHV0LnNsaWNlKDAsIDEpLFxuICAgICAgICAgICAgcmVtYWluZGVyOiBpbnB1dC5zdWJhcnJheSgxKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZmlyc3RCeXRlIDw9IDB4YjcpIHtcbiAgICAgICAgLy8gc3RyaW5nIGlzIDAtNTUgYnl0ZXMgbG9uZy4gQSBzaW5nbGUgYnl0ZSB3aXRoIHZhbHVlIDB4ODAgcGx1cyB0aGUgbGVuZ3RoIG9mIHRoZSBzdHJpbmcgZm9sbG93ZWQgYnkgdGhlIHN0cmluZ1xuICAgICAgICAvLyBUaGUgcmFuZ2Ugb2YgdGhlIGZpcnN0IGJ5dGUgaXMgWzB4ODAsIDB4YjddXG4gICAgICAgIGxlbmd0aCA9IGZpcnN0Qnl0ZSAtIDB4N2Y7XG4gICAgICAgIC8vIHNldCAweDgwIG51bGwgdG8gMFxuICAgICAgICBpZiAoZmlyc3RCeXRlID09PSAweDgwKSB7XG4gICAgICAgICAgICBkYXRhID0gVWludDhBcnJheS5mcm9tKFtdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRhdGEgPSBzYWZlU2xpY2UoaW5wdXQsIDEsIGxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA9PT0gMiAmJiBkYXRhWzBdIDwgMHg4MCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIFJMUCBlbmNvZGluZzogaW52YWxpZCBwcmVmaXgsIHNpbmdsZSBieXRlIDwgMHg4MCBhcmUgbm90IHByZWZpeGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICByZW1haW5kZXI6IGlucHV0LnN1YmFycmF5KGxlbmd0aCksXG4gICAgICAgIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKGZpcnN0Qnl0ZSA8PSAweGJmKSB7XG4gICAgICAgIC8vIHN0cmluZyBpcyBncmVhdGVyIHRoYW4gNTUgYnl0ZXMgbG9uZy4gQSBzaW5nbGUgYnl0ZSB3aXRoIHRoZSB2YWx1ZSAoMHhiNyBwbHVzIHRoZSBsZW5ndGggb2YgdGhlIGxlbmd0aCksXG4gICAgICAgIC8vIGZvbGxvd2VkIGJ5IHRoZSBsZW5ndGgsIGZvbGxvd2VkIGJ5IHRoZSBzdHJpbmdcbiAgICAgICAgbGxlbmd0aCA9IGZpcnN0Qnl0ZSAtIDB4YjY7XG4gICAgICAgIGlmIChpbnB1dC5sZW5ndGggLSAxIDwgbGxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIFJMUDogbm90IGVub3VnaCBieXRlcyBmb3Igc3RyaW5nIGxlbmd0aCcpO1xuICAgICAgICB9XG4gICAgICAgIGxlbmd0aCA9IGRlY29kZUxlbmd0aChzYWZlU2xpY2UoaW5wdXQsIDEsIGxsZW5ndGgpKTtcbiAgICAgICAgaWYgKGxlbmd0aCA8PSA1NSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIFJMUDogZXhwZWN0ZWQgc3RyaW5nIGxlbmd0aCB0byBiZSBncmVhdGVyIHRoYW4gNTUnKTtcbiAgICAgICAgfVxuICAgICAgICBkYXRhID0gc2FmZVNsaWNlKGlucHV0LCBsbGVuZ3RoLCBsZW5ndGggKyBsbGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICByZW1haW5kZXI6IGlucHV0LnN1YmFycmF5KGxlbmd0aCArIGxsZW5ndGgpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChmaXJzdEJ5dGUgPD0gMHhmNykge1xuICAgICAgICAvLyBhIGxpc3QgYmV0d2VlbiAwLTU1IGJ5dGVzIGxvbmdcbiAgICAgICAgbGVuZ3RoID0gZmlyc3RCeXRlIC0gMHhiZjtcbiAgICAgICAgaW5uZXJSZW1haW5kZXIgPSBzYWZlU2xpY2UoaW5wdXQsIDEsIGxlbmd0aCk7XG4gICAgICAgIHdoaWxlIChpbm5lclJlbWFpbmRlci5sZW5ndGgpIHtcbiAgICAgICAgICAgIGQgPSBfZGVjb2RlKGlubmVyUmVtYWluZGVyKTtcbiAgICAgICAgICAgIGRlY29kZWQucHVzaChkLmRhdGEpO1xuICAgICAgICAgICAgaW5uZXJSZW1haW5kZXIgPSBkLnJlbWFpbmRlcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogZGVjb2RlZCxcbiAgICAgICAgICAgIHJlbWFpbmRlcjogaW5wdXQuc3ViYXJyYXkobGVuZ3RoKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIGEgbGlzdCBvdmVyIDU1IGJ5dGVzIGxvbmdcbiAgICAgICAgbGxlbmd0aCA9IGZpcnN0Qnl0ZSAtIDB4ZjY7XG4gICAgICAgIGxlbmd0aCA9IGRlY29kZUxlbmd0aChzYWZlU2xpY2UoaW5wdXQsIDEsIGxsZW5ndGgpKTtcbiAgICAgICAgaWYgKGxlbmd0aCA8IDU2KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgUkxQOiBlbmNvZGVkIGxpc3QgdG9vIHNob3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdG90YWxMZW5ndGggPSBsbGVuZ3RoICsgbGVuZ3RoO1xuICAgICAgICBpZiAodG90YWxMZW5ndGggPiBpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBSTFA6IHRvdGFsIGxlbmd0aCBpcyBsYXJnZXIgdGhhbiB0aGUgZGF0YScpO1xuICAgICAgICB9XG4gICAgICAgIGlubmVyUmVtYWluZGVyID0gc2FmZVNsaWNlKGlucHV0LCBsbGVuZ3RoLCB0b3RhbExlbmd0aCk7XG4gICAgICAgIHdoaWxlIChpbm5lclJlbWFpbmRlci5sZW5ndGgpIHtcbiAgICAgICAgICAgIGQgPSBfZGVjb2RlKGlubmVyUmVtYWluZGVyKTtcbiAgICAgICAgICAgIGRlY29kZWQucHVzaChkLmRhdGEpO1xuICAgICAgICAgICAgaW5uZXJSZW1haW5kZXIgPSBkLnJlbWFpbmRlcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogZGVjb2RlZCxcbiAgICAgICAgICAgIHJlbWFpbmRlcjogaW5wdXQuc3ViYXJyYXkodG90YWxMZW5ndGgpLFxuICAgICAgICB9O1xuICAgIH1cbn1cbmNvbnN0IGNhY2hlZEhleGVzID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogMjU2IH0sIChfdiwgaSkgPT4gaS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSk7XG5mdW5jdGlvbiBieXRlc1RvSGV4KHVpbnQ4YSkge1xuICAgIC8vIFByZS1jYWNoaW5nIGNoYXJzIHdpdGggYGNhY2hlZEhleGVzYCBzcGVlZHMgdGhpcyB1cCA2eFxuICAgIGxldCBoZXggPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVpbnQ4YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBoZXggKz0gY2FjaGVkSGV4ZXNbdWludDhhW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIGhleDtcbn1cbmZ1bmN0aW9uIHBhcnNlSGV4Qnl0ZShoZXhCeXRlKSB7XG4gICAgY29uc3QgYnl0ZSA9IE51bWJlci5wYXJzZUludChoZXhCeXRlLCAxNik7XG4gICAgaWYgKE51bWJlci5pc05hTihieXRlKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJ5dGUgc2VxdWVuY2UnKTtcbiAgICByZXR1cm4gYnl0ZTtcbn1cbi8vIENhY2hpbmcgc2xvd3MgaXQgZG93biAyLTN4XG5mdW5jdGlvbiBoZXhUb0J5dGVzKGhleCkge1xuICAgIGlmICh0eXBlb2YgaGV4ICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdoZXhUb0J5dGVzOiBleHBlY3RlZCBzdHJpbmcsIGdvdCAnICsgdHlwZW9mIGhleCk7XG4gICAgfVxuICAgIGlmIChoZXgubGVuZ3RoICUgMilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdoZXhUb0J5dGVzOiByZWNlaXZlZCBpbnZhbGlkIHVucGFkZGVkIGhleCcpO1xuICAgIGNvbnN0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoaGV4Lmxlbmd0aCAvIDIpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgaiA9IGkgKiAyO1xuICAgICAgICBhcnJheVtpXSA9IHBhcnNlSGV4Qnl0ZShoZXguc2xpY2UoaiwgaiArIDIpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5O1xufVxuLyoqIENvbmNhdGVuYXRlcyB0d28gVWludDhBcnJheXMgaW50byBvbmUuICovXG5mdW5jdGlvbiBjb25jYXRCeXRlcyguLi5hcnJheXMpIHtcbiAgICBpZiAoYXJyYXlzLmxlbmd0aCA9PT0gMSlcbiAgICAgICAgcmV0dXJuIGFycmF5c1swXTtcbiAgICBjb25zdCBsZW5ndGggPSBhcnJheXMucmVkdWNlKChhLCBhcnIpID0+IGEgKyBhcnIubGVuZ3RoLCAwKTtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgVWludDhBcnJheShsZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwLCBwYWQgPSAwOyBpIDwgYXJyYXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGFyciA9IGFycmF5c1tpXTtcbiAgICAgICAgcmVzdWx0LnNldChhcnIsIHBhZCk7XG4gICAgICAgIHBhZCArPSBhcnIubGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gdXRmOFRvQnl0ZXModXRmKSB7XG4gICAgcmV0dXJuIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSh1dGYpO1xufVxuLyoqIFRyYW5zZm9ybSBhbiBpbnRlZ2VyIGludG8gaXRzIGhleGFkZWNpbWFsIHZhbHVlICovXG5mdW5jdGlvbiBudW1iZXJUb0hleChpbnRlZ2VyKSB7XG4gICAgaWYgKGludGVnZXIgPCAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnRlZ2VyIGFzIGFyZ3VtZW50LCBtdXN0IGJlIHVuc2lnbmVkIScpO1xuICAgIH1cbiAgICBjb25zdCBoZXggPSBpbnRlZ2VyLnRvU3RyaW5nKDE2KTtcbiAgICByZXR1cm4gaGV4Lmxlbmd0aCAlIDIgPyBgMCR7aGV4fWAgOiBoZXg7XG59XG4vKiogUGFkIGEgc3RyaW5nIHRvIGJlIGV2ZW4gKi9cbmZ1bmN0aW9uIHBhZFRvRXZlbihhKSB7XG4gICAgcmV0dXJuIGEubGVuZ3RoICUgMiA/IGAwJHthfWAgOiBhO1xufVxuLyoqIENoZWNrIGlmIGEgc3RyaW5nIGlzIHByZWZpeGVkIGJ5IDB4ICovXG5mdW5jdGlvbiBpc0hleFByZWZpeGVkKHN0cikge1xuICAgIHJldHVybiBzdHIubGVuZ3RoID49IDIgJiYgc3RyWzBdID09PSAnMCcgJiYgc3RyWzFdID09PSAneCc7XG59XG4vKiogUmVtb3ZlcyAweCBmcm9tIGEgZ2l2ZW4gU3RyaW5nICovXG5mdW5jdGlvbiBzdHJpcEhleFByZWZpeChzdHIpIHtcbiAgICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgcmV0dXJuIGlzSGV4UHJlZml4ZWQoc3RyKSA/IHN0ci5zbGljZSgyKSA6IHN0cjtcbn1cbi8qKiBUcmFuc2Zvcm0gYW55dGhpbmcgaW50byBhIFVpbnQ4QXJyYXkgKi9cbmZ1bmN0aW9uIHRvQnl0ZXModikge1xuICAgIGlmICh2IGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAoaXNIZXhQcmVmaXhlZCh2KSkge1xuICAgICAgICAgICAgcmV0dXJuIGhleFRvQnl0ZXMocGFkVG9FdmVuKHN0cmlwSGV4UHJlZml4KHYpKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHV0ZjhUb0J5dGVzKHYpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHYgPT09ICdudW1iZXInIHx8IHR5cGVvZiB2ID09PSAnYmlnaW50Jykge1xuICAgICAgICBpZiAoIXYpIHtcbiAgICAgICAgICAgIHJldHVybiBVaW50OEFycmF5LmZyb20oW10pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoZXhUb0J5dGVzKG51bWJlclRvSGV4KHYpKTtcbiAgICB9XG4gICAgaWYgKHYgPT09IG51bGwgfHwgdiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LmZyb20oW10pO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3RvQnl0ZXM6IHJlY2VpdmVkIHVuc3VwcG9ydGVkIHR5cGUgJyArIHR5cGVvZiB2KTtcbn1cbmV4cG9ydCBjb25zdCB1dGlscyA9IHtcbiAgICBieXRlc1RvSGV4LFxuICAgIGNvbmNhdEJ5dGVzLFxuICAgIGhleFRvQnl0ZXMsXG4gICAgdXRmOFRvQnl0ZXMsXG59O1xuZXhwb3J0IGNvbnN0IFJMUCA9IHsgZW5jb2RlLCBkZWNvZGUgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/@ethereumjs+rlp@5.0.2/node_modules/@ethereumjs/rlp/dist/esm/index.js\n");

/***/ })

};
;