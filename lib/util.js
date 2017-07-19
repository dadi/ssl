'use strict'

const mkdirp = require('mkdirp-promise')
const moment = require('moment')
const path = require('path')
const ursa = require('ursa')
const crypto = require('crypto')
const RSA = require('rsa-compat').RSA
const x509 = require('x509')

const createDirectory = dir => {
  if (typeof dir !== 'string') {
    throw new Error('Directory must be a string')
  }
  return mkdirp(path.normalize(dir))
}

const generateCSR = (keyPair, domains) => {
  if (typeof domains !== 'object') {
    throw new Error('Invalid domains. Must be an array')
  }
  try {
    return RSA.generateCsrDerWeb64(keyPair, domains)
  } catch (e) {
    throw new Error('Invalid keyPair in generateCSR')
  }
}

const rsaKeyPair = (bytelength) => {
  const key = ursa.generatePrivateKey(bytelength, 65537)
  return {
    privateKeyPem: key.toPrivatePem('utf8'),
    publicKeyPem: key.toPublicPem('utf8')
  }
}

/**
 * RSA
 * Generate RSA
 * @param  {Number} bytelength Byte length of RSA.
 * @return {Object} RSA Key object.
 */
const rsa = (bytelength) => {
  if (isNaN(bytelength) || bytelength < 512) {
    throw new Error('Invalid bytelength. Must be a number >= 512')
  }
  return ursa.generatePrivateKey(bytelength, 65537)
}

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
const toStandardB64 = str => {
  if (typeof str !== 'string') {
    throw new Error('toStandardB64 requires type of String')
  }

  let b64 = str
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

const b64enc = (buffer=new Buffer('')) => fromStandardB64(buffer.toString('base64'))

const toBinaryString = str => {
  if (typeof str !== 'string') {
    throw new Error('toBinaryString requires type of String')
  }
  return new Buffer(str, 'binary')
}

const toBuffer = str => {
  if (typeof str !== 'string' && typeof str !== 'object' ) {
    throw new Error('toBuffer requires type of String')
  }
  return new Buffer(str)
}

const b64EncodeBinaryString = (str) => b64enc(toBinaryString(str.toString()))

const JSONDigest = json => {
  if (typeof json !== 'object') {
    throw new Error('JSONDigest requires type of String')
  }
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(json))
    .digest()
}

const toPEM = cert => {
  if (typeof cert !== 'object') {
    throw new Error('toPEM requires type of String')
  }
  cert = toStandardB64(cert.toString('base64'))
  cert = cert.match(/.{1,64}/g).join('\n')
  return `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
}

const parseCert = cert => x509.parseCert(cert)

const timeLeft = (end=new Date(), daysEarly=0) => {
  const startDate = moment(new Date())
    .format("YYYY-MM-DD HH:mm:ss")
  const endDate = moment(new Date(end))
    .subtract(daysEarly, 'd')
    .format("YYYY-MM-DD HH:mm:ss")

  return {
    days: Math.max(
      0, 
      moment(endDate)
      .diff(startDate, 'days')
    ),
    ms: Math.max(
      0,
      moment(endDate)
      .diff(startDate, 'ms')
    )
  }
}

/**
 * Delay
 * @param {Number} duration Delay time in miliseconds
 * @return {Promise} Promise returned after timeout
 */
const delay = duration => new Promise(resolve => {
  setTimeout(resolve, duration)
})

module.exports = {
  createDirectory,
  delay,
  rsa,
  b64enc,
  parseCert,
  timeLeft,
  toBuffer,
  toPEM,
  toStandardB64,
  JSONDigest,
  generateCSR,
  rsaKeyPair,
  b64EncodeBinaryString
}