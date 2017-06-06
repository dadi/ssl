'use strict'

const mkdirp = require('mkdirp-promise')
const path = require('path')
const ursa = require('ursa')
const crypto = require('crypto')

const createDirectory = (dir) => {
  return mkdirp(path.normalize(dir))
}

/**
 * RSA
 * Generate RSA
 * @param  {Number} bytelength Byte length of RSA.
 * @return {Object} RSA Key object.
 */
const rsa = (bytelength) => ursa.generatePrivateKey(bytelength, 65537)

/**
 * [description]
 * @param  {Function} x) [description]
 * @return {[type]}      [description]
 */
const fromStandardB64 = (x) => x
  .replace(/[+]/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g,'')

/**
 * [description]
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
const toStandardB64 = (x) => {
  let b64 = x
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .replace(/=/g, '')

  switch (b64.length % 4) {
    case 2: b64 += '=='
      break
    case 3: b64 += '='
      break
  }

  return b64
}

const b64enc = (buffer) => fromStandardB64(buffer.toString('base64'))
const b64dec = (str) => new Buffer(toStandardB64(str), 'base64')

const toBinaryString = (str) => new Buffer(str, 'binary')
const toBuffer = (str) => new Buffer(str)

const b64EncodeBinaryString = (str) => b64enc(toBinaryString(str.toString()))

const JSONDigest = (json) => {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(json))
    .digest('asci')
}

module.exports = {
  createDirectory,
  rsa,
  b64enc,
  b64dec,
  toBuffer,
  JSONDigest
}