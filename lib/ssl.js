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
  if (!Array.isArray(domains)) throw new Error('Invalid domains. Must be an array')
  return this.addOpts({domains})
}

/**
 * Set certificate directory
 * Set options for the directory to store the certificates.
 * @param  {String} dir Where we'll store the certificates.
 * @param  {Boolean} createDir Do we have permission to create the directory?
 * @return {SSL} SSL module. (this)
 */
SSL.prototype.certificateDir = function (dir='~/dadi/ssl/', createDir=true) {
  if (typeof dir !== 'string') throw new Error('Invalid directory. Must be a string')
  return this.addOpts({dir, createDir})
}

/**
 * Use Environment
 * Select the letsencrypt environemnt.
 * @param  {String} env Environment name.
 * @return {Function} Instance of addOpts.
 */
SSL.prototype.useEnvironment = function (env='production') {
  if (env !== 'staging' && env !== 'production') throw new Error('Invalid environment. Must be staging or production')
  return this.addOpts({env})
}

/**
 * Provider
 * Select the certificate authority.
 * @param  {String} provider Friendly provider name.
 * @return {Function} Instance of addOpts.
 */
SSL.prototype.provider = function (provider='letsencrypt') {
  if (typeof provider !== 'string') throw new Error('Invalid provider. Must be a string')
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
  if (typeof email !== 'string') throw new Error('Invalid email. Must be a string')
  if (!(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email))) throw new Error('Invalid email address')
  return this.addOpts({email})
}

/**
 * Auto Renew
 * Whether the certificate will be renewed shortly before expiring.
 * @param  {Boolean} autoRenew Yes/No
 * @return {Function} Instance of addOpts.
 */
SSL.prototype.autoRenew = function (autoRenew=true) {
  if (typeof autoRenew !== 'boolean') throw new Error('Invalid autoRenew. Must be a boolean')
  return this.addOpts({autoRenew})
}

/**
 * Byte Length
 * RSA encryption bytelength.
 * @param  {Number} bytes Number of bytes.
 * @return {Function} Instance of addOpts.
 */
SSL.prototype.byteLength = function (bytes=2048) {
  if (isNaN(bytes) || bytes < 512) {
    throw new Error('Invalid bytelength. Must be a number >= 512')
  }
  return this.addOpts({bytes})
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

SSL.prototype.useListeningServer = function (listeningServer) {
  return this.addOpts({listeningServer})
}

SSL.prototype.useSecureServer = function (secureServer) {
  return this.addOpts({secureServer})
}

SSL.prototype.addMiddleware = function () {
  this.args.listeningServer.use(this.provider.middleware())
}

/**
 * Create
 * Create the certificate.
 * @return {Promise} Callback after async queued tasks resolve.
 */
SSL.prototype.start = function () {
  this.provider = new this.args.Provider(this.args)

  if (!this.args.listeningServer) {
    return this
  }
  this.addMiddleware()

  // this.args.listeningServer.close()
  // Create the cert directory if permission is granted.
  this.checkAndCreateDirectory()

  const keyFile = this.getKey()
  const cert = this.getCertificate()

  if (!this.args.domains) {
    // TO-DO: Handle error
    return this
  }

  // If we have a key and certificate, skip create.
  if (keyFile && cert) {
    if (this.args.autoRenew) {
      this.provider.watch()
    }
    return this
  }
  this.provider.create()

  return this
}

module.exports = function () {
  return new SSL()
}

module.exports.SSL = SSL