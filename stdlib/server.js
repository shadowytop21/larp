// LARP stdlib — server.js
// Thin wrapper over Express for LARP's built-in server support.
'use strict';

const express = require('express');

exports.createServer = function createServer() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  return app;
};
exports.express = express;
