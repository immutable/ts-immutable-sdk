"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@scure+bip39@1.3.0";
exports.ids = ["vendor-chunks/@scure+bip39@1.3.0"];
exports.modules = {

/***/ "(ssr)/../../../node_modules/.pnpm/@scure+bip39@1.3.0/node_modules/@scure/bip39/esm/index.js":
/*!*********************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/@scure+bip39@1.3.0/node_modules/@scure/bip39/esm/index.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   entropyToMnemonic: () => (/* binding */ entropyToMnemonic),\n/* harmony export */   generateMnemonic: () => (/* binding */ generateMnemonic),\n/* harmony export */   mnemonicToEntropy: () => (/* binding */ mnemonicToEntropy),\n/* harmony export */   mnemonicToSeed: () => (/* binding */ mnemonicToSeed),\n/* harmony export */   mnemonicToSeedSync: () => (/* binding */ mnemonicToSeedSync),\n/* harmony export */   validateMnemonic: () => (/* binding */ validateMnemonic)\n/* harmony export */ });\n/* harmony import */ var _noble_hashes_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @noble/hashes/_assert */ \"(ssr)/../../../node_modules/.pnpm/@noble+hashes@1.4.0/node_modules/@noble/hashes/esm/_assert.js\");\n/* harmony import */ var _noble_hashes_pbkdf2__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @noble/hashes/pbkdf2 */ \"(ssr)/../../../node_modules/.pnpm/@noble+hashes@1.4.0/node_modules/@noble/hashes/esm/pbkdf2.js\");\n/* harmony import */ var _noble_hashes_sha256__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @noble/hashes/sha256 */ \"(ssr)/../../../node_modules/.pnpm/@noble+hashes@1.4.0/node_modules/@noble/hashes/esm/sha256.js\");\n/* harmony import */ var _noble_hashes_sha512__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @noble/hashes/sha512 */ \"(ssr)/../../../node_modules/.pnpm/@noble+hashes@1.4.0/node_modules/@noble/hashes/esm/sha512.js\");\n/* harmony import */ var _noble_hashes_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @noble/hashes/utils */ \"(ssr)/../../../node_modules/.pnpm/@noble+hashes@1.4.0/node_modules/@noble/hashes/esm/utils.js\");\n/* harmony import */ var _scure_base__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @scure/base */ \"(ssr)/../../../node_modules/.pnpm/@scure+base@1.1.7/node_modules/@scure/base/lib/esm/index.js\");\n/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */\n\n\n\n\n\n\n// Japanese wordlist\nconst isJapanese = (wordlist) => wordlist[0] === '\\u3042\\u3044\\u3053\\u304f\\u3057\\u3093';\n// Normalization replaces equivalent sequences of characters\n// so that any two texts that are equivalent will be reduced\n// to the same sequence of code points, called the normal form of the original text.\n// https://tonsky.me/blog/unicode/#why-is-a----\nfunction nfkd(str) {\n    if (typeof str !== 'string')\n        throw new TypeError(`Invalid mnemonic type: ${typeof str}`);\n    return str.normalize('NFKD');\n}\nfunction normalize(str) {\n    const norm = nfkd(str);\n    const words = norm.split(' ');\n    if (![12, 15, 18, 21, 24].includes(words.length))\n        throw new Error('Invalid mnemonic');\n    return { nfkd: norm, words };\n}\nfunction assertEntropy(entropy) {\n    (0,_noble_hashes_assert__WEBPACK_IMPORTED_MODULE_0__.bytes)(entropy, 16, 20, 24, 28, 32);\n}\n/**\n * Generate x random words. Uses Cryptographically-Secure Random Number Generator.\n * @param wordlist imported wordlist for specific language\n * @param strength mnemonic strength 128-256 bits\n * @example\n * generateMnemonic(wordlist, 128)\n * // 'legal winner thank year wave sausage worth useful legal winner thank yellow'\n */\nfunction generateMnemonic(wordlist, strength = 128) {\n    (0,_noble_hashes_assert__WEBPACK_IMPORTED_MODULE_0__.number)(strength);\n    if (strength % 32 !== 0 || strength > 256)\n        throw new TypeError('Invalid entropy');\n    return entropyToMnemonic((0,_noble_hashes_utils__WEBPACK_IMPORTED_MODULE_1__.randomBytes)(strength / 8), wordlist);\n}\nconst calcChecksum = (entropy) => {\n    // Checksum is ent.length/4 bits long\n    const bitsLeft = 8 - entropy.length / 4;\n    // Zero rightmost \"bitsLeft\" bits in byte\n    // For example: bitsLeft=4 val=10111101 -> 10110000\n    return new Uint8Array([((0,_noble_hashes_sha256__WEBPACK_IMPORTED_MODULE_2__.sha256)(entropy)[0] >> bitsLeft) << bitsLeft]);\n};\nfunction getCoder(wordlist) {\n    if (!Array.isArray(wordlist) || wordlist.length !== 2048 || typeof wordlist[0] !== 'string')\n        throw new Error('Wordlist: expected array of 2048 strings');\n    wordlist.forEach((i) => {\n        if (typeof i !== 'string')\n            throw new Error(`Wordlist: non-string element: ${i}`);\n    });\n    return _scure_base__WEBPACK_IMPORTED_MODULE_3__.utils.chain(_scure_base__WEBPACK_IMPORTED_MODULE_3__.utils.checksum(1, calcChecksum), _scure_base__WEBPACK_IMPORTED_MODULE_3__.utils.radix2(11, true), _scure_base__WEBPACK_IMPORTED_MODULE_3__.utils.alphabet(wordlist));\n}\n/**\n * Reversible: Converts mnemonic string to raw entropy in form of byte array.\n * @param mnemonic 12-24 words\n * @param wordlist imported wordlist for specific language\n * @example\n * const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';\n * mnemonicToEntropy(mnem, wordlist)\n * // Produces\n * new Uint8Array([\n *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f,\n *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f\n * ])\n */\nfunction mnemonicToEntropy(mnemonic, wordlist) {\n    const { words } = normalize(mnemonic);\n    const entropy = getCoder(wordlist).decode(words);\n    assertEntropy(entropy);\n    return entropy;\n}\n/**\n * Reversible: Converts raw entropy in form of byte array to mnemonic string.\n * @param entropy byte array\n * @param wordlist imported wordlist for specific language\n * @returns 12-24 words\n * @example\n * const ent = new Uint8Array([\n *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f,\n *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f\n * ]);\n * entropyToMnemonic(ent, wordlist);\n * // 'legal winner thank year wave sausage worth useful legal winner thank yellow'\n */\nfunction entropyToMnemonic(entropy, wordlist) {\n    assertEntropy(entropy);\n    const words = getCoder(wordlist).encode(entropy);\n    return words.join(isJapanese(wordlist) ? '\\u3000' : ' ');\n}\n/**\n * Validates mnemonic for being 12-24 words contained in `wordlist`.\n */\nfunction validateMnemonic(mnemonic, wordlist) {\n    try {\n        mnemonicToEntropy(mnemonic, wordlist);\n    }\n    catch (e) {\n        return false;\n    }\n    return true;\n}\nconst salt = (passphrase) => nfkd(`mnemonic${passphrase}`);\n/**\n * Irreversible: Uses KDF to derive 64 bytes of key data from mnemonic + optional password.\n * @param mnemonic 12-24 words\n * @param passphrase string that will additionally protect the key\n * @returns 64 bytes of key data\n * @example\n * const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';\n * await mnemonicToSeed(mnem, 'password');\n * // new Uint8Array([...64 bytes])\n */\nfunction mnemonicToSeed(mnemonic, passphrase = '') {\n    return (0,_noble_hashes_pbkdf2__WEBPACK_IMPORTED_MODULE_4__.pbkdf2Async)(_noble_hashes_sha512__WEBPACK_IMPORTED_MODULE_5__.sha512, normalize(mnemonic).nfkd, salt(passphrase), { c: 2048, dkLen: 64 });\n}\n/**\n * Irreversible: Uses KDF to derive 64 bytes of key data from mnemonic + optional password.\n * @param mnemonic 12-24 words\n * @param passphrase string that will additionally protect the key\n * @returns 64 bytes of key data\n * @example\n * const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';\n * mnemonicToSeedSync(mnem, 'password');\n * // new Uint8Array([...64 bytes])\n */\nfunction mnemonicToSeedSync(mnemonic, passphrase = '') {\n    return (0,_noble_hashes_pbkdf2__WEBPACK_IMPORTED_MODULE_4__.pbkdf2)(_noble_hashes_sha512__WEBPACK_IMPORTED_MODULE_5__.sha512, normalize(mnemonic).nfkd, salt(passphrase), { c: 2048, dkLen: 64 });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BzY3VyZStiaXAzOUAxLjMuMC9ub2RlX21vZHVsZXMvQHNjdXJlL2JpcDM5L2VzbS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNxRjtBQUMxQjtBQUNiO0FBQ0E7QUFDSTtBQUNEO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0QsV0FBVztBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsSUFBSSwyREFBVztBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1AsSUFBSSw0REFBWTtBQUNoQjtBQUNBO0FBQ0EsNkJBQTZCLGdFQUFXO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0Qiw0REFBTTtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2REFBNkQsRUFBRTtBQUMvRCxLQUFLO0FBQ0wsV0FBVyw4Q0FBUyxPQUFPLDhDQUFTLDRCQUE0Qiw4Q0FBUyxtQkFBbUIsOENBQVM7QUFDckc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1AsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLFdBQVc7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQLFdBQVcsaUVBQVcsQ0FBQyx3REFBTSxnREFBZ0Qsb0JBQW9CO0FBQ2pHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQLFdBQVcsNERBQU0sQ0FBQyx3REFBTSxnREFBZ0Qsb0JBQW9CO0FBQzVGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGV4YW1wbGVzL2xvZ2luLXdpdGgtcGFzc3BvcnQtcHJvdmlkZXItYW5ub3VuY2UvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BzY3VyZStiaXAzOUAxLjMuMC9ub2RlX21vZHVsZXMvQHNjdXJlL2JpcDM5L2VzbS9pbmRleC5qcz9iNTVjIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISBzY3VyZS1iaXAzOSAtIE1JVCBMaWNlbnNlIChjKSAyMDIyIFBhdHJpY2lvIFBhbGxhZGlubywgUGF1bCBNaWxsZXIgKHBhdWxtaWxsci5jb20pICovXG5pbXBvcnQgeyBieXRlcyBhcyBhc3NlcnRCeXRlcywgbnVtYmVyIGFzIGFzc2VydE51bWJlciB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvX2Fzc2VydCc7XG5pbXBvcnQgeyBwYmtkZjIsIHBia2RmMkFzeW5jIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9wYmtkZjInO1xuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyNTYnO1xuaW1wb3J0IHsgc2hhNTEyIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGE1MTInO1xuaW1wb3J0IHsgcmFuZG9tQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzJztcbmltcG9ydCB7IHV0aWxzIGFzIGJhc2VVdGlscyB9IGZyb20gJ0BzY3VyZS9iYXNlJztcbi8vIEphcGFuZXNlIHdvcmRsaXN0XG5jb25zdCBpc0phcGFuZXNlID0gKHdvcmRsaXN0KSA9PiB3b3JkbGlzdFswXSA9PT0gJ1xcdTMwNDJcXHUzMDQ0XFx1MzA1M1xcdTMwNGZcXHUzMDU3XFx1MzA5Myc7XG4vLyBOb3JtYWxpemF0aW9uIHJlcGxhY2VzIGVxdWl2YWxlbnQgc2VxdWVuY2VzIG9mIGNoYXJhY3RlcnNcbi8vIHNvIHRoYXQgYW55IHR3byB0ZXh0cyB0aGF0IGFyZSBlcXVpdmFsZW50IHdpbGwgYmUgcmVkdWNlZFxuLy8gdG8gdGhlIHNhbWUgc2VxdWVuY2Ugb2YgY29kZSBwb2ludHMsIGNhbGxlZCB0aGUgbm9ybWFsIGZvcm0gb2YgdGhlIG9yaWdpbmFsIHRleHQuXG4vLyBodHRwczovL3RvbnNreS5tZS9ibG9nL3VuaWNvZGUvI3doeS1pcy1hLS0tLVxuZnVuY3Rpb24gbmZrZChzdHIpIHtcbiAgICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgbW5lbW9uaWMgdHlwZTogJHt0eXBlb2Ygc3RyfWApO1xuICAgIHJldHVybiBzdHIubm9ybWFsaXplKCdORktEJyk7XG59XG5mdW5jdGlvbiBub3JtYWxpemUoc3RyKSB7XG4gICAgY29uc3Qgbm9ybSA9IG5ma2Qoc3RyKTtcbiAgICBjb25zdCB3b3JkcyA9IG5vcm0uc3BsaXQoJyAnKTtcbiAgICBpZiAoIVsxMiwgMTUsIDE4LCAyMSwgMjRdLmluY2x1ZGVzKHdvcmRzLmxlbmd0aCkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBtbmVtb25pYycpO1xuICAgIHJldHVybiB7IG5ma2Q6IG5vcm0sIHdvcmRzIH07XG59XG5mdW5jdGlvbiBhc3NlcnRFbnRyb3B5KGVudHJvcHkpIHtcbiAgICBhc3NlcnRCeXRlcyhlbnRyb3B5LCAxNiwgMjAsIDI0LCAyOCwgMzIpO1xufVxuLyoqXG4gKiBHZW5lcmF0ZSB4IHJhbmRvbSB3b3Jkcy4gVXNlcyBDcnlwdG9ncmFwaGljYWxseS1TZWN1cmUgUmFuZG9tIE51bWJlciBHZW5lcmF0b3IuXG4gKiBAcGFyYW0gd29yZGxpc3QgaW1wb3J0ZWQgd29yZGxpc3QgZm9yIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBAcGFyYW0gc3RyZW5ndGggbW5lbW9uaWMgc3RyZW5ndGggMTI4LTI1NiBiaXRzXG4gKiBAZXhhbXBsZVxuICogZ2VuZXJhdGVNbmVtb25pYyh3b3JkbGlzdCwgMTI4KVxuICogLy8gJ2xlZ2FsIHdpbm5lciB0aGFuayB5ZWFyIHdhdmUgc2F1c2FnZSB3b3J0aCB1c2VmdWwgbGVnYWwgd2lubmVyIHRoYW5rIHllbGxvdydcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlTW5lbW9uaWMod29yZGxpc3QsIHN0cmVuZ3RoID0gMTI4KSB7XG4gICAgYXNzZXJ0TnVtYmVyKHN0cmVuZ3RoKTtcbiAgICBpZiAoc3RyZW5ndGggJSAzMiAhPT0gMCB8fCBzdHJlbmd0aCA+IDI1NilcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBlbnRyb3B5Jyk7XG4gICAgcmV0dXJuIGVudHJvcHlUb01uZW1vbmljKHJhbmRvbUJ5dGVzKHN0cmVuZ3RoIC8gOCksIHdvcmRsaXN0KTtcbn1cbmNvbnN0IGNhbGNDaGVja3N1bSA9IChlbnRyb3B5KSA9PiB7XG4gICAgLy8gQ2hlY2tzdW0gaXMgZW50Lmxlbmd0aC80IGJpdHMgbG9uZ1xuICAgIGNvbnN0IGJpdHNMZWZ0ID0gOCAtIGVudHJvcHkubGVuZ3RoIC8gNDtcbiAgICAvLyBaZXJvIHJpZ2h0bW9zdCBcImJpdHNMZWZ0XCIgYml0cyBpbiBieXRlXG4gICAgLy8gRm9yIGV4YW1wbGU6IGJpdHNMZWZ0PTQgdmFsPTEwMTExMTAxIC0+IDEwMTEwMDAwXG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KFsoc2hhMjU2KGVudHJvcHkpWzBdID4+IGJpdHNMZWZ0KSA8PCBiaXRzTGVmdF0pO1xufTtcbmZ1bmN0aW9uIGdldENvZGVyKHdvcmRsaXN0KSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHdvcmRsaXN0KSB8fCB3b3JkbGlzdC5sZW5ndGggIT09IDIwNDggfHwgdHlwZW9mIHdvcmRsaXN0WzBdICE9PSAnc3RyaW5nJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXb3JkbGlzdDogZXhwZWN0ZWQgYXJyYXkgb2YgMjA0OCBzdHJpbmdzJyk7XG4gICAgd29yZGxpc3QuZm9yRWFjaCgoaSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGkgIT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXb3JkbGlzdDogbm9uLXN0cmluZyBlbGVtZW50OiAke2l9YCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGJhc2VVdGlscy5jaGFpbihiYXNlVXRpbHMuY2hlY2tzdW0oMSwgY2FsY0NoZWNrc3VtKSwgYmFzZVV0aWxzLnJhZGl4MigxMSwgdHJ1ZSksIGJhc2VVdGlscy5hbHBoYWJldCh3b3JkbGlzdCkpO1xufVxuLyoqXG4gKiBSZXZlcnNpYmxlOiBDb252ZXJ0cyBtbmVtb25pYyBzdHJpbmcgdG8gcmF3IGVudHJvcHkgaW4gZm9ybSBvZiBieXRlIGFycmF5LlxuICogQHBhcmFtIG1uZW1vbmljIDEyLTI0IHdvcmRzXG4gKiBAcGFyYW0gd29yZGxpc3QgaW1wb3J0ZWQgd29yZGxpc3QgZm9yIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBAZXhhbXBsZVxuICogY29uc3QgbW5lbSA9ICdsZWdhbCB3aW5uZXIgdGhhbmsgeWVhciB3YXZlIHNhdXNhZ2Ugd29ydGggdXNlZnVsIGxlZ2FsIHdpbm5lciB0aGFuayB5ZWxsb3cnO1xuICogbW5lbW9uaWNUb0VudHJvcHkobW5lbSwgd29yZGxpc3QpXG4gKiAvLyBQcm9kdWNlc1xuICogbmV3IFVpbnQ4QXJyYXkoW1xuICogICAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmLFxuICogICAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmXG4gKiBdKVxuICovXG5leHBvcnQgZnVuY3Rpb24gbW5lbW9uaWNUb0VudHJvcHkobW5lbW9uaWMsIHdvcmRsaXN0KSB7XG4gICAgY29uc3QgeyB3b3JkcyB9ID0gbm9ybWFsaXplKG1uZW1vbmljKTtcbiAgICBjb25zdCBlbnRyb3B5ID0gZ2V0Q29kZXIod29yZGxpc3QpLmRlY29kZSh3b3Jkcyk7XG4gICAgYXNzZXJ0RW50cm9weShlbnRyb3B5KTtcbiAgICByZXR1cm4gZW50cm9weTtcbn1cbi8qKlxuICogUmV2ZXJzaWJsZTogQ29udmVydHMgcmF3IGVudHJvcHkgaW4gZm9ybSBvZiBieXRlIGFycmF5IHRvIG1uZW1vbmljIHN0cmluZy5cbiAqIEBwYXJhbSBlbnRyb3B5IGJ5dGUgYXJyYXlcbiAqIEBwYXJhbSB3b3JkbGlzdCBpbXBvcnRlZCB3b3JkbGlzdCBmb3Igc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIEByZXR1cm5zIDEyLTI0IHdvcmRzXG4gKiBAZXhhbXBsZVxuICogY29uc3QgZW50ID0gbmV3IFVpbnQ4QXJyYXkoW1xuICogICAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmLFxuICogICAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmLCAweDdmXG4gKiBdKTtcbiAqIGVudHJvcHlUb01uZW1vbmljKGVudCwgd29yZGxpc3QpO1xuICogLy8gJ2xlZ2FsIHdpbm5lciB0aGFuayB5ZWFyIHdhdmUgc2F1c2FnZSB3b3J0aCB1c2VmdWwgbGVnYWwgd2lubmVyIHRoYW5rIHllbGxvdydcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVudHJvcHlUb01uZW1vbmljKGVudHJvcHksIHdvcmRsaXN0KSB7XG4gICAgYXNzZXJ0RW50cm9weShlbnRyb3B5KTtcbiAgICBjb25zdCB3b3JkcyA9IGdldENvZGVyKHdvcmRsaXN0KS5lbmNvZGUoZW50cm9weSk7XG4gICAgcmV0dXJuIHdvcmRzLmpvaW4oaXNKYXBhbmVzZSh3b3JkbGlzdCkgPyAnXFx1MzAwMCcgOiAnICcpO1xufVxuLyoqXG4gKiBWYWxpZGF0ZXMgbW5lbW9uaWMgZm9yIGJlaW5nIDEyLTI0IHdvcmRzIGNvbnRhaW5lZCBpbiBgd29yZGxpc3RgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVNbmVtb25pYyhtbmVtb25pYywgd29yZGxpc3QpIHtcbiAgICB0cnkge1xuICAgICAgICBtbmVtb25pY1RvRW50cm9weShtbmVtb25pYywgd29yZGxpc3QpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuY29uc3Qgc2FsdCA9IChwYXNzcGhyYXNlKSA9PiBuZmtkKGBtbmVtb25pYyR7cGFzc3BocmFzZX1gKTtcbi8qKlxuICogSXJyZXZlcnNpYmxlOiBVc2VzIEtERiB0byBkZXJpdmUgNjQgYnl0ZXMgb2Yga2V5IGRhdGEgZnJvbSBtbmVtb25pYyArIG9wdGlvbmFsIHBhc3N3b3JkLlxuICogQHBhcmFtIG1uZW1vbmljIDEyLTI0IHdvcmRzXG4gKiBAcGFyYW0gcGFzc3BocmFzZSBzdHJpbmcgdGhhdCB3aWxsIGFkZGl0aW9uYWxseSBwcm90ZWN0IHRoZSBrZXlcbiAqIEByZXR1cm5zIDY0IGJ5dGVzIG9mIGtleSBkYXRhXG4gKiBAZXhhbXBsZVxuICogY29uc3QgbW5lbSA9ICdsZWdhbCB3aW5uZXIgdGhhbmsgeWVhciB3YXZlIHNhdXNhZ2Ugd29ydGggdXNlZnVsIGxlZ2FsIHdpbm5lciB0aGFuayB5ZWxsb3cnO1xuICogYXdhaXQgbW5lbW9uaWNUb1NlZWQobW5lbSwgJ3Bhc3N3b3JkJyk7XG4gKiAvLyBuZXcgVWludDhBcnJheShbLi4uNjQgYnl0ZXNdKVxuICovXG5leHBvcnQgZnVuY3Rpb24gbW5lbW9uaWNUb1NlZWQobW5lbW9uaWMsIHBhc3NwaHJhc2UgPSAnJykge1xuICAgIHJldHVybiBwYmtkZjJBc3luYyhzaGE1MTIsIG5vcm1hbGl6ZShtbmVtb25pYykubmZrZCwgc2FsdChwYXNzcGhyYXNlKSwgeyBjOiAyMDQ4LCBka0xlbjogNjQgfSk7XG59XG4vKipcbiAqIElycmV2ZXJzaWJsZTogVXNlcyBLREYgdG8gZGVyaXZlIDY0IGJ5dGVzIG9mIGtleSBkYXRhIGZyb20gbW5lbW9uaWMgKyBvcHRpb25hbCBwYXNzd29yZC5cbiAqIEBwYXJhbSBtbmVtb25pYyAxMi0yNCB3b3Jkc1xuICogQHBhcmFtIHBhc3NwaHJhc2Ugc3RyaW5nIHRoYXQgd2lsbCBhZGRpdGlvbmFsbHkgcHJvdGVjdCB0aGUga2V5XG4gKiBAcmV0dXJucyA2NCBieXRlcyBvZiBrZXkgZGF0YVxuICogQGV4YW1wbGVcbiAqIGNvbnN0IG1uZW0gPSAnbGVnYWwgd2lubmVyIHRoYW5rIHllYXIgd2F2ZSBzYXVzYWdlIHdvcnRoIHVzZWZ1bCBsZWdhbCB3aW5uZXIgdGhhbmsgeWVsbG93JztcbiAqIG1uZW1vbmljVG9TZWVkU3luYyhtbmVtLCAncGFzc3dvcmQnKTtcbiAqIC8vIG5ldyBVaW50OEFycmF5KFsuLi42NCBieXRlc10pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtbmVtb25pY1RvU2VlZFN5bmMobW5lbW9uaWMsIHBhc3NwaHJhc2UgPSAnJykge1xuICAgIHJldHVybiBwYmtkZjIoc2hhNTEyLCBub3JtYWxpemUobW5lbW9uaWMpLm5ma2QsIHNhbHQocGFzc3BocmFzZSksIHsgYzogMjA0OCwgZGtMZW46IDY0IH0pO1xufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/@scure+bip39@1.3.0/node_modules/@scure/bip39/esm/index.js\n");

/***/ })

};
;