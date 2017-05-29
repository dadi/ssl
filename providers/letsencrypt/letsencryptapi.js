'use strict'

const fetch = require('node-fetch')
const util = require('../../lib/util')

class LetsEncryptAPI {

  constructor () {}

  updateAPIList () {
    return this.requestDirectories()
      .then(dirs => this.directories = dirs)
  }

  fetchCert () {

    let body = {
      resource: 'new-reg'
    }
    let payload = util.b64dec('payload').toString()
    return fetch(this.directories.cert, {
      method: 'POST',
      // body: payload,
      headers: {
        alg: 'RS256',
        jwk: {
          kty: 'RSA'
        }
      }
    })
    .then(resp => resp.json())
  }

  /**
   * Get Directories.
   * @return {Object} List of API directories.
   */
  get directories () {
    return this._directories
  }

  /**
   * Set Directories
   * @param  {Object} dirs API directories.
   */
  set directories (dirs) {
    this._directories = {
      keyChange: dirs['key-change'],
      auth: dirs['new-authz'],
      cert: dirs['new-cert'],
      registration: dirs['new-reg'],
      revoke: dirs['revoke-cert']
    }
  }

  requestDirectories () {
    return fetch(this.dirUrl)
      .then(resp => resp.json())
  }



}

module.exports = LetsEncryptAPI