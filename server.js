const path = require('path');
const fastify = require('fastify');
const fastifyStatic = require('fastify-static');
const fastifySession = require('fastify-session');
const fastifyCookie = require('fastify-cookie');
const fastifyFormBody = require('fastify-formbody');
const config = require('./pizza.config.js');
const validator = require('email-validator');
const fetch = require('node-fetch');
const bcrypt = require('bcrypt');
const knex = require('knex');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');

const app = fastify({
  logger: { level: 'trace'},
  ignoreTrailingSlash: true,
  maxParamLength: 200,
  caseSensitive: true
});

const RecaptchaVerifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

var db = knex(config.database);

app.register(fastifyStatic, {
  root: path.join(__dirname, 'dist')
});
app.register(fastifyFormBody);
app.register(fastifyCookie);
app.register(fastifySession, {
  secret: config.cookieSecret
});

app.get('/login', (req, rep) => rep.sendFile('index.html'));
app.get('/signup', (req, rep) => rep.sendFile('index.html'));
app.get('/dashboard', (req, rep) => rep.sendFile('index.html'));
app.get('/dashboard/*', (req, rep) => rep.sendFile('index.html'));

const captchaVerify = async (token, ip) => {
  const params = new URLSearchParams();
  params.append('secret', config.recaptchaSecretKey);
  params.append('response', token);
  params.append('remoteip', ip);

  const recaptchaResp = await fetch(RecaptchaVerifyUrl, {
    method: 'post',
    body: params
  });

  return await recaptchaResp.json();
};

const validPassword = (password) => {
  const errors = [];
  if(password.length <= 8) {
    errors.push('Your password must be greater than 8 characters long.');
  }

  if(! /\d/.test(password)) {
    errors.push('Your password must contain at least 1 number.');
  }

  if(! /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password)) {
    errors.push('Your password must contain at least 1 special character.');
  }

  if(! /[ A-Z]/.test(password)) {
    errors.push('Your password must contain at least 1 capital letter.');
  }

  if(! /[ a-z]/.test(password)) {
    errors.push('Your password must contain at least 1 lowercase letter.');
  }
  return errors;
};

app.put('/signup', async (req, rep) => {
  const errors = {};
  const data = req.body;
  data.email = data.email.toLowerCase();
  let fname = [], lname = [], email = [], password = [], confirm = [];

  if(data.fname == null || data.fname == '') {
    fname.push('You must enter your first name.');
  }

  if(data.lname == null || data.lname == '') {
    lname.push('You must enter your last name.');
  }

  if(data.email == null || data.email == '') {
    email.push('You must enter your email address.');
  } else if(!validator.validate(data.email)) {
    email.push('Please enter a valid email address.');
  }

  const accountExists = await db('customer').where({email: data.email})
    .count('* as exists');
  if(accountExists[0].exists) {
    email.push('An account already exists under this email address.');
  }

  if(data.password == null || data.password == '') {
    password.push('You must enter a password.');
  } else {
    password = password.concat(validPassword(data.password));
  }

  if(data.password != data.confirm) {
    confirm.push('Passwords do not match.');
  }

  const recaptchaRes = await captchaVerify(data.captcha, req.ip);
  if((recaptchaRes.success && recaptchaRes.score <= 0.6) 
  || !recaptchaRes.success) {
    errors.general = 'Captcha verification failed.';
  }

  [
    ['fname', fname], 
    ['lname', lname], 
    ['email', email], 
    ['password', password], 
    ['confirm', confirm]
  ].forEach(([entryName, entryErrors]) => {
    if(entryErrors.length) {
      errors[entryName] = entryErrors;
    }
  });

  if(Object.keys(errors).length) {
    await rep.send({success: false, errors: errors});
  } else {
    const passwordHash = await bcrypt.hash(data.password, 12);

    const fakeDob = new Date(1999, 3, 24);
    const fakeAddress = '94 Pier Road\nSTANSFIELD\nCO10 7LY';

    await db('customer').insert({
      email: data.email,
      password: passwordHash,
      first_name: data.fname,
      last_name: data.lname,
      dob: fakeDob,
      address: fakeAddress
    });

    await rep.send({success: true});
  }
});

app.post('/login', async (req, rep) => {
  const errors = {};
  const data = req.body;
  data.email = data.email.toLowerCase();
  const email = [], password = [];

  if(data.email == null || data.email == '') {
    email.push('You must enter an email address.');
  }

  if(data.password == null || data.password == '') {
    password.push('You must enter a password.');
  }

  const recaptchaRes = await captchaVerify(data.captcha, req.ip);
  if((recaptchaRes.success && recaptchaRes.score <= 0.6) 
  || !recaptchaRes.success) {
    errors.general = 'Captcha verification failed.';
  }

  [
    ['email', email], 
    ['password', password]
  ].forEach(([entryName, entryErrors]) => {
    if(entryErrors.length) {
      errors[entryName] = entryErrors;
    }
  });

  if(Object.keys(errors).length) {
    return await rep.send({success: false, errors: errors});
  }

  const account = await db('customer').where({email: data.email}).first();

  if(account == undefined) {
    errors.general = 'Credentials do not match our records.';
  } else {
    const passwordMatch = await bcrypt.compare(
      data.password, 
      account.password.toString()
    );
    if(!passwordMatch) {
      errors.general = 'Credentials do not match our records.';
    }
  }

  if(Object.keys(errors).length) {
    await rep.send({success: false, errors: errors});
  } else {
    req.session.account = account;

    await db('customer').where({ id: account.id }).update({
      last_login: new Date()
    });
    
    if(account.totp_secret !== null) {
      return await rep.send({ success: true, requirement: 'totp'});
    }

    const authToken = crypto.randomBytes(64).toString();
    req.session.authToken = authToken;
    await rep.send({success: true, token: authToken});
  }
});

app.post('/change-password', async (req, rep) => {
  const data = req.body;
  if(data.token == req.session.authToken) {
    const errors = {};
    let current = [], password = [], confirm = [];

    if(data.current == null || data.current == '') {
      current.push('You must enter your password.');
    } else {
      const passwordMatch = await bcrypt.compare(
        data.current, 
        req.session.account.password.toString()
      );
  
      if(!passwordMatch) {
        current.push('Password is incorrect.');
      }

      if(data.current == data.password) {
        password.push('You cannot use the same password again.');
      }
    }

    if(data.password == null || data.password == '') {
      password.push('You must enter a new password.');
    } else {
      password = password.concat(validPassword(data.password));
    }

    if(data.password != data.confirm) {
      confirm.push('Passwords do not match.');
    }

    [
      ['current', current], 
      ['password', password],
      ['confirm', confirm]
    ].forEach(([entryName, entryErrors]) => {
      if(entryErrors.length) {
        errors[entryName] = entryErrors;
      }
    });

    const recaptchaRes = await captchaVerify(data.captcha, req.ip);
    if((recaptchaRes.success && recaptchaRes.score <= 0.6) 
    || !recaptchaRes.success) {
      errors.general = 'Captcha verification failed.';
    }

    if(Object.keys(errors).length) {
      await rep.send({success: false, errors: errors});
    } else {
      const passwordHash = await bcrypt.hash(data.password, 12);
      await db('customer').where({ id: req.session.account.id }).update({
        password: passwordHash
      });
      req.session.account.password = Buffer.from(passwordHash);
      await rep.send({success: true });
    }
  } else {
    rep.send({ success: false });
  }
});

app.post('/session', async (req, rep) => {
  const data = req.body;
  if(data.token == req.session.authToken) {
    const result = Object.assign({}, req.session.account);
    delete result.password;
    await rep.send({ success: true, session: result });
  } else {
    await rep.send({ success: false });
  }
});

app.post('/2fa/create', async (req, rep) => { 
  const data = req.body;
  if(data.token == req.session.authToken) {
    if(req.session.account.totp_secret !== null) {
      return await rep.send({ success: false });
    }

    var secret = speakeasy.generateSecret();
    req.session.temp_totp_secret = secret.base32;

    const dataUri = await qrcode.toDataURL(secret.otpauth_url);
    await rep.send({ success: true, dataUri: dataUri, secret: secret.base32 });
  }
});

app.post('/2fa/auth', async (req, rep) => {
  const data = req.body;
  if(req.session.account) {
    if(data.totp_token == null || data.totp_token == '') {
      return await rep.send({ 
        success: false, 
        error: 'You must enter a token.'
      });
    }
  
    const verified = speakeasy.totp.verify({
      secret: req.session.temp_totp_secret || req.session.account.totp_secret,
      encoding: 'base32',
      token: req.body.totp_token
    });
  
    if(!verified) {
      return await rep.send({
        success: false,
        error: 'Invalid token.'
      });
    }

    if(req.session.temp_totp_secret !== undefined) {
      await db('customer').where({ id: req.session.account.id }).update({
        totp_secret: req.session.temp_totp_secret
      });
      req.session.account.totp_secret = req.session.temp_totp_secret;
      delete req.session.temp_totp_secret;
      return await rep.send({ success: true });
    } else {
      const authToken = crypto.randomBytes(64).toString();
      req.session.authToken = authToken;
      return await rep.send({success: true, token: authToken});
    }
  }
  await rep.send({ success: false });
});

app.post('/2fa/disable', async (req, rep) => {
  const data = req.body;
  if(data.token == req.session.authToken && req.session.account.totp_secret) {
    await db('customer').where({ id: req.session.account.id }).update({
      totp_secret: null
    });
    req.session.account.totp_secret = null;
    return await rep.send({ success: true });
  }
  return await rep.send({ success: false });
});

app.post('/logout', (req, rep) => {
  const data = req.body;
  if(data.token == req.session.authToken) {
    req.destroySession(() => {
      rep.send({ success: true });
    });
  } else {
    rep.send({ success: false });
  }
});

app.listen(config.webPort, config.webAddr, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});