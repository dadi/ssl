# DADI SSL

> Automated SSL certificate generation for the DADI Stack.

[![npm (scoped)](https://img.shields.io/npm/v/@dadi/ssl.svg?maxAge=10800&style=flat-square)](https://www.npmjs.com/package/@dadi/ssl)
![coverage](https://img.shields.io/badge/coverage-56%25-red.svg?style=flat?style=flat-square)
[![Build Status](https://travis-ci.org/dadi/ssl.svg?branch=master)](https://travis-ci.org/dadi/ssl)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

## Overview

DADI SSL is a lightweight fully automated totally free SSL generation service that fits seemlessly into the DADI suite of microservices, as all major routing modules including [restify](http://restify.com/) and [express](https://expressjs.com/).

It uses the [letsencrypt](https://letsencrypt.org/) certificate authority to register, create and automatically update multi-domain SSL certificates for use on single-server instances of your application. 

It is recommended that load balanced services should apply certificates as part of the security policy, which is usually free.

## Getting started

1. Install the `@dadi/ssl` module:

```shell
npm install @dadi/ssl --save
```

2. Add the library to your project file:

```javascript
const SSL = require('@dadi/ssl')
```

3. Add preferences:

```javascript

// Example: select a domain and location to store certificates.
const ssl = new SSL()
  .useDomains(['somedomain.com'])
  .storeIn('/data/app/dadi-ssl/certs', true)
  .registerTo('webadmin@dadi.co')
  .useSecureServer(secureServer)
  .useListeningServer(listeningServer)
  .start()
```

4. Using with your server

```javascript
// Example

// Specify domain(s), a directory and a registration address.
const ssl = new SSL()
  .useDomains(['somedomain.com'])
  .storeIn('/data/app/dadi-ssl/certs', true)
  .registerTo('webadmin@dadi.co')

// Start listening server on port 80.
const listeningServer = restify.createServer({
  port: 80
})

// Start secure server on port 443, with key and certificate files.
const server = restify.createServer({
  port: 443,
  key: ssl.getKey(),
  certificate: ssl.getCertificate()
})

// Add your servers and start the process.
ssl
  .useSecureServer(secureServer)
  .useListeningServer(listeningServer)
  .start()

```

## Required settings

#### `.useDomains(domains)`

Select the domains to register. Must be an array.

```javascript
// Example
.useDomains(['foo.somedomain.com', 'bar.somedomain.com', 'somedomain.com'])
```

#### `.registerTo(email)`

Set the email address for the certificate registration.

```javascript
// Example
.registerTo(foo@somedomain.com)

```

#### `.useSecureServer(secureServer)`

Pass a server running securely on port 443 to allow the service to restart it once the certificates are generated.

```javascript
// Example
.useSecureServer(secureServer)
```

#### `.useListeningServer(listeningServer)`

A listening server running on port 80 allows the service to perform the necessary challenge requests. 

```javascript
// Example
.useListeningServer(listeningServer)
```

## Optional settings

#### `.storeIn(domains)`

Select a directory to store certificate, and whether to force creation if the directory doesn't exist.

```javascript
// Example
.storeIn('/data/app/dadi-ssl/certs', true)
```

#### `.autoRenew(autoRenew)`

Whether to auto renew certificates two days before expiry.

Default: *true*

```javascript
// Example
.autoRenew(true)
```

#### `.byteLength(length)`

Bytelength of certificate. Can be between 512 and 4096. Higher = more secure, but slower to generate. Certificates with 2048 are assumed to be uncompromisable until the year 2030.

Default: 2048

```javascript
// Example
.byteLength(4096)
```

#### `.useEnvironment(environment)`

Select which letsencrypt environment to use. Can be useful when debugging or avoiding usage limits (20/day).

Options: `production`, `staging`

```javascript
// Example
.useEnvironment('staging')
```

## Terminators

#### `.start()`

Initialises the process of creating certificates.

```javascript
// Example
new SSL()
  .useDomains(['somedomain.com'])
  .registerTo('webadmin@dadi.co')
  .useSecureServer(secureServer)
  .useListeningServer(listeningServer)
  .start()
```

#### `.getKey()`

Get contents of the key file (domain.key). Useful for the `key` attribute of your server options.

```javascript
const ssl = new SSL()

ssl.getKey()
```

#### `.getCertificate()`

Get contents of the certificate chain file (chained.pem). Useful for the `certificate` attribute of your server options.

```javascript
const ssl = new SSL()

ssl.getCertificate()
```

## Limitation

Letsencrypt will allow a maximum of 20 requests per domain, per day. 

Generation of certificates requests a response directly to the server that made the request which can't be guarenteed when using a load balancer.