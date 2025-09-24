import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Restaurant API',
      version: '1.0.0',
      description: 'API documentation for Restaurant Management System',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        DaySchedule: {
          type: 'object',
          required: ['open', 'close', 'closed'],
          properties: {
            open: {
              type: 'string',
              pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
              description: 'Opening time in 24-hour format (HH:MM)',
              example: '09:00'
            },
            close: {
              type: 'string',
              pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
              description: 'Closing time in 24-hour format (HH:MM)',
              example: '22:00'
            },
            closed: {
              type: 'boolean',
              description: 'Whether the location is closed all day',
              example: false
            }
          }
        },
        OperatingHours: {
          type: 'object',
          required: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          properties: {
            monday: { $ref: '#/components/schemas/DaySchedule' },
            tuesday: { $ref: '#/components/schemas/DaySchedule' },
            wednesday: { $ref: '#/components/schemas/DaySchedule' },
            thursday: { $ref: '#/components/schemas/DaySchedule' },
            friday: { $ref: '#/components/schemas/DaySchedule' },
            saturday: { $ref: '#/components/schemas/DaySchedule' },
            sunday: { $ref: '#/components/schemas/DaySchedule' }
          }
        },
        RestaurantLocation: {
          type: 'object',
          required: ['id', 'address', 'latitude', 'longitude', 'operatingHours'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the location'
            },
            address: {
              type: 'string',
              description: 'Physical address of the restaurant location'
            },
            phone: {
              type: 'string',
              description: 'Phone number for this location',
              nullable: true
            },
            latitude: {
              type: 'number',
              format: 'float',
              description: 'Latitude coordinate'
            },
            longitude: {
              type: 'number',
              format: 'float', 
              description: 'Longitude coordinate'
            },
            operatingHours: {
              $ref: '#/components/schemas/OperatingHours'
            },
            isCurrentlyOpen: {
              type: 'boolean',
              description: 'Whether the location is currently open (computed field)',
              readOnly: true
            },
            district: {
              type: 'object',
              description: 'District information'
            },
            restaurant: {
              type: 'object', 
              description: 'Restaurant information'
            },
            active: {
              type: 'boolean',
              description: 'Whether the location is active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/presentation/routes/*.ts'], // Path to the API routes
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };
