'use strict'

const util = require('./util')

const SSL = function () {
  this.args = {}
}

/**
 * Use domains
 * Set a list of required domains
 * @param  {Array} domains Domains to be applied to certificate.
 * @return {SSL} SSL module. (this)
 */
SSL.prototype.useDomains = function (domains=[]) {
  Object.assign(this.args, {domains})
  return this
}

/**
 * Store In
 * Set options for the directory to store the certificates.
 * @param  {String} dir Where we'll store the certificates.
 * @param  {Boolean} createDir Do we have permission to create the directory?
 * @return {SSL} SSL module. (this)
 */
SSL.prototype.storeIn = function (dir='~/dadi/ssl/', createDir=true) {
  this.args = Object.assign(this.args, {dir, createDir})
  return this
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

  // Create the cert directory if permission is granted
  if (
    this.args.createDir &&
    (typeof this.args.dir === 'string')
  ) {
    queue.push(utils.createDirectory(this.args.dir))
  }

  return Promise.all(queue)
}

module.exports = function () {
  return new SSL()
}

module.exports.SSL = SSL