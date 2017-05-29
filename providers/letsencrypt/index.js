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
    this.dirUrl = opts.env
    return this
  }

  create () {
    return this.updateAPIList()
      .then(() => {
        this.generateBody()
          .then(body => this.fetchCert(body).then(res => console.log(res)))
      })
      // .then(() => this.fetchCert())
  }

  get dirUrl () {
    return this._dirUrl
  }

  set dirUrl (args) {
    this._dirUrl = (args === 'stage')
     ? Constants.STAGE_API_DIRECTORY 
     : Constants.PRODUCTION_API_DIRECTORY
  }


}

module.exports = LetsEncrypt