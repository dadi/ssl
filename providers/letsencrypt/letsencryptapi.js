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

    // let body = {
    //   resource: 'new-reg'
    // }
    // let payload = util.b64dec('payload').toString()
    // return fetch(this.directories.cert, {
    //   method: 'POST',
    //   // body: payload,
    //   headers: {
    //     alg: 'RS256',
    //     jwk: {
    //       kty: 'RSA'
    //     }
    //   }
    // })
    // .then(resp => resp.json())
  }


  generateBody () {
    const key = util.rsa()
    const buffer = util.toBinaryString(JSON.stringify({resource: "new-reg"}))
    const payload = util.b64enc(buffer)

    const buffer_e = util.toBinaryString(key.exportKey('components').e.toString())
    const buffer_n = util.toBinaryString(key.exportKey('components').n)
    const header = {
      alg: 'RS256',
      jwk: {
        e: util.b64enc(
          buffer_e
        ),
        kty: 'RSA',
        n: util.b64enc(
          buffer_n
        ),
      }
    }
    this.fetchNonce().then(nonce => {
      console.log(nonce, header)
    })
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

  /**
   * Fetch Nonce
   * With a HEAD request, fetch a single use replay-nonce for signing the request.
   * @return {String} replay-nonce
   */
  fetchNonce () {
    return fetch(this.dirUrl, {
      method: 'HEAD'
    })
      .then(res => res.headers.get('replay-nonce'))
  }

  /**
   * Fetch directories
   * @return {[type]} [description]
   */
  requestDirectories () {
    return fetch(this.dirUrl)
      .then(res => res.json())
  }



}

module.exports = LetsEncryptAPI