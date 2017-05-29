# SSL


```javascript

// Create an SSL certificate
ssl
  .useDomains(['am.dev.dadi.technology', 'ssl.am.dev.dadi.technology'])
  .storeIn('/data/app/dadi-ssl/certs', true) // SSL directory, create if missing
  .useEnvironment('stage') // Environment (default: production)
  .provider('letsencrypt') // Provider default: letsencrypt
  .register({
    email: 'am@dadi.co'
  })
  .create()
```