import swaggerUi from 'swagger-ui-express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import swaggerJSDoc from 'swagger-jsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MVP Assessment AI API',
      version: '1.0.0',
      description: 'MVP Assessment AI API Documentation',
    },
    servers: [
      {
        url: '/',
        description: 'Same origin (use the host that served /api-docs)',
      },
      ...(process.env.API_BASE_URL
        ? [
            {
              url: process.env.API_BASE_URL.replace(/\/$/, ''),
              description: 'API_BASE_URL (explicit)',
            },
          ]
        : []),
    ],
    components: {
      parameters: {
        AssessmentId: {
          in: 'path',
          name: 'id',
          required: true,
          description: 'Numeric assessment id',
          schema: {
            type: 'integer',
            format: 'int32',
            minimum: 1,
            example: 1,
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token like: Bearer <token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [join(__dirname, '../api/**/*.js')],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const swaggerUiOptions = {
  swaggerOptions: {
    filter: true,
    persistAuthorization: true,
  },
  customCss: `
    .swagger-ui .filter-container {
      position: sticky;
      top: 0;
      z-index: 10;
      padding: 12px 0;
      margin-bottom: 16px;
    }
    .swagger-ui .filter-container input {
      width: 100%;
      max-width: 100%;
      padding: 8px 12px;
      font-size: 14px;
    }
  `,
};

export { swaggerUi, swaggerSpec, swaggerUiOptions };
