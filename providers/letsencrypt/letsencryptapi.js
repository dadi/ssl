'use strict'

const Constants = require('./constants')
const fetch = require('node-fetch')
const util = require('../../lib/util')

class LetsEncryptAPI {

  constructor () {
    this.challenges = {} // key>value challenge url responses
    this.challengeWait = 2000 // How long we wait to check that a challenge was successful
  }

  updateDirectoryList () {
    return this.getJson(this.request(this.docUrl))
      .then(dirs => this.directories = dirs)
  }

  register () {
    this.key = util.rsa(this.opts.bytes)
    return this.generateSignedRequest({
      resource: "new-reg",
      agreement: 'https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf',
      contact: [`mailto:${this.opts.email}`]
    })
    .then(body => this.getJson(
      this.request(this.directories.registration, {method:'POST', body: JSON.stringify(body)}))
    )
  }

  challengeAll () {
    return Promise.all(this.domainChallenges())
  }

  /**
   * Domain challenges
   * @return {[type]} [description]
   */
  domainChallenges () {
    return this.opts.domains.map(domain => this.challenge(domain))
  }

  challenge (domain) {
    return this.generateSignedRequest({
      resource: "new-authz",
      identifier: {
        type: 'dns',
        value: domain
      }
    })
    .then(body => this.getJson(
      this.request(this.directories.authz, {method:'POST', body: JSON.stringify(body)}))
    )
    .then(json => this.challengeMiddleware(json))
  }

  challengeMiddleware (resp) {
    const httpChallenge = this.getHTTPChallenge(resp)

    if (!httpChallenge) return

    this.challenges[httpChallenge.token] = this.generateChallengeResponse(httpChallenge)

    this.requestChallengeCheck(httpChallenge)
      .then(resp => {
        console.log('Acceptance check', resp.status)
        setTimeout(() => {
          console.log('CHECK CHAPPENGE', httpChallenge.uri)
          this.checkChallengeStatus(httpChallenge.uri)
            .then(resp => {
              console.log(`Challenge status: ${resp.status}`)
              if (resp.status === Constants.IS_VALID) {
                // return this.requestCertificate()
                //   .then(resp => console.log(resp))
                //   .catch(err => console.log(err))
              } else {
                console.log(resp)
              }
            })
        }, this.challengeWait)
      })
  }

  getHTTPChallenge (resp) {
    return resp.challenges
      .find(challenge => challenge.type === 'http-01')
  }

  requestCertificate () {
    const key = util.rsaKeyPair(this.opts.bytes)
    const csr = util.b64enc(util.generateCSR(key, this.opts.domains))

    return this.generateSignedRequest({
        resource: 'new-cert',
        csr: csr
    })
    .then(body => this.getJson(
      this.request(this.directories.cert, {method:'POST', body: JSON.stringify(body)}))
    )
  }

  requestChallengeCheck (httpChallenge) {
    return this.generateSignedRequest({
        resource: 'challenge',
        keyAuthorization: this.challenges[httpChallenge.token]
    })
    .then(body => this.getJson(
      this.request(httpChallenge.uri, {method:'POST', body: JSON.stringify(body)}))
    )
  }

  generateChallengeResponse (httpChallenge) {
    const header = this.generateHeader()
   
    let thumbprint = util.b64enc(util.toBuffer(util.JSONDigest(header.jwk)))
    return `${httpChallenge.token}.${thumbprint}`
  }

  checkChallengeStatus (url) {
    return this.getJson(this.request(url))
  }

  generateSignedRequest (payload) {
    let body = {}
    return this.getHeader(this.request(this.docUrl, {method: 'HEAD'}), 'replay-nonce')
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
      let keyMatch = Object.keys(this.challenges)
      .find(token => req.url === `/.well-known/acme-challenge/${token}`)

      if (keyMatch) {
        res.write(this.challenges[keyMatch])
        res.end()
      } else {
        return next()
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
   * Request
   * @return {[type]} [description]
   */
  request (url, options={method: 'GET'}) {
    return fetch(url, options)
  }

  getHeader (req, header) {
    return req.then(res => res.headers.get('replay-nonce'))
  }

  getJson (req) {
    return req.then(res => res.json())
  }
}

module.exports = LetsEncryptAPI