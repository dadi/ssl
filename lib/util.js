'use strict'

const mkdirp = require('mkdirp-promise')
const path = require('path')
const RSA = require('node-rsa')

const createDirectory = (dir) => {
  return mkdirp(path.normalize(dir))
}

const rsa = () => {
  return new RSA({
    b: 3072, 
    e: 61537
  }, {
    signingScheme: 'SHA256'
  })//.generateKeyPair(4096, 65537)

  // const text = 'DADI!'
  // const encrypted = key.encrypt(text, 'base64')
  // const decrypted = key.decrypt(encrypted, 'utf8')
  // console.log('decrypted: ', decrypted)
}

/**
 * [description]
 * @param  {Function} x) [description]
 * @return {[type]}      [description]
 */
const fromStandardB64 = (x) => x
  .replace(/[+]/g, "-")
  .replace(/\//g, "_")
  .replace(/=/g,"")

/**
 * [description]
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
const toStandardB64 = (x) => {
  let b64 = x
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/=/g, "")

  switch (b64.length % 4) {
    case 2: b64 += "=="
      break
    case 3: b64 += "="
      break
  }

  return b64
}

const b64enc = (buffer) => fromStandardB64(buffer.toString("base64"))
const b64dec = (str) => new Buffer(toStandardB64(str), "base64")

const toBinaryString = (str) => new Buffer(str.toString(), 'binary')
const toBuffer = (str) => new Buffer(str)

module.exports = {
  createDirectory,
  rsa,
  b64enc,
  b64dec,
  toBinaryString,
  toBuffer
}