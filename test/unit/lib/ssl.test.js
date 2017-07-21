const SSL = require(`${__dirname}/../../../lib/ssl`)
const nock = require('nock')

let ssl
let originalArgs

const use = () => {

}

jest.mock('mkdirp', (path) => {
  return dir => {
    return
  }
})

jest.mock('x509', () => {
  return () => {
    return {
      parseCert: () => {}
    }
  }
})

beforeEach(() => {
  ssl = new SSL()
  originalArgs = Object.assign({}, ssl.args)
})

describe('SSL', () => {
  it('should export Object', () => {
    expect(ssl).toBeInstanceOf(Object)
  })

  describe('addOpts', () => {
    it('should not append ssl arguements when arguement is invalid', () => {
      ssl.addOpts()
      expect(ssl.args).toMatchObject(originalArgs)
    })

    it('should append ssl arguements', () => {
      ssl.addOpts({foo: 'bar'})
      expect(ssl.args).toMatchObject({foo: 'bar'})
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
      expect(ssl.args).toMatchObject({domains: ['somedomain.tech']})
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
      expect(ssl.args).toMatchObject({dir: '/path/to/ssl', createDir: true})
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
      expect(ssl.args).toMatchObject({env: 'staging'})
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
      expect(ssl.args).toMatchObject({Provider: expect.any(Function)})
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
      expect(ssl.args).toMatchObject({email: 'foo@bar.com'})
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
      expect(ssl.args).toMatchObject({autoRenew: expect.any(Boolean)})
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
      expect(ssl.args).toMatchObject({bytes: expect.any(Number)})
    })
  })

  describe('checkAndCreateDirectory', () => {
    it('should return a Promise if no directory is not previously specified', () => {
      ssl.certificateDir(ssl.args.dir)
      expect(ssl.checkAndCreateDirectory()).toBeInstanceOf(Promise)
    })

    it('should return undefined if `createDir` is false', () => {
      ssl.certificateDir(null, false)
      expect(ssl.checkAndCreateDirectory()).toBeUndefined()
    })
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
    it('should throw an error if the listening server is not running on correct port (80)', () => {
      const listeningServer = nock(`http://127.0.0.1:81`)
      expect(() => {
        ssl.useListeningServer(listeningServer)
      }).toThrowError('Invalid listening server. Must be server running on port 80')
    })

    it('should append ssl.args with listening server when server is running on correct port (80)', () => {
      const listeningServer = nock(`http://127.0.0.1`)
      ssl.useListeningServer(listeningServer)
      expect(ssl.args.listeningServer).toMatchObject(listeningServer)
    })

    it('should throw an error when listening server is not defined', () => {
      expect(() => {
        ssl.useListeningServer()
      }).toThrowError('Invalid listening server. Must be server running on port 80')
    })
  })

  describe('useSecureServer', () => {
    it('should throw an error if the secure server is not running on correct port (443)', () => {
      const secureServer = nock(`http://127.0.0.1:81`)
      expect(() => {
        ssl.useSecureServer(secureServer)
      }).toThrowError('Invalid secure server. Must be server running on port 443')
    })

    it('should append ssl.args with secure server when server is running on correct port (443)', () => {
      const secureServer = nock(`https://127.0.0.1:443`)
      ssl.useSecureServer(secureServer)
      expect(ssl.args.secureServer).toMatchObject(secureServer)
    })

    it('should throw an error when secure server is not defined', () => {
      expect(() => {
        ssl.useSecureServer()
      }).toThrowError('Invalid secure server. Must be server running on port 443')
    })
  })
  describe('addMiddleware', () => {
    it('should throw an error if there is no listeningServer set', () => {
      expect(() => {
        ssl.addMiddleware()
      }).toThrowError('Listening server must be present in order to add middleware')
    })
    it('should throw an error if there is a valid listening server but no middleware', () => {
      const listeningServer = nock(`http://127.0.0.1`)
      ssl.useListeningServer(listeningServer)
      ssl.provider('letsencrypt')

      expect(() => {
        ssl.addMiddleware()
      }).toThrowError('Cannot add middleware without a provider')
    })

  })
  describe('start', () => {
    it('should throw an error if listening server is not valid', () => {
      expect(() => {
        ssl.start()
      }).toThrowError('Listening server must be present in order to add middleware')
    })

    it('should throw an error if the listening server does not support middleware', () => {
      const listeningServer = nock(`http://127.0.0.1`)
      ssl.useListeningServer(listeningServer)

      expect(() => {
        ssl.start()
      }).toThrowError('Listening server does not support middleware')
    })

    it('should return undefined if server is valid', () => {
      const listeningServer = nock(`http://127.0.0.1`)
      listeningServer.use = use
      ssl.useListeningServer(listeningServer)
      expect(ssl.start()).toBeUndefined()
    })
  })
})

// addOpts √
// useDomains √
// certificateDir √
// useEnvironment √
// provider √
// registerTo √
// autoRenew √
// byteLength √
// checkAndCreateDirectory √
// getPort
// getKey
// getCertificate
// dirExists
// fileExists
// getFile
// useListeningServer √
// useSecureServer √
// addMiddleware √
// start

/*
describe('start', () => {
    it('should ...', () => {
     
  })
 */