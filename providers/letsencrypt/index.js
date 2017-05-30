'use strict'

const Constants = require('./constants')
const LetsEncryptAPI = require('./letsencryptapi')

class LetsEncrypt extends LetsEncryptAPI {

  /**
   * @constructor
   * @param  {Boolean} options.agreeTos Agree to Terms of Service.
   * @param  {String}  options.server   LE server. one of [staging, live]
   * @return {[type]}                   [description]
   */
  constructor (opts) {
    super()
    this.opts = opts
    this.docUrl = opts.env
    return this
  }

  create () {
    return this.updateDirectoryList()
      .then(() => {
        this.register()
          .then(resp => {
            // console.log(resp)
            this.fetchCert()
              .then(certResp => console.log(certResp))
          })
      })
      // .then(() => this.fetchCert())
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