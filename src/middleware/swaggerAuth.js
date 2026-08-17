import { logger } from '../utils/logger.js';

const loginPageHtml = (showError) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MVP Assessment AI — API Docs Login</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f7fa;
      color: #1a1a2e;
    }
    .card {
      width: 100%;
      max-width: 400px;
      padding: 2.5rem 2rem;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(26, 26, 46, 0.08);
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
      text-align: center;
    }
    p.subtitle {
      font-size: 0.875rem;
      color: #64748b;
      text-align: center;
      margin-bottom: 1.75rem;
    }
    .error {
      background: #fdecea;
      color: #b42318;
      font-size: 0.875rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.25rem;
      text-align: center;
    }
    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.375rem;
    }
    input {
      width: 100%;
      padding: 0.625rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9375rem;
      margin-bottom: 1.25rem;
      outline: none;
      transition: border-color 0.15s;
    }
    input:focus { border-color: #1a1a2e; }
    button {
      width: 100%;
      padding: 0.75rem;
      background: #1a1a2e;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
    }
    button:hover { background: #2d2d44; }
  </style>
</head>
<body>
  <div class="card">
    <h1>MVP Assessment AI</h1>
    <p class="subtitle">Sign in to access Swagger UI</p>
    ${showError ? '<div class="error">Invalid username or password.</div>' : ''}
    <form method="POST" action="/api-docs/login">
      <label for="username">Username</label>
      <input type="text" id="username" name="username" required autocomplete="username" autofocus>
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required autocomplete="current-password">
      <button type="submit">Sign in</button>
    </form>
  </div>
</body>
</html>`;

const isSwaggerHtmlRequest = (req) => {
  if (req.method !== 'GET') return false;
  if (req.path !== '/' && req.path !== '') return false;
  return req.accepts(['html', 'json']) === 'html';
};

const isPageReload = (req) => {
  const cacheControl = req.headers['cache-control'] || '';
  const pragma = req.headers.pragma || '';
  return cacheControl.includes('max-age=0') || cacheControl.includes('no-cache') || pragma.includes('no-cache');
};

export const renderLoginPage = (req, res) => {
  if (req.session?.swaggerAuthenticated) {
    return res.redirect('/api-docs/');
  }
  const showError = req.query.error === '1';
  res.type('html').send(loginPageHtml(showError));
};

const envValue = (key) => (process.env[key] || '').replace(/\r/g, '').trim();

export const handleLogin = (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '').trim();
  const validUser = envValue('SWAGGER_USER');
  const validPass = envValue('SWAGGER_PASS');

  if (!validUser || !validPass) {
    logger.warn('Swagger login failed: SWAGGER_USER or SWAGGER_PASS is not set');
    return res.redirect('/api-docs/login?error=1');
  }

  if (username === validUser && password === validPass) {
    req.session.swaggerAuthenticated = true;
    req.session.swaggerPageLoaded = false;
    return req.session.save((err) => {
      if (err) {
        logger.error('Swagger login failed: session save error');
        return res.redirect('/api-docs/login?error=1');
      }
      logger.info('Swagger login succeeded');
      return res.redirect('/api-docs/');
    });
  }

  logger.warn('Swagger login failed: invalid username or password');
  return res.redirect('/api-docs/login?error=1');
};

export const requireSwaggerAuth = (req, res, next) => {
  if (!req.session?.swaggerAuthenticated) {
    return res.redirect('/api-docs/login');
  }

  if (isSwaggerHtmlRequest(req)) {
    if (req.session.swaggerPageLoaded && isPageReload(req)) {
      return req.session.destroy(() => res.redirect('/api-docs/login'));
    }

    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const contentType = res.getHeader('content-type');
        if (contentType && String(contentType).includes('text/html')) {
          req.session.swaggerPageLoaded = true;
          req.session.save(() => {});
        }
      }
    });
  }

  return next();
};
