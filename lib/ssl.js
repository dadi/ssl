'use strict'

const util = require('./util')
const providers = require('../providers')

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
 * Store In
 * Set options for the directory to store the certificates.
 * @param  {String} dir Where we'll store the certificates.
 * @param  {Boolean} createDir Do we have permission to create the directory?
 * @return {SSL} SSL module. (this)
 */
SSL.prototype.storeIn = function (dir='~/dadi/ssl/', createDir=true) {
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
      return this.addOpts({provider: providers.le})
      break
    default:
      return this.addOpts({provider: providers.le})
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
 * Create
 * Create the certificate.
 * @return {Promise} Callback after async queued tasks resolve.
 */
SSL.prototype.create = function () {
  let queue = [] // Async tasks

  if (!this.args.domains) {
    // TO-DO: Handle error
    return
  }

  // Create the cert directory if permission is granted.
  if (
    this.args.createDir &&
    (typeof this.args.dir === 'string')
  ) {
    queue.push(util.createDirectory(this.args.dir))
  }
  // queue.push(utils.getEnv)

  return Promise.all(queue)
}

module.exports = function () {
  return new SSL()
}

module.exports.SSL = SSL