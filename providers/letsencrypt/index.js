'use strict'

const Constants = require('./constants')
const LetsEncryptAPI = require('./letsencryptapi')

class LetsEncrypt extends LetsEncryptAPI {

  /**
   * @constructor
   * @param  {Boolean} options.agreeTos Agree to Terms of Service.
   * @param  {String}  options.server   LE server. one of [staging, live]
   * @return {Class} LetsEncrypt class instance.
   */
  constructor (opts) {
    super()
    return this
  }

  create (opts) {
    this.opts = opts
    this.docUrl = opts.env

    this.updateDirectoryList()
      .then(() => {
        this.register()
          .then(resp => {
            this.challenge()
              .then(resp => {
                // Set challenge token for use with middleware.
                const httpChallenge = resp.challenges
                  .find(challenge => challenge.type === 'http-01')

                if (httpChallenge) {
                  this.challengeTokenUrl = `/.well-known/acme-challenge/${httpChallenge.token}`
                }
              })
          })
      })
  }

  get docUrl () {
    return this._docUrl
  }

  set docUrl (args) {
    this._docUrl = (args === 'stage')
     ? Constants.STAGE_API_DIRECTORY 
     : Constants.PRODUCTION_API_DIRECTORY
  }


}

module.exports = LetsEncrypt