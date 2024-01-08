/* eslint-disable */
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

const { JSDOM } = require('jsdom');
const dom = new JSDOM();

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
