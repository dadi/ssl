'use strict'

const Constants = require('./constants')
const LetsEncryptAPI = require('./letsencryptapi')
const util = require('../../lib/util')
const progress = require('progress')

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
    this.dayInMiliseconds = (1000 * 60 * 60 * 24)

    return this
  }

  create () {
    this.errors = []
    this.bar = new progress('[:bar]', {
      total: 10,
      complete: '=',
      incomplete: ' ',
      width: 20
    })
    this.bar.interrupt('Creating certificate...')

    this.updateDirectoryList()
      .then(() => {
        this.register()
          .then(resp => {
            if (resp.status) {
              this.addError(resp)
            } 
            this.challengeAll()
              .then(resp => {
                this.bar.complete()
              })
          })
      })
  }

  addError (error) {
    this.bar.interrupt(error.detail ? error.detail : error)
    this.bar.terminate()
    this.errors.push(error)
  }

  watch () {
    // Force check on launch
    this.checkAndRenew()

    setInterval(() => {
      this.checkAndRenew()
    }, this.dayInMiliseconds)
  }

  checkAndRenew () {
    const cert = util.parseCert(`${this.opts.dir}/chained.pem`)
    const timeLeft = util.timeLeft(cert.notAfter, this.renewalOverlapDays)

    if (timeLeft.days < this.renewalOverlapDays) {
      this.create()
    }
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