'use strict'

const Constants = require('./constants')
const fetch = require('node-fetch')
const util = require('../../lib/util')
const fs = require('fs')

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
      resource: 'new-reg',
      agreement: 'https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf',
      contact: [`mailto:${this.opts.email}`]
    })
    .then(body => this.getJson(
      this.request(this.directories.registration, {method: 'POST', body: JSON.stringify(body)}))
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
    this.updateBar('Creating challenge')
    return this.generateSignedRequest({
      resource: 'new-authz',
      identifier: {
        type: 'dns',
        value: domain
      }
    })
    .then(body => this.getJson(
      this.request(this.directories.authz, {method: 'POST', body: JSON.stringify(body)}))
    )
    .then(json => this.challengeMiddleware(json))
  }

  challengeMiddleware (resp) {
    this.updateBar('Creating challenge middleware')
    const httpChallenge = this.getHTTPChallenge(resp)

    if (!httpChallenge) return

    this.challenges[httpChallenge.token] = this.generateChallengeResponse(httpChallenge)

    return this.requestChallengeCheck(httpChallenge)
      .then(resp => {
        return util.delay(this.challengeWait)
          .then(() => {
            return this.checkStatus(resp, httpChallenge)
          })
      })
  }

  checkStatus (resp, httpChallenge) {
    return this.checkChallengeStatus(httpChallenge.uri)
      .then(resp => {
        if (resp.status === Constants.IS_VALID) {
          return this.requestCertificate()
            .then(chain => this.storeChainFile(chain))
        } else {
          this.addError(resp)
          // throw new Error(resp)
        }
      })
  }

  getHTTPChallenge (resp) {
    this.updateBar('Getting HTTP challenge from response')
    if (resp.status === 403) {
      this.addError(resp)
      // throw new Error(resp)
    }
    return resp.challenges
      .find(challenge => challenge.type === 'http-01')
  }

  storeChainFile (chain) {
    this.updateBar('Storing chain file')
    if (chain) {
      this.writeFile(`${chain.cert}\n${chain.issuerCert}`, `${this.opts.dir}/chained.pem`)
    } else {
      this.addError({err: 'Certificate chain missing'})
      // throw new Error('Certificate chain missing')
    }
    this.updateBar('Complete')
    // Start watching for renewal
    if (this.opts.autoRenew) {
      this.updateBar('Adding certificate watcher')
      this.watch()
    }
    this.restartServer()
  }

  requestCertificate () {
    return this.newCertificate()
      .then(res => {
        if (!res.headers.get('location')) {
          res.json()
            .then(resp => {
              this.addError(resp)
              // throw new Error(resp)
            })
        } else {
          return this.getFile(res.headers.get('location'))
            .then(certificate => {
              return this.getFile(this.toIssuerCert(res.headers.get('link')))
                .then(issuerCert => {
                  return {
                    cert: util.toPEM(certificate),
                    issuerCert: util.toPEM(issuerCert)
                  }
                })
            })
        }
      })
  }

  newCertificate () {
    const key = util.rsaKeyPair(this.opts.bytes)
    this.writeFile(`${key.privateKeyPem}\n${key.publicKeyPem}`, `${this.opts.dir}/domain.key`)
    const csr = util.b64enc(util.generateCSR(key, this.opts.domains))

    return this.generateSignedRequest({
      resource: 'new-cert',
      csr: csr
    })
    .then(body =>
      this.request(this.directories.newCert, {
        method: 'POST',
        body: JSON.stringify(body)
      }))
  }

  toIssuerCert (links) {
    const match = /.*<(.*)>;rel="up".*/.exec(links)
    return match[1]
  }

  writeFile (fileContent, filepath) {
    fs.writeFile(filepath, fileContent, err => {
      if (err) this.addError(err)
      // if (err) throw new Error(err)
    })
  }

  getFile (location) {
    return this.request(location)
      .then(res => res.buffer())
  }

  requestChallengeCheck (httpChallenge) {
    return this.generateSignedRequest({
      resource: 'challenge',
      keyAuthorization: this.challenges[httpChallenge.token]
    })
    .then(body => this.getJson(
      this.request(httpChallenge.uri, {method: 'POST', body: JSON.stringify(body)}))
    )
  }

  generateChallengeResponse (httpChallenge) {
    const header = this.generateHeader()
    const digest = util.JSONDigest(header.jwk)
    const buf = util.toBuffer(digest)
    const thumbprint = util.b64enc(buf)

    return `${httpChallenge.token}.${thumbprint}`
  }

  checkChallengeStatus (url) {
    this.updateBar('Check challenge status')
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

  restartServer () {
    if (this.opts.restartServer) {
      this.updateBar('Restarting server')
      this.opts.restartServer()
    }
    if (this.bar) {
      this.bar.terminate()
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
      newCert: dirs['new-cert'],
      registration: dirs['new-reg'],
      revoke: dirs['revoke-cert']
    }
  }

  /**
   * Request
   * @return {[type]} [description]
   */
  request (url, options = {method: 'GET'}) {
    return fetch(url, options)
  }

  getHeader (req, header) {
    return req.then(res => res.headers.get('replay-nonce'))
  }

  getText (req) {
    return req.then(res => res.text())
  }
  getJson (req) {
    return req.then(res => res.json())
  }
}

module.exports = LetsEncryptAPI
