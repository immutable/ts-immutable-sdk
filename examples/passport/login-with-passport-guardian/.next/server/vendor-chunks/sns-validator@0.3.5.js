"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/sns-validator@0.3.5";
exports.ids = ["vendor-chunks/sns-validator@0.3.5"];
exports.modules = {

/***/ "(ssr)/../../../node_modules/.pnpm/sns-validator@0.3.5/node_modules/sns-validator/index.js":
/*!*******************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/sns-validator@0.3.5/node_modules/sns-validator/index.js ***!
  \*******************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nvar url = __webpack_require__(/*! url */ \"url\"),\n    https = __webpack_require__(/*! https */ \"https\"),\n    crypto = __webpack_require__(/*! crypto */ \"crypto\"),\n    defaultEncoding = 'utf8',\n    defaultHostPattern = /^sns\\.[a-zA-Z0-9\\-]{3,}\\.amazonaws\\.com(\\.cn)?$/,\n    certCache = {},\n    subscriptionControlKeys = ['SubscribeURL', 'Token'],\n    subscriptionControlMessageTypes = [\n        'SubscriptionConfirmation',\n        'UnsubscribeConfirmation'\n    ],\n    requiredKeys = [\n        'Message',\n        'MessageId',\n        'Timestamp',\n        'TopicArn',\n        'Type',\n        'Signature',\n        'SigningCertURL',\n        'SignatureVersion'\n    ],\n    signableKeysForNotification = [\n        'Message',\n        'MessageId',\n        'Subject',\n        'SubscribeURL',\n        'Timestamp',\n        'TopicArn',\n        'Type'\n    ],\n    signableKeysForSubscription = [\n        'Message',\n        'MessageId',\n        'Subject',\n        'SubscribeURL',\n        'Timestamp',\n        'Token',\n        'TopicArn',\n        'Type'\n    ],\n    lambdaMessageKeys = {\n        'SigningCertUrl': 'SigningCertURL',\n        'UnsubscribeUrl': 'UnsubscribeURL'\n    };\n\nvar hashHasKeys = function (hash, keys) {\n    for (var i = 0; i < keys.length; i++) {\n        if (!(keys[i] in hash)) {\n            return false;\n        }\n    }\n\n    return true;\n};\n\nvar indexOf = function (array, value) {\n    for (var i = 0; i < array.length; i++) {\n        if (value === array[i]) {\n            return i;\n        }\n    }\n\n    return -1;\n};\n\nfunction convertLambdaMessage(message) {\n    for (var key in lambdaMessageKeys) {\n        if (key in message) {\n            message[lambdaMessageKeys[key]] = message[key];\n        }\n    }\n\n    if ('Subject' in message && message.Subject === null) {\n        delete message.Subject;\n    }\n\n    return message;\n}\n\nvar validateMessageStructure = function (message) {\n    var valid = hashHasKeys(message, requiredKeys);\n\n    if (indexOf(subscriptionControlMessageTypes, message['Type']) > -1) {\n        valid = valid && hashHasKeys(message, subscriptionControlKeys);\n    }\n\n    return valid;\n};\n\nvar validateUrl = function (urlToValidate, hostPattern) {\n    var parsed = url.parse(urlToValidate);\n\n    return parsed.protocol === 'https:'\n        && parsed.path.substr(-4) === '.pem'\n        && hostPattern.test(parsed.host);\n};\n\nvar getCertificate = function (certUrl, cb) {\n    if (certCache.hasOwnProperty(certUrl)) {\n        cb(null, certCache[certUrl]);\n        return;\n    }\n\n    https.get(certUrl, function (res) {\n        var chunks = [];\n\n        if(res.statusCode !== 200){\n            return cb(new Error('Certificate could not be retrieved'));\n        }\n\n        res\n            .on('data', function (data) {\n                chunks.push(data.toString());\n            })\n            .on('end', function () {\n                certCache[certUrl] = chunks.join('');\n                cb(null, certCache[certUrl]);\n            });\n    }).on('error', cb)\n};\n\nvar validateSignature = function (message, cb, encoding) {\n    var signatureVersion = message['SignatureVersion'];\n    if (signatureVersion !== '1' && signatureVersion !== '2') {\n        cb(new Error('The signature version '\n            + signatureVersion + ' is not supported.'));\n        return;\n    }\n\n    var signableKeys = [];\n    if (message.Type === 'SubscriptionConfirmation') {\n        signableKeys = signableKeysForSubscription.slice(0);\n    } else {\n        signableKeys = signableKeysForNotification.slice(0);\n    }\n\n    var verifier = (signatureVersion === '1') ? crypto.createVerify('RSA-SHA1') : crypto.createVerify('RSA-SHA256');\n    for (var i = 0; i < signableKeys.length; i++) {\n        if (signableKeys[i] in message) {\n            verifier.update(signableKeys[i] + \"\\n\"\n                + message[signableKeys[i]] + \"\\n\", encoding);\n        }\n    }\n\n    getCertificate(message['SigningCertURL'], function (err, certificate) {\n        if (err) {\n            cb(err);\n            return;\n        }\n        try {\n            if (verifier.verify(certificate, message['Signature'], 'base64')) {\n                cb(null, message);\n            } else {\n                cb(new Error('The message signature is invalid.'));\n            }\n        } catch (e) {\n            cb(e);\n        }\n    });\n};\n\n/**\n * A validator for inbound HTTP(S) SNS messages.\n *\n * @constructor\n * @param {RegExp} [hostPattern=/^sns\\.[a-zA-Z0-9\\-]{3,}\\.amazonaws\\.com(\\.cn)?$/] - A pattern used to validate that a message's certificate originates from a trusted domain.\n * @param {String} [encoding='utf8'] - The encoding of the messages being signed.\n */\nfunction MessageValidator(hostPattern, encoding) {\n    this.hostPattern = hostPattern || defaultHostPattern;\n    this.encoding = encoding || defaultEncoding;\n}\n\n/**\n * A callback to be called by the validator once it has verified a message's\n * signature.\n *\n * @callback validationCallback\n * @param {Error} error - Any error encountered attempting to validate a\n *                          message's signature.\n * @param {Object} message - The validated inbound SNS message.\n */\n\n/**\n * Validates a message's signature and passes it to the provided callback.\n *\n * @param {Object} hash\n * @param {validationCallback} cb\n */\nMessageValidator.prototype.validate = function (hash, cb) {\n    if (typeof hash === 'string') {\n        try {\n            hash = JSON.parse(hash);\n        } catch (err) {\n            cb(err);\n            return;\n        }\n    }\n\n    hash = convertLambdaMessage(hash);\n\n    if (!validateMessageStructure(hash)) {\n        cb(new Error('Message missing required keys.'));\n        return;\n    }\n\n    if (!validateUrl(hash['SigningCertURL'], this.hostPattern)) {\n        cb(new Error('The certificate is located on an invalid domain.'));\n        return;\n    }\n\n    validateSignature(hash, cb, this.encoding);\n};\n\nmodule.exports = MessageValidator;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3Nucy12YWxpZGF0b3JAMC4zLjUvbm9kZV9tb2R1bGVzL3Nucy12YWxpZGF0b3IvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQWE7O0FBRWIsVUFBVSxtQkFBTyxDQUFDLGdCQUFLO0FBQ3ZCLFlBQVksbUJBQU8sQ0FBQyxvQkFBTztBQUMzQixhQUFhLG1CQUFPLENBQUMsc0JBQVE7QUFDN0I7QUFDQSw4Q0FBOEMsR0FBRztBQUNqRCxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG9CQUFvQixpQkFBaUI7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG9CQUFvQixrQkFBa0I7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQSxvQkFBb0IseUJBQXlCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVEsa0NBQWtDLEdBQUc7QUFDeEQsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQjtBQUNBLFdBQVcsUUFBUTtBQUNuQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxvQkFBb0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGV4YW1wbGVzL2xvZ2luLXdpdGgtcGFzc3BvcnQtZ3VhcmRpYW4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3Nucy12YWxpZGF0b3JAMC4zLjUvbm9kZV9tb2R1bGVzL3Nucy12YWxpZGF0b3IvaW5kZXguanM/OGY5MSJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxudmFyIHVybCA9IHJlcXVpcmUoJ3VybCcpLFxuICAgIGh0dHBzID0gcmVxdWlyZSgnaHR0cHMnKSxcbiAgICBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKSxcbiAgICBkZWZhdWx0RW5jb2RpbmcgPSAndXRmOCcsXG4gICAgZGVmYXVsdEhvc3RQYXR0ZXJuID0gL15zbnNcXC5bYS16QS1aMC05XFwtXXszLH1cXC5hbWF6b25hd3NcXC5jb20oXFwuY24pPyQvLFxuICAgIGNlcnRDYWNoZSA9IHt9LFxuICAgIHN1YnNjcmlwdGlvbkNvbnRyb2xLZXlzID0gWydTdWJzY3JpYmVVUkwnLCAnVG9rZW4nXSxcbiAgICBzdWJzY3JpcHRpb25Db250cm9sTWVzc2FnZVR5cGVzID0gW1xuICAgICAgICAnU3Vic2NyaXB0aW9uQ29uZmlybWF0aW9uJyxcbiAgICAgICAgJ1Vuc3Vic2NyaWJlQ29uZmlybWF0aW9uJ1xuICAgIF0sXG4gICAgcmVxdWlyZWRLZXlzID0gW1xuICAgICAgICAnTWVzc2FnZScsXG4gICAgICAgICdNZXNzYWdlSWQnLFxuICAgICAgICAnVGltZXN0YW1wJyxcbiAgICAgICAgJ1RvcGljQXJuJyxcbiAgICAgICAgJ1R5cGUnLFxuICAgICAgICAnU2lnbmF0dXJlJyxcbiAgICAgICAgJ1NpZ25pbmdDZXJ0VVJMJyxcbiAgICAgICAgJ1NpZ25hdHVyZVZlcnNpb24nXG4gICAgXSxcbiAgICBzaWduYWJsZUtleXNGb3JOb3RpZmljYXRpb24gPSBbXG4gICAgICAgICdNZXNzYWdlJyxcbiAgICAgICAgJ01lc3NhZ2VJZCcsXG4gICAgICAgICdTdWJqZWN0JyxcbiAgICAgICAgJ1N1YnNjcmliZVVSTCcsXG4gICAgICAgICdUaW1lc3RhbXAnLFxuICAgICAgICAnVG9waWNBcm4nLFxuICAgICAgICAnVHlwZSdcbiAgICBdLFxuICAgIHNpZ25hYmxlS2V5c0ZvclN1YnNjcmlwdGlvbiA9IFtcbiAgICAgICAgJ01lc3NhZ2UnLFxuICAgICAgICAnTWVzc2FnZUlkJyxcbiAgICAgICAgJ1N1YmplY3QnLFxuICAgICAgICAnU3Vic2NyaWJlVVJMJyxcbiAgICAgICAgJ1RpbWVzdGFtcCcsXG4gICAgICAgICdUb2tlbicsXG4gICAgICAgICdUb3BpY0FybicsXG4gICAgICAgICdUeXBlJ1xuICAgIF0sXG4gICAgbGFtYmRhTWVzc2FnZUtleXMgPSB7XG4gICAgICAgICdTaWduaW5nQ2VydFVybCc6ICdTaWduaW5nQ2VydFVSTCcsXG4gICAgICAgICdVbnN1YnNjcmliZVVybCc6ICdVbnN1YnNjcmliZVVSTCdcbiAgICB9O1xuXG52YXIgaGFzaEhhc0tleXMgPSBmdW5jdGlvbiAoaGFzaCwga2V5cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIShrZXlzW2ldIGluIGhhc2gpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbnZhciBpbmRleE9mID0gZnVuY3Rpb24gKGFycmF5LCB2YWx1ZSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHZhbHVlID09PSBhcnJheVtpXSkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gLTE7XG59O1xuXG5mdW5jdGlvbiBjb252ZXJ0TGFtYmRhTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGxhbWJkYU1lc3NhZ2VLZXlzKSB7XG4gICAgICAgIGlmIChrZXkgaW4gbWVzc2FnZSkge1xuICAgICAgICAgICAgbWVzc2FnZVtsYW1iZGFNZXNzYWdlS2V5c1trZXldXSA9IG1lc3NhZ2Vba2V5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICgnU3ViamVjdCcgaW4gbWVzc2FnZSAmJiBtZXNzYWdlLlN1YmplY3QgPT09IG51bGwpIHtcbiAgICAgICAgZGVsZXRlIG1lc3NhZ2UuU3ViamVjdDtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVzc2FnZTtcbn1cblxudmFyIHZhbGlkYXRlTWVzc2FnZVN0cnVjdHVyZSA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgdmFyIHZhbGlkID0gaGFzaEhhc0tleXMobWVzc2FnZSwgcmVxdWlyZWRLZXlzKTtcblxuICAgIGlmIChpbmRleE9mKHN1YnNjcmlwdGlvbkNvbnRyb2xNZXNzYWdlVHlwZXMsIG1lc3NhZ2VbJ1R5cGUnXSkgPiAtMSkge1xuICAgICAgICB2YWxpZCA9IHZhbGlkICYmIGhhc2hIYXNLZXlzKG1lc3NhZ2UsIHN1YnNjcmlwdGlvbkNvbnRyb2xLZXlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWQ7XG59O1xuXG52YXIgdmFsaWRhdGVVcmwgPSBmdW5jdGlvbiAodXJsVG9WYWxpZGF0ZSwgaG9zdFBhdHRlcm4pIHtcbiAgICB2YXIgcGFyc2VkID0gdXJsLnBhcnNlKHVybFRvVmFsaWRhdGUpO1xuXG4gICAgcmV0dXJuIHBhcnNlZC5wcm90b2NvbCA9PT0gJ2h0dHBzOidcbiAgICAgICAgJiYgcGFyc2VkLnBhdGguc3Vic3RyKC00KSA9PT0gJy5wZW0nXG4gICAgICAgICYmIGhvc3RQYXR0ZXJuLnRlc3QocGFyc2VkLmhvc3QpO1xufTtcblxudmFyIGdldENlcnRpZmljYXRlID0gZnVuY3Rpb24gKGNlcnRVcmwsIGNiKSB7XG4gICAgaWYgKGNlcnRDYWNoZS5oYXNPd25Qcm9wZXJ0eShjZXJ0VXJsKSkge1xuICAgICAgICBjYihudWxsLCBjZXJ0Q2FjaGVbY2VydFVybF0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaHR0cHMuZ2V0KGNlcnRVcmwsIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgdmFyIGNodW5rcyA9IFtdO1xuXG4gICAgICAgIGlmKHJlcy5zdGF0dXNDb2RlICE9PSAyMDApe1xuICAgICAgICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignQ2VydGlmaWNhdGUgY291bGQgbm90IGJlIHJldHJpZXZlZCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc1xuICAgICAgICAgICAgLm9uKCdkYXRhJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBjaHVua3MucHVzaChkYXRhLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vbignZW5kJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNlcnRDYWNoZVtjZXJ0VXJsXSA9IGNodW5rcy5qb2luKCcnKTtcbiAgICAgICAgICAgICAgICBjYihudWxsLCBjZXJ0Q2FjaGVbY2VydFVybF0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfSkub24oJ2Vycm9yJywgY2IpXG59O1xuXG52YXIgdmFsaWRhdGVTaWduYXR1cmUgPSBmdW5jdGlvbiAobWVzc2FnZSwgY2IsIGVuY29kaW5nKSB7XG4gICAgdmFyIHNpZ25hdHVyZVZlcnNpb24gPSBtZXNzYWdlWydTaWduYXR1cmVWZXJzaW9uJ107XG4gICAgaWYgKHNpZ25hdHVyZVZlcnNpb24gIT09ICcxJyAmJiBzaWduYXR1cmVWZXJzaW9uICE9PSAnMicpIHtcbiAgICAgICAgY2IobmV3IEVycm9yKCdUaGUgc2lnbmF0dXJlIHZlcnNpb24gJ1xuICAgICAgICAgICAgKyBzaWduYXR1cmVWZXJzaW9uICsgJyBpcyBub3Qgc3VwcG9ydGVkLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBzaWduYWJsZUtleXMgPSBbXTtcbiAgICBpZiAobWVzc2FnZS5UeXBlID09PSAnU3Vic2NyaXB0aW9uQ29uZmlybWF0aW9uJykge1xuICAgICAgICBzaWduYWJsZUtleXMgPSBzaWduYWJsZUtleXNGb3JTdWJzY3JpcHRpb24uc2xpY2UoMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2lnbmFibGVLZXlzID0gc2lnbmFibGVLZXlzRm9yTm90aWZpY2F0aW9uLnNsaWNlKDApO1xuICAgIH1cblxuICAgIHZhciB2ZXJpZmllciA9IChzaWduYXR1cmVWZXJzaW9uID09PSAnMScpID8gY3J5cHRvLmNyZWF0ZVZlcmlmeSgnUlNBLVNIQTEnKSA6IGNyeXB0by5jcmVhdGVWZXJpZnkoJ1JTQS1TSEEyNTYnKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZ25hYmxlS2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2lnbmFibGVLZXlzW2ldIGluIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHZlcmlmaWVyLnVwZGF0ZShzaWduYWJsZUtleXNbaV0gKyBcIlxcblwiXG4gICAgICAgICAgICAgICAgKyBtZXNzYWdlW3NpZ25hYmxlS2V5c1tpXV0gKyBcIlxcblwiLCBlbmNvZGluZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRDZXJ0aWZpY2F0ZShtZXNzYWdlWydTaWduaW5nQ2VydFVSTCddLCBmdW5jdGlvbiAoZXJyLCBjZXJ0aWZpY2F0ZSkge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjYihlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodmVyaWZpZXIudmVyaWZ5KGNlcnRpZmljYXRlLCBtZXNzYWdlWydTaWduYXR1cmUnXSwgJ2Jhc2U2NCcpKSB7XG4gICAgICAgICAgICAgICAgY2IobnVsbCwgbWVzc2FnZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNiKG5ldyBFcnJvcignVGhlIG1lc3NhZ2Ugc2lnbmF0dXJlIGlzIGludmFsaWQuJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjYihlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLyoqXG4gKiBBIHZhbGlkYXRvciBmb3IgaW5ib3VuZCBIVFRQKFMpIFNOUyBtZXNzYWdlcy5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7UmVnRXhwfSBbaG9zdFBhdHRlcm49L15zbnNcXC5bYS16QS1aMC05XFwtXXszLH1cXC5hbWF6b25hd3NcXC5jb20oXFwuY24pPyQvXSAtIEEgcGF0dGVybiB1c2VkIHRvIHZhbGlkYXRlIHRoYXQgYSBtZXNzYWdlJ3MgY2VydGlmaWNhdGUgb3JpZ2luYXRlcyBmcm9tIGEgdHJ1c3RlZCBkb21haW4uXG4gKiBAcGFyYW0ge1N0cmluZ30gW2VuY29kaW5nPSd1dGY4J10gLSBUaGUgZW5jb2Rpbmcgb2YgdGhlIG1lc3NhZ2VzIGJlaW5nIHNpZ25lZC5cbiAqL1xuZnVuY3Rpb24gTWVzc2FnZVZhbGlkYXRvcihob3N0UGF0dGVybiwgZW5jb2RpbmcpIHtcbiAgICB0aGlzLmhvc3RQYXR0ZXJuID0gaG9zdFBhdHRlcm4gfHwgZGVmYXVsdEhvc3RQYXR0ZXJuO1xuICAgIHRoaXMuZW5jb2RpbmcgPSBlbmNvZGluZyB8fCBkZWZhdWx0RW5jb2Rpbmc7XG59XG5cbi8qKlxuICogQSBjYWxsYmFjayB0byBiZSBjYWxsZWQgYnkgdGhlIHZhbGlkYXRvciBvbmNlIGl0IGhhcyB2ZXJpZmllZCBhIG1lc3NhZ2Unc1xuICogc2lnbmF0dXJlLlxuICpcbiAqIEBjYWxsYmFjayB2YWxpZGF0aW9uQ2FsbGJhY2tcbiAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIC0gQW55IGVycm9yIGVuY291bnRlcmVkIGF0dGVtcHRpbmcgdG8gdmFsaWRhdGUgYVxuICogICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UncyBzaWduYXR1cmUuXG4gKiBAcGFyYW0ge09iamVjdH0gbWVzc2FnZSAtIFRoZSB2YWxpZGF0ZWQgaW5ib3VuZCBTTlMgbWVzc2FnZS5cbiAqL1xuXG4vKipcbiAqIFZhbGlkYXRlcyBhIG1lc3NhZ2UncyBzaWduYXR1cmUgYW5kIHBhc3NlcyBpdCB0byB0aGUgcHJvdmlkZWQgY2FsbGJhY2suXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhhc2hcbiAqIEBwYXJhbSB7dmFsaWRhdGlvbkNhbGxiYWNrfSBjYlxuICovXG5NZXNzYWdlVmFsaWRhdG9yLnByb3RvdHlwZS52YWxpZGF0ZSA9IGZ1bmN0aW9uIChoYXNoLCBjYikge1xuICAgIGlmICh0eXBlb2YgaGFzaCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhc2ggPSBKU09OLnBhcnNlKGhhc2gpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNiKGVycik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYXNoID0gY29udmVydExhbWJkYU1lc3NhZ2UoaGFzaCk7XG5cbiAgICBpZiAoIXZhbGlkYXRlTWVzc2FnZVN0cnVjdHVyZShoYXNoKSkge1xuICAgICAgICBjYihuZXcgRXJyb3IoJ01lc3NhZ2UgbWlzc2luZyByZXF1aXJlZCBrZXlzLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdmFsaWRhdGVVcmwoaGFzaFsnU2lnbmluZ0NlcnRVUkwnXSwgdGhpcy5ob3N0UGF0dGVybikpIHtcbiAgICAgICAgY2IobmV3IEVycm9yKCdUaGUgY2VydGlmaWNhdGUgaXMgbG9jYXRlZCBvbiBhbiBpbnZhbGlkIGRvbWFpbi4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YWxpZGF0ZVNpZ25hdHVyZShoYXNoLCBjYiwgdGhpcy5lbmNvZGluZyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2VWYWxpZGF0b3I7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/sns-validator@0.3.5/node_modules/sns-validator/index.js\n");

/***/ })

};
;