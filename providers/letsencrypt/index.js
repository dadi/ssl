'use strict'

const Constants = require('./constants')
const LetsEncryptAPI = require('./letsencryptapi')
const util = require('../../lib/util')

class LetsEncrypt extends LetsEncryptAPI {

  /**
   * @constructor
   * @param  {Boolean} options.agreeTos Agree to Terms of Service.
   * @param  {String}  options.server   LE server. one of [staging, live]
   * @return {Class} LetsEncrypt class instance.
   */
  constructor (opts) {
    super()
    this.opts = opts
    this.errors = []
    this.docUrl = opts.env
    this.renewalOverlapDays = 10

    return this
  }

  create () {
    this.errors = []

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
                  console.log('All challenges active')
                })
              }
          })
      })
  }

  addError (error) {
    console.log(error)
    this.errors.push(error)
  }

  watch () {
    const cert = util.parseCert(`${this.opts.dir}/chained.pem`)
    const timeLeft = util.timeLeft(cert.notAfter, this.renewalOverlapDays)
    console.log('Watch', cert.notAfter)

    util.delay(timeLeft.ms)
      .then(() => this.create())
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