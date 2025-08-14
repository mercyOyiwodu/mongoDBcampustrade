const express = require('express');
require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');
require('./config/database');
const sellerRouter = require('./router/sellerRouter');
const adminRouter = require('./router/adminRouter');
const productRouter = require('./router/productRouter');
const categoryRouter = require('./router/category');
const transactionRouter = require('./router/transactionRouter');
const adRouter = require('./router/adRouter')
const checkRouter = require('./router/jambRouter');
const session = require('express-session');
const subCategoryRouter = require('./router/subCategory')
const adminRoutes = require('./routes/adminRoutes');

const secret = process.env.EXPRESS_SESSION_SECRET;
const PORT = process.env.PORT;
const passport = require('passport');
require('./middlewares/passport');
const swaggerJSDoc = require('swagger-jsdoc');

const kycRouter = require('./router/kycRouter');





const swaggerUi = require('swagger-ui-express');
const googleRouter = require('./router/googleAuth');


const app = express();

// Import rate limiters
const { apiLimiter } = require('./middlewares/rateLimiter');

// Middlewares
// Apply rate limiting to all requests
app.use(apiLimiter);

// Configure CORS for security - restrict origins in production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://campustrade-kku1.onrender.com'] 
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4725'];

app.use(cors({ 
  origin: allowedOrigins, 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(session({
  secret,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Swagger Setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Campus trade documentation',
    version: '1.0.0',
    description: 'Documentation for Campus trade API for TCA Cohort 5',
    license: {
      name: 'Licensed Under MIT',
      url: 'https://spdx.org/licenses/MIT.html',
    },
    contact: {
      name: 'Campus Trade',
      url: 'https://jsonplaceholder.typicode.com',
    },
  },
  "components": {
      "securitySchemes": {
          "BearerAuth": {
              "type": "http",
              "scheme": "bearer",
              "bearerFormat": "JWT"
          }
      }
    },

  
  security: [{ BearerAuth: [] }],
  servers: [
      {
          url: 'https://campustrade-kku1.onrender.com',
          description: 'Production server',
      },
      {
          url: 'http://localhost:4725',
          description: 'Development server',
      },

    ],
  };
  

  const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['./router/*.js', 'server.js'],
};

const swaggerSpec = swaggerJSDoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
* @swagger
* /:
*   get:
*     summary: The Home Page of the app
*     description: Returns a welcome message from Campus Trade.
*     security: []  # This ensures the route is public (no authentication required)
*     tags:
*       - Home
*     responses:
*       200:
*         description: Successfully loads the home page.
*         content:
*           text/plain:
*             schema:
*               type: string
*               example: Welcome to the Campus Trade Home Page
*/


app.get('/', (req, res) => {
    res.send('Welcome to the Campus Trade Home Page');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Import and use centralized error handler
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

app.use('/api/v1/seller', sellerRouter);
// app.use(sellerRouter);
app.use('/api/v1', adminRouter);
app.use('/api/v1', productRouter);
app.use('/api/v1', categoryRouter);
app.use('/api/v1/kyc', kycRouter);
app.use('/api/v1', transactionRouter);
app.use('/api/v1', adRouter);
app.use('/api/v1', subCategoryRouter);
app.use('/api/admin', adminRoutes);
app.use(googleRouter)

app.listen(PORT, ()=>{
    console.log(`Server is listening to PORT: ${PORT}`);
})

