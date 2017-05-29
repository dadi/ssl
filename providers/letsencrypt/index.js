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
      this.agreeTos = opts.agreeTos
      this.dirUrl = opts.server

      return this
    }

    cert () {
      return this.updateAPIList()
        .then(() => this.fetchCert())
    }

    // Getters and Setters

    /**
     * [agreeTos description]
     * @return {[type]} [description]
     */
    get agreeTos () {
      return this._agreeTos
    }
    /**
     * [agreeTos description]
     * @param  {[type]} args [description]
     * @return {[type]}      [description]
     */
    set agreeTos (args) {
      this._agreeTos = args !== false
    }
    /**
     * [dirUrl description]
     * @return {[type]} [description]
     */
    get dirUrl () {
      return this._dirUrl
    }
    /**
     * [dirUrl description]
     * @param  {[type]} args [description]
     * @return {[type]}      [description]
     */
    set dirUrl (args) {
      this._dirUrl = (args === 'stage')
       ? Constants.STAGE_API_DIRECTORY 
       : Constants.PRODUCTION_API_DIRECTORY
    }


}

module.exports = LetsEncrypt