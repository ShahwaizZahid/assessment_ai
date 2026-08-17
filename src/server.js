import './loadEnv.js';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import { swaggerSpec, swaggerUi, swaggerUiOptions } from './configuration/swagger.js';
import apiRoutes from './api/index.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { renderLoginPage, handleLogin, requireSwaggerAuth } from './middleware/swaggerAuth.js';

const app = express();
app.set('trust proxy', true);

const PORT = process.env.PORT || 3000;

app.use(
  helmet({
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    contentSecurityPolicy: false,
  }),
);

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const isLocalOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || isLocalOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
};

app.use('/api/v1', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`,
    );
  });
  next();
});

app.use(
  session({
    secret: process.env.JWT_SECRET || 'swagger-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  }),
);

app.get('/api-docs/login', renderLoginPage);
app.post('/api-docs/login', handleLogin);
app.use('/api-docs', requireSwaggerAuth);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

app.use('/api/v1', apiRoutes);

app.get('/health', (req, res) => {
  logger.info('Health check');
  res.json({ success: true, message: 'Server is running' });
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  const swaggerUser = (process.env.SWAGGER_USER || '').replace(/\r/g, '').trim();
  const swaggerPass = (process.env.SWAGGER_PASS || '').replace(/\r/g, '').trim();
  if (!swaggerUser || !swaggerPass) {
    logger.warn('SWAGGER_USER or SWAGGER_PASS is missing — /api-docs login will fail');
  } else {
    logger.info(`Swagger login user is set (${swaggerUser})`);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Stop the other process, then run npm run dev again.`);
    process.exit(1);
  }
  throw err;
});
