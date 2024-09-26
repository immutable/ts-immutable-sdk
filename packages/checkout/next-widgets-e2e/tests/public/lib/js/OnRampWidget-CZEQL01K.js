import { bI as global, $ as useAnalytics, r as reactExports, Z as ConnectLoaderContext, a1 as EventTargetContext, l as useTranslation, X as ViewContext, p as SharedViews, bJ as ExchangeType, j as jsx, ao as SimpleLayout, ak as HeaderNavigation, bK as sendOnRampWidgetCloseEvent, a7 as orchestrationEvents, I as IMTBLWidgetEvents, G as Box, a6 as UserJourney, V as ViewActions, an as FooterLogo, o as jsxs, aA as SimpleTextBody, aD as viewReducer, aE as initialViewState, bt as NATIVE, L as LoadingView, bL as sendOnRampSuccessEvent, b1 as StatusType, bE as StatusView, bM as sendOnRampFailedEvent } from './index-Ae2juTF3.js';
import { O as OnRampWidgetViews, T as TopUpView } from './TopUpView-BinG-jkK.js';
import { S as SpendingCapHero } from './SpendingCapHero-4IkTT4Hc.js';

function isNull(arg) {
  return arg === null;
}

function isNullOrUndefined(arg) {
  return arg == null;
}

function isString(arg) {
  return typeof arg === 'string';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

/*! https://mths.be/punycode v1.4.1 by @mathias */


/** Highest positive signed 32-bit float value */
var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

/** Bootstring parameters */
var base = 36;
var tMin = 1;
var tMax = 26;
var skew = 38;
var damp = 700;
var initialBias = 72;
var initialN = 128; // 0x80
var delimiter = '-'; // '\x2D'
var regexNonASCII = /[^\x20-\x7E]/; // unprintable ASCII chars + non-ASCII chars
var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

/** Error messages */
var errors = {
  'overflow': 'Overflow: input needs wider integers to process',
  'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
  'invalid-input': 'Invalid input'
};

/** Convenience shortcuts */
var baseMinusTMin = base - tMin;
var floor = Math.floor;
var stringFromCharCode = String.fromCharCode;

/*--------------------------------------------------------------------------*/

/**
 * A generic error utility function.
 * @private
 * @param {String} type The error type.
 * @returns {Error} Throws a `RangeError` with the applicable error message.
 */
function error(type) {
  throw new RangeError(errors[type]);
}

/**
 * A generic `Array#map` utility function.
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} callback The function that gets called for every array
 * item.
 * @returns {Array} A new array of values returned by the callback function.
 */
function map$1(array, fn) {
  var length = array.length;
  var result = [];
  while (length--) {
    result[length] = fn(array[length]);
  }
  return result;
}

/**
 * A simple `Array#map`-like wrapper to work with domain name strings or email
 * addresses.
 * @private
 * @param {String} domain The domain name or email address.
 * @param {Function} callback The function that gets called for every
 * character.
 * @returns {Array} A new string of characters returned by the callback
 * function.
 */
function mapDomain(string, fn) {
  var parts = string.split('@');
  var result = '';
  if (parts.length > 1) {
    // In email addresses, only the domain name should be punycoded. Leave
    // the local part (i.e. everything up to `@`) intact.
    result = parts[0] + '@';
    string = parts[1];
  }
  // Avoid `split(regex)` for IE8 compatibility. See #17.
  string = string.replace(regexSeparators, '\x2E');
  var labels = string.split('.');
  var encoded = map$1(labels, fn).join('.');
  return result + encoded;
}

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 * @see `punycode.ucs2.encode`
 * @see <https://mathiasbynens.be/notes/javascript-encoding>
 * @memberOf punycode.ucs2
 * @name decode
 * @param {String} string The Unicode input string (UCS-2).
 * @returns {Array} The new array of code points.
 */
function ucs2decode(string) {
  var output = [],
    counter = 0,
    length = string.length,
    value,
    extra;
  while (counter < length) {
    value = string.charCodeAt(counter++);
    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
      // high surrogate, and there is a next character
      extra = string.charCodeAt(counter++);
      if ((extra & 0xFC00) == 0xDC00) { // low surrogate
        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        // unmatched surrogate; only append this code unit, in case the next
        // code unit is the high surrogate of a surrogate pair
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }
  return output;
}

/**
 * Converts a digit/integer into a basic code point.
 * @see `basicToDigit()`
 * @private
 * @param {Number} digit The numeric value of a basic code point.
 * @returns {Number} The basic code point whose value (when used for
 * representing integers) is `digit`, which needs to be in the range
 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
 * used; else, the lowercase form is used. The behavior is undefined
 * if `flag` is non-zero and `digit` has no uppercase form.
 */
function digitToBasic(digit, flag) {
  //  0..25 map to ASCII a..z or A..Z
  // 26..35 map to ASCII 0..9
  return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
}

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 * @private
 */
function adapt(delta, numPoints, firstTime) {
  var k = 0;
  delta = firstTime ? floor(delta / damp) : delta >> 1;
  delta += floor(delta / numPoints);
  for ( /* no initialization */ ; delta > baseMinusTMin * tMax >> 1; k += base) {
    delta = floor(delta / baseMinusTMin);
  }
  return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
}

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 * @memberOf punycode
 * @param {String} input The string of Unicode symbols.
 * @returns {String} The resulting Punycode string of ASCII-only symbols.
 */
function encode(input) {
  var n,
    delta,
    handledCPCount,
    basicLength,
    bias,
    j,
    m,
    q,
    k,
    t,
    currentValue,
    output = [],
    /** `inputLength` will hold the number of code points in `input`. */
    inputLength,
    /** Cached calculation results */
    handledCPCountPlusOne,
    baseMinusT,
    qMinusT;

  // Convert the input in UCS-2 to Unicode
  input = ucs2decode(input);

  // Cache the length
  inputLength = input.length;

  // Initialize the state
  n = initialN;
  delta = 0;
  bias = initialBias;

  // Handle the basic code points
  for (j = 0; j < inputLength; ++j) {
    currentValue = input[j];
    if (currentValue < 0x80) {
      output.push(stringFromCharCode(currentValue));
    }
  }

  handledCPCount = basicLength = output.length;

  // `handledCPCount` is the number of code points that have been handled;
  // `basicLength` is the number of basic code points.

  // Finish the basic string - if it is not empty - with a delimiter
  if (basicLength) {
    output.push(delimiter);
  }

  // Main encoding loop:
  while (handledCPCount < inputLength) {

    // All non-basic code points < n have been handled already. Find the next
    // larger one:
    for (m = maxInt, j = 0; j < inputLength; ++j) {
      currentValue = input[j];
      if (currentValue >= n && currentValue < m) {
        m = currentValue;
      }
    }

    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
    // but guard against overflow
    handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
      error('overflow');
    }

    delta += (m - n) * handledCPCountPlusOne;
    n = m;

    for (j = 0; j < inputLength; ++j) {
      currentValue = input[j];

      if (currentValue < n && ++delta > maxInt) {
        error('overflow');
      }

      if (currentValue == n) {
        // Represent delta as a generalized variable-length integer
        for (q = delta, k = base; /* no condition */ ; k += base) {
          t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
          if (q < t) {
            break;
          }
          qMinusT = q - t;
          baseMinusT = base - t;
          output.push(
            stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
          );
          q = floor(qMinusT / baseMinusT);
        }

        output.push(stringFromCharCode(digitToBasic(q, 0)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
        delta = 0;
        ++handledCPCount;
      }
    }

    ++delta;
    ++n;

  }
  return output.join('');
}

/**
 * Converts a Unicode string representing a domain name or an email address to
 * Punycode. Only the non-ASCII parts of the domain name will be converted,
 * i.e. it doesn't matter if you call it with a domain that's already in
 * ASCII.
 * @memberOf punycode
 * @param {String} input The domain name or email address to convert, as a
 * Unicode string.
 * @returns {String} The Punycode representation of the given domain name or
 * email address.
 */
function toASCII(input) {
  return mapDomain(input, function(string) {
    return regexNonASCII.test(string) ?
      'xn--' + encode(string) :
      string;
  });
}

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.


// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};
function stringifyPrimitive(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
}

function stringify (obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
}
function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

function parse$1(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
}

// WHATWG API
const URL = global.URL;
const URLSearchParams = global.URLSearchParams;
var url = {
  parse: urlParse,
  resolve: urlResolve,
  resolveObject: urlResolveObject,
  fileURLToPath: urlFileURLToPath,
  format: urlFormat,
  Url: Url,

  // WHATWG API
  URL,
  URLSearchParams,  
};
function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
  portPattern = /:[0-9]*$/,

  // Special case for a simple path URL
  simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

  // RFC 2396: characters reserved for delimiting URLs.
  // We actually just auto-escape these.
  delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

  // RFC 2396: characters not allowed for various reasons.
  unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

  // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
  autoEscape = ['\''].concat(unwise),
  // Characters that are never ever allowed in a hostname.
  // Note that any invalid chars are also handled, but these
  // are the ones that are *expected* to be seen, so we fast-path
  // them.
  nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
  hostEndingChars = ['/', '?', '#'],
  hostnameMaxLen = 255,
  hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
  hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
  // protocols that can allow "unsafe" and "unwise" chars.
  unsafeProtocol = {
    'javascript': true,
    'javascript:': true
  },
  // protocols that never have a hostname.
  hostlessProtocol = {
    'javascript': true,
    'javascript:': true
  },
  // protocols that always contain a // bit.
  slashedProtocol = {
    'http': true,
    'https': true,
    'ftp': true,
    'gopher': true,
    'file': true,
    'http:': true,
    'https:': true,
    'ftp:': true,
    'gopher:': true,
    'file:': true
  };

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}
Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  return parse(this, url, parseQueryString, slashesDenoteHost);
};

function parse(self, url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError('Parameter \'url\' must be a string, not ' + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
    splitter =
    (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
    uSplit = url.split(splitter),
    slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      self.path = rest;
      self.href = rest;
      self.pathname = simplePath[1];
      if (simplePath[2]) {
        self.search = simplePath[2];
        if (parseQueryString) {
          self.query = parse$1(self.search.substr(1));
        } else {
          self.query = self.search.substr(1);
        }
      } else if (parseQueryString) {
        self.search = '';
        self.query = {};
      }
      return self;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    self.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      self.slashes = true;
    }
  }
  var i, hec, l, p;
  if (!hostlessProtocol[proto] &&
    (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (i = 0; i < hostEndingChars.length; i++) {
      hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      self.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (i = 0; i < nonHostChars.length; i++) {
      hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    self.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    parseHost(self);

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    self.hostname = self.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = self.hostname[0] === '[' &&
      self.hostname[self.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = self.hostname.split(/\./);
      for (i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            self.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (self.hostname.length > hostnameMaxLen) {
      self.hostname = '';
    } else {
      // hostnames are always lower case.
      self.hostname = self.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      self.hostname = toASCII(self.hostname);
    }

    p = self.port ? ':' + self.port : '';
    var h = self.hostname || '';
    self.host = h + p;
    self.href += self.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      self.hostname = self.hostname.substr(1, self.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    self.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    self.search = rest.substr(qm);
    self.query = rest.substr(qm + 1);
    if (parseQueryString) {
      self.query = parse$1(self.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    self.search = '';
    self.query = {};
  }
  if (rest) self.pathname = rest;
  if (slashedProtocol[lowerProto] &&
    self.hostname && !self.pathname) {
    self.pathname = '/';
  }

  //to support http.request
  if (self.pathname || self.search) {
    p = self.pathname || '';
    var s = self.search || '';
    self.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  self.href = format(self);
  return self;
}

function urlFileURLToPath(path) {
  if (typeof path === 'string')
    path = new Url().parse(path);
  else if (!(path instanceof Url))
    throw new TypeError('The "path" argument must be of type string or an instance of URL. Received type ' + (typeof path) + String(path));
  if (path.protocol !== 'file:')
    throw new TypeError('The URL must be of scheme file');
  return getPathFromURLPosix(path);
}

function getPathFromURLPosix(url) {
  const pathname = url.pathname;
  for (let n = 0; n < pathname.length; n++) {
    if (pathname[n] === '%') {
      const third = pathname.codePointAt(n + 2) | 0x20;
      if (pathname[n + 1] === '2' && third === 102) {
        throw new TypeError(
          'must not include encoded / characters'
        );
      }
    }
  }
  return decodeURIComponent(pathname);
}

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = parse({}, obj);
  return format(obj);
}

function format(self) {
  var auth = self.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = self.protocol || '',
    pathname = self.pathname || '',
    hash = self.hash || '',
    host = false,
    query = '';

  if (self.host) {
    host = auth + self.host;
  } else if (self.hostname) {
    host = auth + (self.hostname.indexOf(':') === -1 ?
      self.hostname :
      '[' + this.hostname + ']');
    if (self.port) {
      host += ':' + self.port;
    }
  }

  if (self.query &&
    isObject(self.query) &&
    Object.keys(self.query).length) {
    query = stringify(self.query);
  }

  var search = self.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (self.slashes ||
    (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
}

Url.prototype.format = function() {
  return format(this);
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
      result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }
  var relPath;
  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
    isRelAbs = (
      relative.host ||
      relative.pathname && relative.pathname.charAt(0) === '/'
    ),
    mustEndAbs = (isRelAbs || isSourceAbs ||
      (result.host && relative.pathname)),
    removeAllDots = mustEndAbs,
    srcPath = result.pathname && result.pathname.split('/') || [],
    psychotic = result.protocol && !slashedProtocol[result.protocol];
  relPath = relative.pathname && relative.pathname.split('/') || [];
  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }
  var authInHost;
  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
      relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      authInHost = result.host && result.host.indexOf('@') > 0 ?
        result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
        (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
    (result.host || relative.host || srcPath.length > 1) &&
    (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
    (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
    (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
      srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    authInHost = result.host && result.host.indexOf('@') > 0 ?
      result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
      (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  return parseHost(this);
};

function parseHost(self) {
  var host = self.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      self.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) self.hostname = host;
}

const containerStyle = (showIframe) => ({
    position: 'relative',
    maxWidth: '420px',
    height: '565px',
    borderRadius: 'base.borderRadius.x6',
    overflow: 'hidden',
    marginLeft: 'base.spacing.x2',
    marginRight: 'base.spacing.x2',
    marginBottom: 'base.spacing.x2',
    display: showIframe ? 'block' : 'none',
});
const boxMainStyle = (showIframe) => ({
    display: showIframe ? 'block' : 'none',
});

var TransakEvents$1;
(function (TransakEvents) {
    TransakEvents["TRANSAK_WIDGET_OPEN"] = "TRANSAK_WIDGET_OPEN";
    TransakEvents["TRANSAK_ORDER_CREATED"] = "TRANSAK_ORDER_CREATED";
    TransakEvents["TRANSAK_ORDER_SUCCESSFUL"] = "TRANSAK_ORDER_SUCCESSFUL";
    TransakEvents["TRANSAK_ORDER_FAILED"] = "TRANSAK_ORDER_FAILED";
})(TransakEvents$1 || (TransakEvents$1 = {}));
var TransakStatuses$1;
(function (TransakStatuses) {
    TransakStatuses["PROCESSING"] = "PROCESSING";
    TransakStatuses["COMPLETED"] = "COMPLETED";
})(TransakStatuses$1 || (TransakStatuses$1 = {}));

/* eslint-disable @typescript-eslint/naming-convention */
var TransakEvents;
(function (TransakEvents) {
    /**
     * transak widget initialised
     */
    TransakEvents["TRANSAK_WIDGET_INITIALISED"] = "TRANSAK_WIDGET_INITIALISED";
    /**
     * transak widget loaded
     */
    TransakEvents["TRANSAK_WIDGET_OPEN"] = "TRANSAK_WIDGET_OPEN";
    /**
     * order created and awaiting payment from payment
     */
    TransakEvents["TRANSAK_ORDER_CREATED"] = "TRANSAK_ORDER_CREATED";
    /**
     * order successfully submitted or completed
     */
    TransakEvents["TRANSAK_ORDER_SUCCESSFUL"] = "TRANSAK_ORDER_SUCCESSFUL";
    /**
     * order processing failed
     */
    TransakEvents["TRANSAK_ORDER_FAILED"] = "TRANSAK_ORDER_FAILED";
})(TransakEvents || (TransakEvents = {}));
var TransakStatuses;
(function (TransakStatuses) {
    TransakStatuses["PROCESSING"] = "PROCESSING";
    TransakStatuses["COMPLETED"] = "COMPLETED";
})(TransakStatuses || (TransakStatuses = {}));

const TRANSAK_ORIGIN = ['global.transak.com', 'global-stg.transak.com'];
const FAILED_TO_LOAD_TIMEOUT_IN_MS = 10000;
const ANALYTICS_EVENTS = {
    [TransakEvents.TRANSAK_WIDGET_OPEN]: {
        screen: 'InputScreen',
        control: 'TransakWidgetOpen',
        controlType: 'IframeEvent',
    },
    [TransakEvents.TRANSAK_ORDER_CREATED]: {
        screen: 'InputScreen',
        control: 'OrderCreated',
        controlType: 'IframeEvent',
    },
    [`${TransakEvents.TRANSAK_ORDER_SUCCESSFUL}${TransakStatuses.PROCESSING}`]: {
        screen: 'OrderInProgress',
        control: 'PaymentProcessing',
        controlType: 'IframeEvent',
    },
    [`${TransakEvents.TRANSAK_ORDER_SUCCESSFUL}${TransakStatuses.COMPLETED}`]: {
        screen: 'Success',
        control: 'PaymentCompleted',
        controlType: 'IframeEvent',
    },
    [TransakEvents.TRANSAK_ORDER_FAILED]: {
        screen: 'Failure',
        control: 'PaymentFailed',
        controlType: 'IframeEvent',
    },
};
const useTransakEvents = (props) => {
    const { track } = useAnalytics();
    const { userJourney, ref, walletAddress, isPassportWallet, failedToLoadTimeoutInMs, onFailedToLoad, } = props;
    const [initialised, setInitialsed] = reactExports.useState(false);
    const failedToLoadTimeout = failedToLoadTimeoutInMs || FAILED_TO_LOAD_TIMEOUT_IN_MS;
    const timeout = reactExports.useRef(undefined);
    const onInit = (data) => {
        setInitialsed(true);
        clearTimeout(timeout.current);
        timeout.current = undefined;
        props.onInit?.(data);
    };
    const onLoad = () => {
        if (onFailedToLoad === undefined)
            return;
        if (timeout.current === undefined && !initialised) {
            timeout.current = setTimeout(() => {
                if (!initialised)
                    onFailedToLoad();
            }, failedToLoadTimeout);
        }
    };
    const handleAnalyticsEvent = reactExports.useCallback((event) => {
        const type = event.event_id;
        const key = [TransakEvents.TRANSAK_ORDER_SUCCESSFUL].includes(type)
            ? `${type}${event.data.status}`
            : type;
        const eventData = ANALYTICS_EVENTS?.[key] || {};
        if (Object.keys(eventData).length >= 0) {
            track({
                ...eventData,
                userJourney,
                extras: {
                    walletAddress,
                    isPassportWallet,
                },
            });
        }
    }, []);
    const handleEvents = reactExports.useCallback((event) => {
        switch (event.event_id) {
            case TransakEvents.TRANSAK_WIDGET_INITIALISED:
                onInit(event.data);
                break;
            case TransakEvents.TRANSAK_WIDGET_OPEN:
                props.onOpen?.(event.data);
                break;
            case TransakEvents.TRANSAK_ORDER_CREATED:
                props.onOrderCreated?.(event.data);
                break;
            case TransakEvents.TRANSAK_ORDER_SUCCESSFUL:
                if (event.data.status === TransakStatuses.PROCESSING) {
                    props.onOrderProcessing?.(event.data);
                }
                if (event.data.status === TransakStatuses.COMPLETED) {
                    props.onOrderCompleted?.(event.data);
                }
                break;
            case TransakEvents.TRANSAK_ORDER_FAILED:
                props.onOrderFailed?.(event.data);
                break;
        }
    }, []);
    const handleMessageEvent = reactExports.useCallback((event) => {
        const host = urlParse(event.origin)?.host?.toLowerCase();
        const isTransakEvent = event.source === ref?.current?.contentWindow
            && host && TRANSAK_ORIGIN.includes(host);
        if (!isTransakEvent)
            return;
        handleAnalyticsEvent(event.data);
        handleEvents(event.data);
        console.log('@@@ Transak event', event); // eslint-disable-line no-console
    }, [ref]);
    reactExports.useEffect(() => {
        window.addEventListener('message', handleMessageEvent);
        return () => {
            clearTimeout(timeout.current);
            window.removeEventListener('message', handleMessageEvent);
        };
    }, []);
    return {
        initialised, onLoad,
    };
};

const transakIframeId = 'transak-iframe';
const IN_PROGRESS_VIEW_DELAY_MS = 6000; // 6 second
function OnRampMain({ passport, showIframe, tokenAmount, tokenAddress, showBackButton, }) {
    const { connectLoaderState } = reactExports.useContext(ConnectLoaderContext);
    const { checkout, provider } = connectLoaderState;
    const { eventTargetState: { eventTarget }, } = reactExports.useContext(EventTargetContext);
    const { t } = useTranslation();
    const { viewState, viewDispatch } = reactExports.useContext(ViewContext);
    const [widgetUrl, setWidgetUrl] = reactExports.useState('');
    const eventTimer = reactExports.useRef();
    const isPassport = !!passport && provider?.provider?.isPassport;
    const openedFromTopUpView = reactExports.useMemo(() => viewState.history.length > 2
        && viewState.history[viewState.history.length - 2].type
            === SharedViews.TOP_UP_VIEW, [viewState.history]);
    const showBack = showBackButton || openedFromTopUpView;
    const { track } = useAnalytics();
    const trackSegmentEvents = async (event, walletAddress) => {
        const miscProps = {
            userId: walletAddress.toLowerCase(),
            isPassportWallet: isPassport,
        };
        switch (event.event_id) {
            case TransakEvents$1.TRANSAK_WIDGET_OPEN:
                track({
                    userJourney: UserJourney.ON_RAMP,
                    screen: 'InputScreen',
                    control: 'TransakWidgetOpen',
                    controlType: 'IframeEvent',
                    extras: { ...miscProps },
                }); // checkoutOnRampInputScreen_TransakWidgetOpenIframeEvent
                break;
            case TransakEvents$1.TRANSAK_ORDER_CREATED:
                track({
                    userJourney: UserJourney.ON_RAMP,
                    screen: 'InputScreen',
                    control: 'OrderCreated',
                    controlType: 'IframeEvent',
                    extras: { ...miscProps },
                }); // checkoutOnRampInputScreen_OrderCreatedIframeEvent
                break;
            case TransakEvents$1.TRANSAK_ORDER_SUCCESSFUL:
                if (event.data.status === TransakStatuses$1.PROCESSING) {
                    // user paid
                    track({
                        userJourney: UserJourney.ON_RAMP,
                        screen: 'OrderInProgress',
                        control: 'PaymentProcessing',
                        controlType: 'IframeEvent',
                        extras: { ...miscProps },
                    }); // checkoutOnRampOrderInProgress_PaymentProcessingIframeEvent
                }
                if (event.data.status === TransakStatuses$1.COMPLETED) {
                    track({
                        userJourney: UserJourney.ON_RAMP,
                        screen: 'Success',
                        control: 'PaymentCompleted',
                        controlType: 'IframeEvent',
                        extras: { ...miscProps },
                    }); // checkoutOnRampSuccess_PaymentCompletedIframeEvent
                }
                break;
            case TransakEvents$1.TRANSAK_ORDER_FAILED: // payment failed
                track({
                    userJourney: UserJourney.ON_RAMP,
                    screen: 'Failure',
                    control: 'PaymentFailed',
                    controlType: 'IframeEvent',
                    extras: { ...miscProps },
                }); // checkoutOnRampFailure_PaymentFailedIframeEvent
                break;
        }
    };
    const transakEventHandler = (event) => {
        if (eventTimer.current)
            clearTimeout(eventTimer.current);
        if (event.event_id === TransakEvents$1.TRANSAK_WIDGET_OPEN) {
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: OnRampWidgetViews.ONRAMP,
                        data: {
                            amount: viewState.view.data?.amount ?? tokenAmount,
                            tokenAddress: viewState.view.data?.tokenAddress ?? tokenAddress,
                        },
                    },
                },
            });
            return;
        }
        if (event.event_id === TransakEvents$1.TRANSAK_ORDER_SUCCESSFUL
            && event.data.status === TransakStatuses$1.PROCESSING) {
            // this handles 3DS -- once the user has completed the verification,
            // kick off teh loading screen and then fake a IN_PROGRESS_VIEW_DELAY_MS
            // delay before showing the IN_PROGRESS screen
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: OnRampWidgetViews.IN_PROGRESS_LOADING,
                    },
                },
            });
            eventTimer.current = window.setTimeout(() => {
                viewDispatch({
                    payload: {
                        type: ViewActions.UPDATE_VIEW,
                        view: {
                            type: OnRampWidgetViews.IN_PROGRESS,
                        },
                    },
                });
            }, IN_PROGRESS_VIEW_DELAY_MS);
            return;
        }
        if (event.event_id === TransakEvents$1.TRANSAK_ORDER_SUCCESSFUL
            && event.data.status === TransakStatuses$1.COMPLETED) {
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: OnRampWidgetViews.SUCCESS,
                        data: {
                            transactionHash: event.data.transactionHash,
                        },
                    },
                },
            });
            return;
        }
        if (event.event_id === TransakEvents$1.TRANSAK_ORDER_FAILED) {
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: OnRampWidgetViews.FAIL,
                        data: {
                            amount: tokenAmount,
                            tokenAddress,
                        },
                        reason: `Transaction failed: ${event.data.statusReason}`,
                    },
                },
            });
        }
    };
    reactExports.useEffect(() => {
        if (!checkout || !provider)
            return;
        let userWalletAddress = '';
        (async () => {
            const params = {
                exchangeType: ExchangeType.ONRAMP,
                web3Provider: provider,
                tokenAddress,
                tokenAmount,
                passport,
            };
            setWidgetUrl(await checkout.createFiatRampUrl(params));
            userWalletAddress = await provider.getSigner().getAddress();
        })();
        const domIframe = document.getElementById(transakIframeId);
        if (!domIframe)
            return;
        const handleTransakEvents = (event) => {
            if (!domIframe)
                return;
            const host = url.parse(event.origin)?.host?.toLowerCase();
            if (event.source === domIframe.contentWindow
                && host
                && TRANSAK_ORIGIN.includes(host)) {
                trackSegmentEvents(event.data, userWalletAddress);
                transakEventHandler(event.data);
            }
        };
        window.addEventListener('message', handleTransakEvents);
    }, [checkout, provider, tokenAmount, tokenAddress, passport]);
    return (jsx(Box, { sx: boxMainStyle(showIframe), children: jsx(SimpleLayout, { header: (jsx(HeaderNavigation, { title: t('views.ONRAMP.header.title'), onCloseButtonClick: () => sendOnRampWidgetCloseEvent(eventTarget), showBack: showBack, onBackButtonClick: () => {
                    orchestrationEvents.sendRequestGoBackEvent(eventTarget, IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT, {});
                } })), footerBackgroundColor: "base.color.translucent.emphasis.200", children: jsx(Box, { sx: containerStyle(showIframe), children: jsx("iframe", { title: "Transak", id: transakIframeId, src: widgetUrl, allow: "camera;microphone;fullscreen;payment", style: {
                        height: '100%',
                        width: '100%',
                        border: 'none',
                        position: 'absolute',
                    } }) }) }) }));
}

function OrderInProgress() {
    const { eventTargetState: { eventTarget } } = reactExports.useContext(EventTargetContext);
    const { t } = useTranslation();
    return (jsx(SimpleLayout, { testId: "order-in-progress-view", header: (jsx(HeaderNavigation, { transparent: true, onCloseButtonClick: () => sendOnRampWidgetCloseEvent(eventTarget) })), footer: (jsx(FooterLogo, {})), heroContent: jsx(SpendingCapHero, {}), floatHeader: true, children: jsxs(SimpleTextBody, { heading: t('views.ONRAMP.IN_PROGRESS.content.heading'), children: [t('views.ONRAMP.IN_PROGRESS.content.body1'), jsx("br", {}), jsx("br", {}), t('views.ONRAMP.IN_PROGRESS.content.body2')] }) }));
}

function OnRampWidget({ amount, tokenAddress, config, showBackButton, }) {
    const { isOnRampEnabled, isSwapEnabled, isBridgeEnabled, } = config;
    const [viewState, viewDispatch] = reactExports.useReducer(viewReducer, {
        ...initialViewState,
        history: [],
    });
    const viewReducerValues = reactExports.useMemo(() => ({ viewState, viewDispatch }), [viewState, viewReducer]);
    const { connectLoaderState } = reactExports.useContext(ConnectLoaderContext);
    const { checkout, provider } = connectLoaderState;
    const [tknAddr, setTknAddr] = reactExports.useState(tokenAddress);
    const { eventTargetState: { eventTarget } } = reactExports.useContext(EventTargetContext);
    const { t } = useTranslation();
    const showIframe = reactExports.useMemo(() => viewState.view.type === OnRampWidgetViews.ONRAMP, [viewState.view.type]);
    reactExports.useEffect(() => {
        if (!checkout || !provider)
            return;
        (async () => {
            const network = await checkout.getNetworkInfo({
                provider,
            });
            /* If the provider's network is not supported, return out of this and let the
          connect loader handle the switch network functionality */
            if (!network.isSupported) {
                return;
            }
            const address = tknAddr?.toLocaleLowerCase() === NATIVE
                ? NATIVE
                : tokenAddress;
            setTknAddr(address);
        })();
    }, [checkout, provider, viewDispatch]);
    return (jsxs(ViewContext.Provider, { value: viewReducerValues, children: [viewState.view.type === SharedViews.LOADING_VIEW && (jsx(LoadingView, { loadingText: t('views.ONRAMP.initialLoadingText') })), viewState.view.type === OnRampWidgetViews.IN_PROGRESS_LOADING && (jsx(LoadingView, { loadingText: t('views.ONRAMP.IN_PROGRESS_LOADING.loading.text') })), viewState.view.type === OnRampWidgetViews.IN_PROGRESS && (jsx(OrderInProgress, {})), viewState.view.type === OnRampWidgetViews.SUCCESS && (jsx(StatusView, { statusText: t('views.ONRAMP.SUCCESS.text'), actionText: t('views.ONRAMP.SUCCESS.actionText'), onRenderEvent: () => sendOnRampSuccessEvent(eventTarget, viewState.view.data.transactionHash), onActionClick: () => sendOnRampWidgetCloseEvent(eventTarget), statusType: StatusType.SUCCESS, testId: "success-view" })), viewState.view.type === OnRampWidgetViews.FAIL && (jsx(StatusView, { statusText: t('views.ONRAMP.FAIL.text'), actionText: t('views.ONRAMP.FAIL.actionText'), onRenderEvent: () => sendOnRampFailedEvent(eventTarget, viewState.view.reason
                    ?? 'Transaction failed'), onActionClick: () => {
                    viewDispatch({
                        payload: {
                            type: ViewActions.UPDATE_VIEW,
                            view: {
                                type: OnRampWidgetViews.ONRAMP,
                                data: viewState.view.data,
                            },
                        },
                    });
                }, statusType: StatusType.FAILURE, onCloseClick: () => sendOnRampWidgetCloseEvent(eventTarget), testId: "fail-view" })), (viewState.view.type !== OnRampWidgetViews.SUCCESS
                && viewState.view.type !== OnRampWidgetViews.FAIL) && (jsx(OnRampMain, { passport: checkout?.passport, showIframe: showIframe, tokenAmount: amount ?? viewState.view.data?.amount, tokenAddress: tknAddr ?? viewState.view.data?.tokenAddress, showBackButton: showBackButton })), viewState.view.type === SharedViews.TOP_UP_VIEW && (jsx(TopUpView, { analytics: { userJourney: UserJourney.ON_RAMP }, widgetEvent: IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT, checkout: checkout, provider: provider, showOnrampOption: isOnRampEnabled, showSwapOption: isSwapEnabled, showBridgeOption: isBridgeEnabled, onCloseButtonClick: () => sendOnRampWidgetCloseEvent(eventTarget) }))] }));
}

var OnRampWidget$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: OnRampWidget
});

export { OnRampWidget as O, OnRampWidget$1 as a, useTransakEvents as u };
