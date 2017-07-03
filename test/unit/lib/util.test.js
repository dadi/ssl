const util = require(`${__dirname}/../../../lib/util`)

jest.mock('mkdirp', (path) => {
  return
})

jest.mock('x509', () => {
  return () => {}
})

describe('Util', () => {
  it('should export Object', () => {
    expect(util).toBeInstanceOf(Object)
  })

  describe('delay', () => {
    it('should delay a method call', () => {
      expect.assertions(1)
      return expect(util.delay(1000)).resolves.toBeUndefined()
    })
  })

  describe('createDirectory', () => {
    it('should only allow string', () => {
      expect(util.createDirectory(['/path/to/directory'])).toMatchObject({err: 'Directory must be a string'})
    })

    it('should create a directory', () => {
      expect(util.createDirectory('/path/to/directory')).toMatchObject({})
    })
  })

  describe('rsa', () => {
    it('should return an error if the bytelength is not a number', () => {
      expect(util.rsa('foo')).toMatchObject({err: 'Invalid bytelength. Must be a number >= 512'})
    })

    it('should return an error if the bytelength is less than 512', () => {
      expect(util.rsa(511)).toMatchObject({err: 'Invalid bytelength. Must be a number >= 512'})
    })

    it('should create a valid rsa', () => {
      expect(util.rsa(2056)).toBeInstanceOf(Object)
    })
  })
})

// createDirectory √
// delay √
// rsa √
// b64enc
// b64dec
// parseCert
// timeLeft
// toBuffer
// toPEM
// toStandardB64
// JSONDigest
// generateCSR
// rsaKeyPair
// b64EncodeBinaryString