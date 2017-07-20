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
      ssl.useDomains(['somedomain.tech'])
      return expect(ssl.args).toMatchObject({domains: ['somedomain.tech']})
    })
  })

  describe('certificateDir', () => {
    it('should not append ssl arguements when certificate directory is invalid', () => {
      expect(() => {
        ssl.certificateDir(false)
      }).toThrowError('Invalid directory. Must be a string')
    })

    it('should append directory to ssl arguements', () => {
      ssl.certificateDir('/path/to/ssl')
      return expect(ssl.args).toMatchObject({dir: '/path/to/ssl', createDir: true})
    })
  })
  describe('useEnvironment', () => {
    it('should not append ssl arguements when environment is invalid', () => {
      expect(() => {
        ssl.useEnvironment('foo')
      }).toThrowError('Invalid environment. Must be staging or production')
    })

    it('should append environment to ssl arguements', () => {
      ssl.useEnvironment('staging')
      return expect(ssl.args).toMatchObject({env: 'staging'})
    })
  })
  describe('provider', () => {
    it('should not append provider when arguement is invalid', () => {
      expect(() => {
        ssl.provider(false)
      }).toThrowError('Invalid provider. Must be a string')
    })

    it('should append provider to ssl arguements', () => {
      ssl.provider('letsencrypt')
      return expect(ssl.args).toMatchObject({Provider: expect.any(Function)})
    })
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