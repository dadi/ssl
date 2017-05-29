'use strict'

const SSL = require('./lib/ssl')

module.exports = function () {
  return new SSL()
}