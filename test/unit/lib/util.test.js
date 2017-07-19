const util = require(`${__dirname}/../../../lib/util`)
const moment = require('moment')
const ursa = require('ursa')

jest.mock('mkdirp', (path) => {
  return
})

jest.mock('x509', () => {
  return () => {
    return {
      parseCert: () => {}
    }
  }
})

describe('Util', () => {
  it('should export Object', () => {
    expect(util).toBeInstanceOf(Object)
  })

  describe('Delay', () => {
    it('should delay a method call', () => {
      expect.assertions(1)
      return expect(util.delay(1000)).resolves.toBeUndefined()
    })
  })

  describe('Create Directory', () => {
    it('should only allow string', () => {
      expect(() => {
        util.createDirectory(['/path/to/directory'])
      }).toThrowError('Directory must be a string')
    })

    it('should create a directory', () => {
      expect(util.createDirectory('/path/to/directory')).toMatchObject({})
    })
  })

  describe('RSA Generation', () => {
    it('should return an error if the bytelength is not a number', () => {
      expect(() => {
        util.rsa('foo')
      }).toThrowError('Invalid bytelength. Must be a number >= 512')
    })

    it('should return an error if the bytelength is less than 512', () => {
      expect(() => {
        util.rsa(511)
      }).toThrowError('Invalid bytelength. Must be a number >= 512')
    })

    it('should create a valid rsa', () => {
      expect(util.rsa(2056)).toBeInstanceOf(Object)
    })
  })

  describe('Base 64 Encode', () => {
    it('should return empty string when buffer is undefined', () => {
      expect(util.b64enc(undefined)).toBe('')
    })

    it('should return base64 encoded value from buffer', () => {
      expect(util.b64enc(new Buffer('foo'))).toBe('Zm9v')
    })
  })

  // describe('Parse Certificate', () => {
  //   it('should return empty string when buffer is undefined', () => {
  //     expect(util.parseCert('foo')).toBe('')
  //   })
  // })

  describe('Time Left', () => {
    it('should return an Object', () => {
      expect(util.timeLeft(moment(new Date()).add(1, 'd'), 1)).toBeInstanceOf(Object)
    })

    it('should return days and ms', () => {
      expect(util.timeLeft(moment(new Date()).add(1, 'd'), 1)).toMatchObject({days: 0, ms: 0})
    })

    it('should never return negative values', () => {
      expect(util.timeLeft(moment(new Date()).subtract(100, 'd'), 0)).toMatchObject({days: 0, ms: 0})
    })

    it('should return defaults', () => {
      expect(util.timeLeft()).toMatchObject({days: 0, ms: 0})
    })
  })

  describe('To Buffer', () => {
    it('should convert a string to a buffer', () => {
      expect(util.toBuffer('foo')).toBeInstanceOf(Buffer)
    })

    it('should throw an error if the passed value is not a string', () => {
      expect(() => {
        util.toBuffer()
      }).toThrowError('toBuffer requires type of String')
    })
  })

  describe('toPEM', () => {
    it('should convert a valid cert into a PEM object', () => {
      expect(typeof util.toPEM({})).toBe('string')
    })

    it('should throw an error if the passed value is not a string', () => {
      expect(() => {
        util.toPEM()
      }).toThrowError('toPEM requires type of String')
    })
  })

  describe('toStandardB64', () => {
    it('should return a standardised base64 string', () => {
      expect(util.toStandardB64('foo-bar_baz=quz')).toBe('foo+bar/bazquz==')
    })

    it('should throw an error if the passed value is not a string', () => {
      expect(() => {
        util.toStandardB64()
      }).toThrowError('toStandardB64 requires type of String')
    })
  })

  describe('JSONDigest', () => {
    it('should throw an error if the passed value is not a string', () => {
      expect(() => {
        util.JSONDigest()
      }).toThrowError('JSONDigest requires type of String')
    })

    it('should return a cryptographic digest of a JSON object', () => {
      expect(util.JSONDigest({})).toBeInstanceOf(Buffer)
    })
  })

  describe('generateCSR', () => {
    it('should throw an error if domains are not an array', () => {
      expect(() => {
        util.generateCSR()
      }).toThrowError('Invalid domains. Must be an array')
    })

    it('should throw an error if keyPair is invalid and domains are valid', () => {
      expect(() => {
        util.generateCSR(null, ['ssl.somedomain.tech'])
      }).toThrowError('Invalid keyPair in generateCSR')
    })

    it('should not throw an error if valid keypair and domains are passed', () => {
      const fullKey = ursa.generatePrivateKey(2048, 65537)
      const key = {
        privateKeyPem: fullKey.toPrivatePem('utf8'),
        publicKeyPem: fullKey.toPublicPem('utf8')
      }
      expect(() => {
        util.generateCSR(key, ['ssl.somedomain.tech'])
      }).not.toThrow()
    })
  })

  // describe('rsaKeyPair', () => {
    
  // })

  // describe('b64EncodeBinaryString', () => {
    
  // })
})

// createDirectory √
// delay √
// rsa √
// b64enc √
// parseCert
// timeLeft √
// toBuffer √
// toPEM √
// toStandardB64 √
// JSONDigest √
// generateCSR √
// rsaKeyPair
// b64EncodeBinaryString