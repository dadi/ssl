'use strict'

const util = require('./util')
const providers = require('../providers')
const fs = require('fs')

const SSL = function () {
  this.args = {}
}

SSL.prototype.addOpts = function () {
  Object.assign(this.args, ...arguments)
  return this
}

/**
 * Use domains
 * Set a list of required domains.
 * @param  {Array} domains Domains to be applied to certificate.
 * @return {SSL} SSL module. (this)
 */
SSL.prototype.useDomains = function (domains=[]) {
  return this.addOpts({domains})
}

/**
 * Use Dir
 * Set options for the directory to store the certificates.
 * @param  {String} dir Where we'll store the certificates.
 * @param  {Boolean} createDir Do we have permission to create the directory?
 * @return {SSL} SSL module. (this)
 */
SSL.prototype.useDir = function (dir='~/dadi/ssl/', createDir=true) {
  return this.addOpts({dir, createDir})
}

/**
 * Use Environment
 * Select the letsencrypt environemnt.
 * @param  {String} env Environment name.
 * @return {Function} Instance of addOpts.
 */
SSL.prototype.useEnvironment = function (env='production') {
  return this.addOpts({env})
}

/**
 * Provider
 * Select the certificate authority.
 * @param  {String} provider Friendly provider name.
 * @return {Function} Instance of addOpts.
 */
SSL.prototype.provider = function (provider='letsencrypt') {
  switch(provider) {
    case 'letsencrypt':
      return this.addOpts({Provider: providers.le})
      break
    default:
      return this.addOpts({Provider: providers.le})
  }
}

/**
 * Register To
 * Select an email address for the account to be registered to.
 * @param  {String|null} email Email address to register.
 * @return {Function} Instance of addOpts.
 */
SSL.prototype.registerTo = function (email=null) {
  return this.addOpts({email})
}

/**
 * Auto Renew
 * Whether the certificate will be renewed shortly before expiring.
 * @param  {Boolean} autoRenew Yes/No
 * @return {Function} Instance of addOpts.
 */
SSL.prototype.autoRenew = function (autoRenew=true) {
  return this.addOpts({autoRenew})
}

/**
 * Byte Length
 * RSA encryption bytelength.
 * @param  {Number} bytes Number of bytes.
 * @return {Function} Instance of addOpts.
 */
SSL.prototype.byteLength = function (bytes=2048) {
  return this.addOpts({bytes})
}

SSL.prototype.middleware = function () {
  return (this.provider && this.provider.middleware) ? this.provider.middleware() : this.skipMiddleware()
}

SSL.prototype.skipMiddleware = function () {
  return (req, res, next) => { next() }
}

SSL.prototype.server = function (app) {
  return this.addOpts({app})
}

SSL.prototype.checkAndCreateDirectory = function () {
  if (
    this.args.createDir &&
    (typeof this.args.dir === 'string')
  ) {
    util.createDirectory(this.args.dir)
  }
}

SSL.prototype.getPort = function (defaultPort) {
  /* Without a valid key and certificate, we must be on port 80
   * For certificate authorities to validate the domain.
  */
  return (this.getKey() && this.getCertificate()) ? 443 : 80
}

SSL.prototype.getKey = function () {
  return this.getFile('domain.key') || null // Or get key
}

SSL.prototype.getCertificate = function () {
  return this.getFile('chained.pem') || null // Or get cert
}

SSL.prototype.dirExists = function () {
  try {
    return fs.lstatSync(this.args.dir)
      .isDirectory()
  } catch (e) {
    return false
  }
}

SSL.prototype.fileExists = function (file) {
  try {
    return fs.lstatSync(`${this.args.dir}/${file}`)
      .isFile()
  } catch (e) {
    return false
  }
}

SSL.prototype.getFile = function (file) {
  if (!(typeof this.args.dir === 'string') || !this.fileExists(file)) return
  return fs.readFileSync(`${this.args.dir}/${file}`)
}

/**
 * Create
 * Create the certificate.
 * @return {Promise} Callback after async queued tasks resolve.
 */
SSL.prototype.create = function () {

  if (!this.args.domains) {
    // TO-DO: Handle error
    return this
  }

  // If we have a key and certificate, skip create.
  if (this.getKey() && this.getCertificate()) return this

  // Create the cert directory if permission is granted.
  this.checkAndCreateDirectory()
  this.provider = new this.args.Provider()
  this.provider.create(this.args)

    // .then(res => console.log(res))
  return this
}

SSL.prototype.renew = function () {
  // Handle renewal
  // this.provider.create(this.args)
}

module.exports = function () {
  return new SSL()
}

module.exports.SSL = SSL