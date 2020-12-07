module.exports = {
  webAddr: '0.0.0.0',
  webPort: 3000,
  baseUrl: 'http://localhost:3000',
  recaptchaSiteKey: '6LcPXPkZAAAAAJL5aH_4WZGFIUr2jij6KdlXKMdr',
  recaptchaSecretKey: '6LcPXPkZAAAAAJP3l-aaDI9HAXR-pZeHqV0obh0H',
  cookieSecret: 'wcX84dNTvvqznHwjqW1DbTJpxIztjr2Jisf0YQgxm4IfF1vVGn3YvOe2fu4II3PV',
  database: {
    client: 'mysql',
    connection: {
      host : 'db',
      user : 'ben',
      password : 'password',
      database : 'restaurant'
    }
  }
};