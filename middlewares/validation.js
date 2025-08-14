const Joi = require('joi');

// Validation schemas
const schemas = {
  // Product validation
  createProduct: Joi.object({
    productName: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    price: Joi.number().positive().required(),
    condition: Joi.string().valid('Used', 'New').required(),
    school: Joi.string().min(2).max(100).required()
  }),

  updateProduct: Joi.object({
    productName: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(10).max(1000).optional(),
    price: Joi.number().positive().optional(),
    condition: Joi.string().valid('Used', 'New').optional(),
    school: Joi.string().min(2).max(100).optional()
  }),

  // Seller validation
  sellerRegistration: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]')).required(),
    fullName: Joi.string().min(2).max(50).optional()
  }),

  sellerLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Search validation
  searchQuery: Joi.object({
    q: Joi.string().min(1).max(100).optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(50).optional()
  })
};

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errorMessage
      });
    }

    next();
  };
};

module.exports = {
  validate,
  schemas
};