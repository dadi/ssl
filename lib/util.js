'use strict'

const mkdirp = require('mkdirp-promise')
const path = require('path')

const createDirectory = (dir) => {
  return mkdirp(path.normalize(dir))
}

module.exports = {
  createDirectory
}