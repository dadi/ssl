'use strict'

const fetch = require('node-fetch')
const util = require('../../lib/util')

class LetsEncryptAPI {

  constructor () {}

  updateDirectoryList () {
    return this.requestJSON(this.docUrl)
      .then(dirs => this.directories = dirs)
  }

  register () {
    this.key = util.rsa(this.opts.bytes)
    return this.generateSignedRequest({
      resource: "new-reg",
      agreement: 'https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf',
      contact: [`mailto:${this.opts.email}`]
    }).then(body => {

      return fetch(this.directories.registration, {
            method: 'POST',
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify(body, null, 2),
          })
          .then(resp => resp.json())
    })
  }

  challenge () {
    return this.generateSignedRequest({
      resource: "new-authz",
      identifier: {
        type: 'dns',
        value: this.opts.domains[0]
      }
    }).then(body => {
      return fetch(this.directories.authz, {
            method: 'POST',
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify(body, null, 2),
          })
          .then(resp => resp.json())
    })
  }

  fetchCert () {

    // return this.generateSignedRequest({
    //   resource: 'new-cert'
    // }).then(body => {
    //   return fetch(this.directories.cert, {
    //         method: 'POST',
    //         body: JSON.stringify(body),
    //       })
    //       .then(resp => resp.json())
    // })
  }

  generateCSR () {
   
    // csr = OpenSSL::X509::Request.new
    // csr.subject = OpenSSL::X509::Name.new([['CN', 'le.alexpeattie.com']])
    // csr.public_key = domain_key.public_key
    // csr.sign domain_key, hash_algo
  }

  generateSignedRequest (payload) {
    let body = {}

    return this.fetchNonce()
      .then(nonce => {
        const payload_buffer = util.toBuffer(JSON.stringify(payload))
        body.payload = util.b64enc(payload_buffer)
        // Header
        body.header = this.generateHeader(this.key)

        const bodyString = JSON.stringify(Object.assign({}, body.header, {nonce}))
        body.protected = util.b64enc(util.toBuffer(bodyString))

        const buffer = util.toBuffer(`${body.protected}.${body.payload}`)
        const signature = this.key.hashAndSign('sha256', buffer)

        body.signature = util.b64enc(signature)
        body.nonce = nonce

        return body
      })
  }

  generateHeader () {

    return {
      alg: 'RS256',
      jwk: {
        e: util.b64enc(this.key.getExponent()),
        kty: 'RSA',
        n: util.b64enc(this.key.getModulus())
      }
    }
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
      authz: dirs['new-authz'],
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
    return fetch(this.docUrl, {
      method: 'HEAD'
    })
      .then(res => res.headers.get('replay-nonce'))
  }

  /**
   * Request
   * @return {[type]} [description]
   */
  requestJSON (url) {
    return fetch(url)
      .then(res => {
        console.log(res.headers)
        return res.json()
      })
  }



}

module.exports = LetsEncryptAPI