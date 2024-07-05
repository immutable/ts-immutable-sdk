/**
 * browser-resolve ensures that browser versions of packages are resolved where appropriate.
 * It respects the "browser" field in package.json.
 */

const browserResolve = require('browser-resolve');

module.exports = browserResolve.sync;
