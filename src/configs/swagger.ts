import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cinema Booking API',
      version: '1.0.0',
      description: 'Документація API для системи бронювання квитків у кіно',
    },
    servers: [
      {
        url: 'http://localhost:4000',
      },
    ],
  },
  apis: ['src/routes/**/*.ts'], // або ['**/*.ts'] якщо без структури
});
