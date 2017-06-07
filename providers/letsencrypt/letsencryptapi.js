'use strict'

const Constants = require('./constants')
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
            body: JSON.stringify(body, null, 2),
          })
          .then(resp => resp.json())
    })
  }

  // challengeAll () {
  //   return Promise.all(this.domainChallenges())
  // }

  /**
   * Domain challenges
   * @return {[type]} [description]
   */
  // domainChallenges () {
  //   return this.opts.domains.map(domain => challenge(domain))
  // }

  // domainChallenge () {
  //   return challenge(domain)
  // }

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
            body: JSON.stringify(body),
          })
          .then(resp => resp.json().then(json => {
            // Set challenge token for use with middleware.
            const httpChallenge = json.challenges
              .find(challenge => challenge.type === 'http-01')

            if (httpChallenge) {
              console.log("current status", httpChallenge.status)

              // // Temporary check to config challenge status
              this.challengeTokenUrl = `/.well-known/acme-challenge/${httpChallenge.token}`

              this.challengeResponse = this.generateChallengeResponse(httpChallenge)

              this.requestChallengeCheck(httpChallenge.uri)
                .then(resp => {
                  console.log('Acceptance check', resp.status)

                  // Delay acceptance status check
                  setTimeout(() => {
                    this.checkChallengeStatus(httpChallenge.uri)
                      .then(resp => {
                        if (resp.status === Constants.IS_VALID) {
                          console.log(`Challenge status: ${resp.status}`)
                          return this.requestCertificate()
                            .then(resp => console.log(resp))
                            .catch(err => console.log(err))
                        }
                      })
                    }, 2000)
                })
            }
          }))
    })
  }

  requestCertificate () {
    const key = util.rsaKeyPair(this.opts.bytes)
    const csr = util.b64enc(util.generateCSR(key, this.opts.domains))

    return this.generateSignedRequest({
        resource: 'new-cert',
        csr: csr
    }).then(body => {
      return fetch(this.directories.cert, {
        method: 'POST',
        body: JSON.stringify(body)
      }).then(resp => resp.json())
    })
  }

  requestChallengeCheck (url) {
    return this.generateSignedRequest({
        resource: 'challenge',
        keyAuthorization: this.challengeResponse
    }).then(body => {
      return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body)
      }).then(resp => resp.json())
    })
  }

  generateChallengeResponse (httpChallenge) {
    const header = this.generateHeader()
   
    let thumbprint = util.b64enc(util.toBuffer(util.JSONDigest(header.jwk)))
    return `${httpChallenge.token}.${thumbprint}`
  }

  checkChallengeStatus (url) {
    return this.requestJSON(url)
  }

  generateSignedRequest (payload) {
    let body = {}

    return this.fetchNonce()
      .then(nonce => {
        const payload_buffer = util.toBuffer(JSON.stringify(payload))
        body.payload = util.b64enc(payload_buffer)
        // Header
        body.header = this.generateHeader()

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

  middleware () {
    return (req, res, next) => {
      if (this.challengeTokenUrl) {
        if (req.url === this.challengeTokenUrl) {
          console.log('MATCH FOUND')
          res.write(this.challengeResponse)
          res.end()
        } else {
          return next()
        }
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
      .then(res => res.json())
  }
}

module.exports = LetsEncryptAPI