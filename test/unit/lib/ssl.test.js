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
    it('should not append ssl arguements when email is not a string', () => {
      expect(() => {
        ssl.registerTo(false)
      }).toThrowError('Invalid email. Must be a string')
    })

    it('should not append ssl arguements when email is invalid', () => {
      expect(() => {
        ssl.registerTo('foo')
      }).toThrowError('Invalid email address')
    })

    it('should append email to ssl arguements', () => {
      ssl.registerTo('foo@bar.com')
      return expect(ssl.args).toMatchObject({email: 'foo@bar.com'})
    })
  })
  describe('autoRenew', () => {
    it('should not append ssl arguements when autoRenew is not a boolean', () => {
      expect(() => {
        ssl.autoRenew('foo')
      }).toThrowError('Invalid autoRenew. Must be a boolean')
    })

    it('should append autoRenew to ssl arguements', () => {
      ssl.autoRenew(true)
      return expect(ssl.args).toMatchObject({autoRenew: expect.any(Boolean)})
    })
  })
  describe('byteLength', () => {
    it('should not append ssl arguements when bytes is not valid', () => {
      expect(() => {
        ssl.byteLength('foo')
      }).toThrowError('Invalid bytelength. Must be a number >= 512')
    })

    it('should append bytes to ssl arguements', () => {
      ssl.byteLength(512)
      return expect(ssl.args).toMatchObject({bytes: expect.any(Number)})
    })
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
// certificateDir √
// useEnvironment √
// provider √
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