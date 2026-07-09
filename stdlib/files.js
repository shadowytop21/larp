// LARP stdlib — files.js
'use strict';
const fs = require('fs');

exports.readFile   = (path) => fs.readFileSync(path, 'utf8');
exports.writeFile  = (path, content) => fs.writeFileSync(path, content, 'utf8');
exports.appendFile = (path, content) => fs.appendFileSync(path, content, 'utf8');
exports.fileExists = (path) => fs.existsSync(path);
