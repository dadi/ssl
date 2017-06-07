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
        console.log('Start registration')
        this.register()
          .then(resp => {
            if (resp.status) {
              console.log(`Error: ${resp.detail}`)
            } else {
              console.log(`Registration status: ${resp.Status}.\nStarting challenge`)
              this.challengeAll()
                .then(resp => {
                  console.log('done')
                    // console.log('challenge URL', this.challengeTokenUrl)
                })
              }
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