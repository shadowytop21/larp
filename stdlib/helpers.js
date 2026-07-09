// LARP stdlib — helpers.js
// Math, text, and utility helpers.
'use strict';

exports.squareRoot = Math.sqrt;
exports.round      = Math.round;
exports.floor      = Math.floor;
exports.ceil       = Math.ceil;
exports.abs        = Math.abs;
exports.max        = Math.max;
exports.min        = Math.min;
exports.random     = () => Math.random();
exports.randomInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Text
exports.uppercase  = (s) => String(s).toUpperCase();
exports.lowercase  = (s) => String(s).toLowerCase();
exports.trim       = (s) => String(s).trim();
exports.split      = (s, delim) => String(s).split(delim);
exports.join       = (arr, delim) => arr.join(delim);
exports.includes   = (s, sub) => String(s).includes(sub);
exports.startsWith = (s, pre) => String(s).startsWith(pre);
exports.endsWith   = (s, suf) => String(s).endsWith(suf);
exports.replace    = (s, from, to) => String(s).replace(from, to);
exports.replaceAll = (s, from, to) => String(s).replaceAll(from, to);
exports.length     = (s) => (Array.isArray(s) || typeof s === 'string') ? s.length : 0;
exports.toNumber   = (s) => Number(s);
exports.toText     = (v) => String(v);

// Time
exports.currentTime = () => new Date().toISOString();
exports.timestamp   = () => Date.now();
