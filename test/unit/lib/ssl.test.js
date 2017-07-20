const SSL = require(`${__dirname}/../../../lib/ssl`)

let ssl

jest.mock('x509', () => {
  return () => {
    return {
      parseCert: () => {}
    }
  }
})

beforeEach(() => {
  ssl = new SSL()
})

describe('SSL', () => {
  it('should export Object', () => {
    expect(ssl).toBeInstanceOf(Object)
  })

  describe('addOpts', () => {
    it('should not append ssl arguements when arguement is invalid', () => {
      ssl.addOpts()
      return expect(ssl.args).toMatchObject({})
    })

    it('should append ssl arguements', () => {
      ssl.addOpts({foo: 'bar'})
      return expect(ssl.args).toMatchObject({foo: 'bar'})
    })
  })

  describe('useDomains', () => {
    it('should not append ssl arguements when domains are invalid', () => {
      expect(() => {
        ssl.useDomains('somedomain.tech')
      }).toThrowError('Invalid domains. Must be an array')
    })

    it('should append domains to ssl arguements', () => {
      ssl.useDomains(['somdomain.tech'])
      return expect(ssl.args).toMatchObject({domains: ['somedomain.tech']})
    })
  })
  describe('certificateDir', () => {

  })
  describe('useEnvironment', () => {

  })
  describe('provider', () => {

  })
  describe('registerTo', () => {

  })
  describe('autoRenew', () => {

  })
  describe('byteLength', () => {

  })
  describe('checkAndCreateDirectory', () => {

  })
  describe('getPort', () => {

  })
  describe('getKey', () => {

  })
  describe('getCertificate', () => {

  })
  describe('dirExists', () => {

  })
  describe('fileExists', () => {

  })
  describe('getFile', () => {

  })
  describe('useListeningServer', () => {

  })
  describe('useSecureServer', () => {

  })
  describe('addMiddleware', () => {

  })
  describe('start', () => {

  })
})

// addOpts √
// useDomains √
// certificateDir
// useEnvironment
// provider
// registerTo
// autoRenew
// byteLength
// checkAndCreateDirectory
// getPort
// getKey
// getCertificate
// dirExists
// fileExists
// getFile
// useListeningServer
// useSecureServer
// addMiddleware
// start