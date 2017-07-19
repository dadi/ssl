# SSL

![coverage](https://img.shields.io/badge/coverage-16%25-red.svg?style=flat?style=flat-square)

```javascript

// Create an SSL certificate
const ssl = new SSL()
  .useDomains(['am.dev.dadi.technology', 'ssl.am.dev.dadi.technology'])
  .storeIn('/data/app/dadi-ssl/certs', true) // SSL directory, create if missing.
  .useEnvironment('production') // Environment (default: production).
  .provider('letsencrypt') // Provider default: letsencrypt.
  .registerTo('am@dadi.co') // Register certificate to email address.
  .autoRenew(true) // Auto renew certificate.
  .byteLength(3072) // RSA bytelength (default: 2048)
  .create() // Start process.

// Adding middleware to handle ssl challenge
app.use(ssl.middleware())