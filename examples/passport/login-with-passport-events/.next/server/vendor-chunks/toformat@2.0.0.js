/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/toformat@2.0.0";
exports.ids = ["vendor-chunks/toformat@2.0.0"];
exports.modules = {

/***/ "(ssr)/../../../node_modules/.pnpm/toformat@2.0.0/node_modules/toformat/toFormat.js":
/*!************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/toformat@2.0.0/node_modules/toformat/toFormat.js ***!
  \************************************************************************************/
/***/ ((module) => {

eval("/*\r\n *  toFormat v2.0.0\r\n *  Adds a toFormat instance method to big.js or decimal.js\r\n *  Copyright (c) 2017 Michael Mclaughlin\r\n *  MIT Licence\r\n */\r\n\r\n /*\r\n * Adds a `toFormat` method to `Ctor.prototype` and a `format` object to `Ctor`, where `Ctor` is\r\n * a big number constructor such as `Decimal` (decimal.js) or `Big` (big.js).\r\n */\r\nfunction toFormat(Ctor) {\r\n  'use strict';\r\n\r\n  /*\r\n   *  Returns a string representing the value of this big number in fixed-point notation to `dp`\r\n   *  decimal places using rounding mode `rm`, and formatted according to the properties of the\r\n   * `fmt`, `this.format` and `this.constructor.format` objects, in that order of precedence.\r\n   *\r\n   *  Example:\r\n   *\r\n   *  x = new Decimal('123456789.987654321')\r\n   *\r\n   *  // Add a format object to the constructor...\r\n   *  Decimal.format = {\r\n   *    decimalSeparator: '.',\r\n   *    groupSeparator: ',',\r\n   *    groupSize: 3,\r\n   *    secondaryGroupSize: 0,\r\n   *    fractionGroupSeparator: '',     // '\\xA0' non-breaking space\r\n   *    fractionGroupSize : 0\r\n   *  }\r\n   *\r\n   *  x.toFormat();                // 123,456,789.987654321\r\n   *  x.toFormat(2, 1);            // 123,456,789.98\r\n   *\r\n   *  // And/or add a format object to the big number itself...\r\n   *  x.format = {\r\n   *    decimalSeparator: ',',\r\n   *    groupSeparator: '',\r\n   *  }\r\n   *\r\n   *  x.toFormat();                // 123456789,987654321\r\n   *\r\n   *  format = {\r\n   *    decimalSeparator: '.',\r\n   *    groupSeparator: ' ',\r\n   *    groupSize: 3,\r\n   *    fractionGroupSeparator: ' ',     // '\\xA0' non-breaking space\r\n   *    fractionGroupSize : 5\r\n   *  }\r\n\r\n   *  // And/or pass a format object to the method call.\r\n   *  x.toFormat(format);          // 123 456 789.98765 4321\r\n   *  x.toFormat(4, format);       // 123 456 789.9877\r\n   *  x.toFormat(2, 1, format);    // 123 456 789.98\r\n   *\r\n   *  [dp] {number} Decimal places. Integer.\r\n   *  [rm] {number} Rounding mode. Integer, 0 to 8. (Ignored if using big.js.)\r\n   *  [fmt] {Object} A format object.\r\n   *\r\n   */\r\n  Ctor.prototype.toFormat = function toFormat(dp, rm, fmt) {\r\n\r\n    if (!this.e && this.e !== 0) return this.toString();   // Infinity/NaN\r\n\r\n    var arr, g1, g2, i,\r\n      u,                             // undefined\r\n      nd,                            // number of integer digits\r\n      intd,                          // integer digits\r\n      intp,                          // integer part\r\n      fracp,                         // fraction part\r\n      dsep,                          // decimalSeparator\r\n      gsep,                          // groupSeparator\r\n      gsize,                         // groupSize\r\n      sgsize,                        // secondaryGroupSize\r\n      fgsep,                         // fractionGroupSeparator\r\n      fgsize,                        // fractionGroupSize\r\n      tfmt = this.format || {},\r\n      cfmt = this.constructor.format || {};\r\n\r\n    if (dp != u) {\r\n      if (typeof dp == 'object') {\r\n        fmt = dp;\r\n        dp = u;\r\n      } else if (rm != u) {\r\n        if (typeof rm == 'object') {\r\n          fmt = rm;\r\n          rm = u;\r\n        } else if (typeof fmt != 'object') {\r\n          fmt = {};\r\n        }\r\n      } else {\r\n        fmt = {};\r\n      }\r\n    } else {\r\n      fmt = {};\r\n    }\r\n\r\n    arr = this.toFixed(dp, rm).split('.');\r\n    intp = arr[0];\r\n    fracp = arr[1];\r\n    intd = this.s < 0 ? intp.slice(1) : intp;\r\n    nd = intd.length;\r\n\r\n    dsep = fmt.decimalSeparator;\r\n    if (dsep == u) {\r\n      dsep = tfmt.decimalSeparator;\r\n      if (dsep == u) {\r\n        dsep = cfmt.decimalSeparator;\r\n        if (dsep == u) dsep = '.';\r\n      }\r\n    }\r\n\r\n    gsep = fmt.groupSeparator;\r\n    if (gsep == u) {\r\n      gsep = tfmt.groupSeparator;\r\n      if (gsep == u) gsep = cfmt.groupSeparator;\r\n    }\r\n\r\n    if (gsep) {\r\n      gsize = fmt.groupSize;\r\n      if (gsize == u) {\r\n        gsize = tfmt.groupSize;\r\n        if (gsize == u) {\r\n          gsize = cfmt.groupSize;\r\n          if (gsize == u) gsize = 0;\r\n        }\r\n      }\r\n\r\n      sgsize = fmt.secondaryGroupSize;\r\n      if (sgsize == u) {\r\n        sgsize = tfmt.secondaryGroupSize;\r\n        if (sgsize == u) {\r\n          sgsize = cfmt.secondaryGroupSize;\r\n          if (sgsize == u) sgsize = 0;\r\n        }\r\n      }\r\n\r\n      if (sgsize) {\r\n        g1 = +sgsize;\r\n        g2 = +gsize;\r\n        nd -= g2;\r\n      } else {\r\n        g1 = +gsize;\r\n        g2 = +sgsize;\r\n      }\r\n\r\n      if (g1 > 0 && nd > 0) {\r\n        i = nd % g1 || g1;\r\n        intp = intd.substr(0, i);\r\n        for (; i < nd; i += g1) intp += gsep + intd.substr(i, g1);\r\n        if (g2 > 0) intp += gsep + intd.slice(i);\r\n        if (this.s < 0) intp = '-' + intp;\r\n      }\r\n    }\r\n\r\n    if (fracp) {\r\n      fgsep = fmt.fractionGroupSeparator;\r\n      if (fgsep == u) {\r\n        fgsep = tfmt.fractionGroupSeparator;\r\n        if (fgsep == u) fgsep = cfmt.fractionGroupSeparator;\r\n      }\r\n\r\n      if (fgsep) {\r\n        fgsize = fmt.fractionGroupSize;\r\n        if (fgsize == u) {\r\n          fgsize = tfmt.fractionGroupSize;\r\n          if (fgsize == u) {\r\n            fgsize = cfmt.fractionGroupSize;\r\n            if (fgsize == u) fgsize = 0;\r\n          }\r\n        }\r\n\r\n        fgsize = +fgsize;\r\n\r\n        if (fgsize) {\r\n          fracp = fracp.replace(new RegExp('\\\\d{' + fgsize + '}\\\\B', 'g'), '$&' + fgsep);\r\n        }\r\n      }\r\n\r\n      return intp + dsep + fracp;\r\n    } else {\r\n\r\n      return intp;\r\n    }\r\n  };\r\n\r\n  Ctor.format = {\r\n    decimalSeparator: '.',\r\n    groupSeparator: ',',\r\n    groupSize: 3,\r\n    secondaryGroupSize: 0,\r\n    fractionGroupSeparator: '',\r\n    fractionGroupSize: 0\r\n  };\r\n\r\n  return Ctor;\r\n}\r\n\r\nif ( true && module.exports) module.exports = toFormat;\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3RvZm9ybWF0QDIuMC4wL25vZGVfbW9kdWxlcy90b2Zvcm1hdC90b0Zvcm1hdC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUM7QUFDbkMsbUNBQW1DO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DO0FBQ25DLG1DQUFtQztBQUNuQyxtQ0FBbUM7QUFDbkM7QUFDQSxZQUFZLFFBQVE7QUFDcEIsWUFBWSxRQUFRO0FBQ3BCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJEQUEyRDtBQUMzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdELGVBQWU7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksS0FBNkIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZXhhbXBsZXMvbG9naW4td2l0aC1wYXNzcG9ydC1ldmVudHMvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3RvZm9ybWF0QDIuMC4wL25vZGVfbW9kdWxlcy90b2Zvcm1hdC90b0Zvcm1hdC5qcz82YzU1Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXHJcbiAqICB0b0Zvcm1hdCB2Mi4wLjBcclxuICogIEFkZHMgYSB0b0Zvcm1hdCBpbnN0YW5jZSBtZXRob2QgdG8gYmlnLmpzIG9yIGRlY2ltYWwuanNcclxuICogIENvcHlyaWdodCAoYykgMjAxNyBNaWNoYWVsIE1jbGF1Z2hsaW5cclxuICogIE1JVCBMaWNlbmNlXHJcbiAqL1xyXG5cclxuIC8qXHJcbiAqIEFkZHMgYSBgdG9Gb3JtYXRgIG1ldGhvZCB0byBgQ3Rvci5wcm90b3R5cGVgIGFuZCBhIGBmb3JtYXRgIG9iamVjdCB0byBgQ3RvcmAsIHdoZXJlIGBDdG9yYCBpc1xyXG4gKiBhIGJpZyBudW1iZXIgY29uc3RydWN0b3Igc3VjaCBhcyBgRGVjaW1hbGAgKGRlY2ltYWwuanMpIG9yIGBCaWdgIChiaWcuanMpLlxyXG4gKi9cclxuZnVuY3Rpb24gdG9Gb3JtYXQoQ3Rvcikge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLypcclxuICAgKiAgUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgYmlnIG51bWJlciBpbiBmaXhlZC1wb2ludCBub3RhdGlvbiB0byBgZHBgXHJcbiAgICogIGRlY2ltYWwgcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJtYCwgYW5kIGZvcm1hdHRlZCBhY2NvcmRpbmcgdG8gdGhlIHByb3BlcnRpZXMgb2YgdGhlXHJcbiAgICogYGZtdGAsIGB0aGlzLmZvcm1hdGAgYW5kIGB0aGlzLmNvbnN0cnVjdG9yLmZvcm1hdGAgb2JqZWN0cywgaW4gdGhhdCBvcmRlciBvZiBwcmVjZWRlbmNlLlxyXG4gICAqXHJcbiAgICogIEV4YW1wbGU6XHJcbiAgICpcclxuICAgKiAgeCA9IG5ldyBEZWNpbWFsKCcxMjM0NTY3ODkuOTg3NjU0MzIxJylcclxuICAgKlxyXG4gICAqICAvLyBBZGQgYSBmb3JtYXQgb2JqZWN0IHRvIHRoZSBjb25zdHJ1Y3Rvci4uLlxyXG4gICAqICBEZWNpbWFsLmZvcm1hdCA9IHtcclxuICAgKiAgICBkZWNpbWFsU2VwYXJhdG9yOiAnLicsXHJcbiAgICogICAgZ3JvdXBTZXBhcmF0b3I6ICcsJyxcclxuICAgKiAgICBncm91cFNpemU6IDMsXHJcbiAgICogICAgc2Vjb25kYXJ5R3JvdXBTaXplOiAwLFxyXG4gICAqICAgIGZyYWN0aW9uR3JvdXBTZXBhcmF0b3I6ICcnLCAgICAgLy8gJ1xceEEwJyBub24tYnJlYWtpbmcgc3BhY2VcclxuICAgKiAgICBmcmFjdGlvbkdyb3VwU2l6ZSA6IDBcclxuICAgKiAgfVxyXG4gICAqXHJcbiAgICogIHgudG9Gb3JtYXQoKTsgICAgICAgICAgICAgICAgLy8gMTIzLDQ1Niw3ODkuOTg3NjU0MzIxXHJcbiAgICogIHgudG9Gb3JtYXQoMiwgMSk7ICAgICAgICAgICAgLy8gMTIzLDQ1Niw3ODkuOThcclxuICAgKlxyXG4gICAqICAvLyBBbmQvb3IgYWRkIGEgZm9ybWF0IG9iamVjdCB0byB0aGUgYmlnIG51bWJlciBpdHNlbGYuLi5cclxuICAgKiAgeC5mb3JtYXQgPSB7XHJcbiAgICogICAgZGVjaW1hbFNlcGFyYXRvcjogJywnLFxyXG4gICAqICAgIGdyb3VwU2VwYXJhdG9yOiAnJyxcclxuICAgKiAgfVxyXG4gICAqXHJcbiAgICogIHgudG9Gb3JtYXQoKTsgICAgICAgICAgICAgICAgLy8gMTIzNDU2Nzg5LDk4NzY1NDMyMVxyXG4gICAqXHJcbiAgICogIGZvcm1hdCA9IHtcclxuICAgKiAgICBkZWNpbWFsU2VwYXJhdG9yOiAnLicsXHJcbiAgICogICAgZ3JvdXBTZXBhcmF0b3I6ICcgJyxcclxuICAgKiAgICBncm91cFNpemU6IDMsXHJcbiAgICogICAgZnJhY3Rpb25Hcm91cFNlcGFyYXRvcjogJyAnLCAgICAgLy8gJ1xceEEwJyBub24tYnJlYWtpbmcgc3BhY2VcclxuICAgKiAgICBmcmFjdGlvbkdyb3VwU2l6ZSA6IDVcclxuICAgKiAgfVxyXG5cclxuICAgKiAgLy8gQW5kL29yIHBhc3MgYSBmb3JtYXQgb2JqZWN0IHRvIHRoZSBtZXRob2QgY2FsbC5cclxuICAgKiAgeC50b0Zvcm1hdChmb3JtYXQpOyAgICAgICAgICAvLyAxMjMgNDU2IDc4OS45ODc2NSA0MzIxXHJcbiAgICogIHgudG9Gb3JtYXQoNCwgZm9ybWF0KTsgICAgICAgLy8gMTIzIDQ1NiA3ODkuOTg3N1xyXG4gICAqICB4LnRvRm9ybWF0KDIsIDEsIGZvcm1hdCk7ICAgIC8vIDEyMyA0NTYgNzg5Ljk4XHJcbiAgICpcclxuICAgKiAgW2RwXSB7bnVtYmVyfSBEZWNpbWFsIHBsYWNlcy4gSW50ZWdlci5cclxuICAgKiAgW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDguIChJZ25vcmVkIGlmIHVzaW5nIGJpZy5qcy4pXHJcbiAgICogIFtmbXRdIHtPYmplY3R9IEEgZm9ybWF0IG9iamVjdC5cclxuICAgKlxyXG4gICAqL1xyXG4gIEN0b3IucHJvdG90eXBlLnRvRm9ybWF0ID0gZnVuY3Rpb24gdG9Gb3JtYXQoZHAsIHJtLCBmbXQpIHtcclxuXHJcbiAgICBpZiAoIXRoaXMuZSAmJiB0aGlzLmUgIT09IDApIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7ICAgLy8gSW5maW5pdHkvTmFOXHJcblxyXG4gICAgdmFyIGFyciwgZzEsIGcyLCBpLFxyXG4gICAgICB1LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdW5kZWZpbmVkXHJcbiAgICAgIG5kLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBudW1iZXIgb2YgaW50ZWdlciBkaWdpdHNcclxuICAgICAgaW50ZCwgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGludGVnZXIgZGlnaXRzXHJcbiAgICAgIGludHAsICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnRlZ2VyIHBhcnRcclxuICAgICAgZnJhY3AsICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZyYWN0aW9uIHBhcnRcclxuICAgICAgZHNlcCwgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRlY2ltYWxTZXBhcmF0b3JcclxuICAgICAgZ3NlcCwgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdyb3VwU2VwYXJhdG9yXHJcbiAgICAgIGdzaXplLCAgICAgICAgICAgICAgICAgICAgICAgICAvLyBncm91cFNpemVcclxuICAgICAgc2dzaXplLCAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlY29uZGFyeUdyb3VwU2l6ZVxyXG4gICAgICBmZ3NlcCwgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZnJhY3Rpb25Hcm91cFNlcGFyYXRvclxyXG4gICAgICBmZ3NpemUsICAgICAgICAgICAgICAgICAgICAgICAgLy8gZnJhY3Rpb25Hcm91cFNpemVcclxuICAgICAgdGZtdCA9IHRoaXMuZm9ybWF0IHx8IHt9LFxyXG4gICAgICBjZm10ID0gdGhpcy5jb25zdHJ1Y3Rvci5mb3JtYXQgfHwge307XHJcblxyXG4gICAgaWYgKGRwICE9IHUpIHtcclxuICAgICAgaWYgKHR5cGVvZiBkcCA9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIGZtdCA9IGRwO1xyXG4gICAgICAgIGRwID0gdTtcclxuICAgICAgfSBlbHNlIGlmIChybSAhPSB1KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBybSA9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgZm10ID0gcm07XHJcbiAgICAgICAgICBybSA9IHU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZm10ICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICBmbXQgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZm10ID0ge307XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZtdCA9IHt9O1xyXG4gICAgfVxyXG5cclxuICAgIGFyciA9IHRoaXMudG9GaXhlZChkcCwgcm0pLnNwbGl0KCcuJyk7XHJcbiAgICBpbnRwID0gYXJyWzBdO1xyXG4gICAgZnJhY3AgPSBhcnJbMV07XHJcbiAgICBpbnRkID0gdGhpcy5zIDwgMCA/IGludHAuc2xpY2UoMSkgOiBpbnRwO1xyXG4gICAgbmQgPSBpbnRkLmxlbmd0aDtcclxuXHJcbiAgICBkc2VwID0gZm10LmRlY2ltYWxTZXBhcmF0b3I7XHJcbiAgICBpZiAoZHNlcCA9PSB1KSB7XHJcbiAgICAgIGRzZXAgPSB0Zm10LmRlY2ltYWxTZXBhcmF0b3I7XHJcbiAgICAgIGlmIChkc2VwID09IHUpIHtcclxuICAgICAgICBkc2VwID0gY2ZtdC5kZWNpbWFsU2VwYXJhdG9yO1xyXG4gICAgICAgIGlmIChkc2VwID09IHUpIGRzZXAgPSAnLic7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnc2VwID0gZm10Lmdyb3VwU2VwYXJhdG9yO1xyXG4gICAgaWYgKGdzZXAgPT0gdSkge1xyXG4gICAgICBnc2VwID0gdGZtdC5ncm91cFNlcGFyYXRvcjtcclxuICAgICAgaWYgKGdzZXAgPT0gdSkgZ3NlcCA9IGNmbXQuZ3JvdXBTZXBhcmF0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGdzZXApIHtcclxuICAgICAgZ3NpemUgPSBmbXQuZ3JvdXBTaXplO1xyXG4gICAgICBpZiAoZ3NpemUgPT0gdSkge1xyXG4gICAgICAgIGdzaXplID0gdGZtdC5ncm91cFNpemU7XHJcbiAgICAgICAgaWYgKGdzaXplID09IHUpIHtcclxuICAgICAgICAgIGdzaXplID0gY2ZtdC5ncm91cFNpemU7XHJcbiAgICAgICAgICBpZiAoZ3NpemUgPT0gdSkgZ3NpemUgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgc2dzaXplID0gZm10LnNlY29uZGFyeUdyb3VwU2l6ZTtcclxuICAgICAgaWYgKHNnc2l6ZSA9PSB1KSB7XHJcbiAgICAgICAgc2dzaXplID0gdGZtdC5zZWNvbmRhcnlHcm91cFNpemU7XHJcbiAgICAgICAgaWYgKHNnc2l6ZSA9PSB1KSB7XHJcbiAgICAgICAgICBzZ3NpemUgPSBjZm10LnNlY29uZGFyeUdyb3VwU2l6ZTtcclxuICAgICAgICAgIGlmIChzZ3NpemUgPT0gdSkgc2dzaXplID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzZ3NpemUpIHtcclxuICAgICAgICBnMSA9ICtzZ3NpemU7XHJcbiAgICAgICAgZzIgPSArZ3NpemU7XHJcbiAgICAgICAgbmQgLT0gZzI7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZzEgPSArZ3NpemU7XHJcbiAgICAgICAgZzIgPSArc2dzaXplO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZzEgPiAwICYmIG5kID4gMCkge1xyXG4gICAgICAgIGkgPSBuZCAlIGcxIHx8IGcxO1xyXG4gICAgICAgIGludHAgPSBpbnRkLnN1YnN0cigwLCBpKTtcclxuICAgICAgICBmb3IgKDsgaSA8IG5kOyBpICs9IGcxKSBpbnRwICs9IGdzZXAgKyBpbnRkLnN1YnN0cihpLCBnMSk7XHJcbiAgICAgICAgaWYgKGcyID4gMCkgaW50cCArPSBnc2VwICsgaW50ZC5zbGljZShpKTtcclxuICAgICAgICBpZiAodGhpcy5zIDwgMCkgaW50cCA9ICctJyArIGludHA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoZnJhY3ApIHtcclxuICAgICAgZmdzZXAgPSBmbXQuZnJhY3Rpb25Hcm91cFNlcGFyYXRvcjtcclxuICAgICAgaWYgKGZnc2VwID09IHUpIHtcclxuICAgICAgICBmZ3NlcCA9IHRmbXQuZnJhY3Rpb25Hcm91cFNlcGFyYXRvcjtcclxuICAgICAgICBpZiAoZmdzZXAgPT0gdSkgZmdzZXAgPSBjZm10LmZyYWN0aW9uR3JvdXBTZXBhcmF0b3I7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChmZ3NlcCkge1xyXG4gICAgICAgIGZnc2l6ZSA9IGZtdC5mcmFjdGlvbkdyb3VwU2l6ZTtcclxuICAgICAgICBpZiAoZmdzaXplID09IHUpIHtcclxuICAgICAgICAgIGZnc2l6ZSA9IHRmbXQuZnJhY3Rpb25Hcm91cFNpemU7XHJcbiAgICAgICAgICBpZiAoZmdzaXplID09IHUpIHtcclxuICAgICAgICAgICAgZmdzaXplID0gY2ZtdC5mcmFjdGlvbkdyb3VwU2l6ZTtcclxuICAgICAgICAgICAgaWYgKGZnc2l6ZSA9PSB1KSBmZ3NpemUgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZmdzaXplID0gK2Znc2l6ZTtcclxuXHJcbiAgICAgICAgaWYgKGZnc2l6ZSkge1xyXG4gICAgICAgICAgZnJhY3AgPSBmcmFjcC5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFxkeycgKyBmZ3NpemUgKyAnfVxcXFxCJywgJ2cnKSwgJyQmJyArIGZnc2VwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBpbnRwICsgZHNlcCArIGZyYWNwO1xyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIHJldHVybiBpbnRwO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIEN0b3IuZm9ybWF0ID0ge1xyXG4gICAgZGVjaW1hbFNlcGFyYXRvcjogJy4nLFxyXG4gICAgZ3JvdXBTZXBhcmF0b3I6ICcsJyxcclxuICAgIGdyb3VwU2l6ZTogMyxcclxuICAgIHNlY29uZGFyeUdyb3VwU2l6ZTogMCxcclxuICAgIGZyYWN0aW9uR3JvdXBTZXBhcmF0b3I6ICcnLFxyXG4gICAgZnJhY3Rpb25Hcm91cFNpemU6IDBcclxuICB9O1xyXG5cclxuICByZXR1cm4gQ3RvcjtcclxufVxyXG5cclxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IHRvRm9ybWF0O1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/toformat@2.0.0/node_modules/toformat/toFormat.js\n");

/***/ })

};
;