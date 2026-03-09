import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }),
  recaptchaToken: Joi.string().required().messages({
    'any.required': 'reCAPTCHA verification is required'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required()
});

export const verifyOTPSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required()
});

export const foodSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  description: Joi.string().max(500).trim().required(),
  category: Joi.string().valid('Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Snack').required(),
  price: Joi.number().min(0).required(),
  image: Joi.string().uri().required(),
  available: Joi.boolean()
});

export const orderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      foodId: Joi.string().required(),
      quantity: Joi.number().min(1).required()
    })
  ).min(1).required(),
  deliveryAddress: Joi.string().min(10).max(200).trim().required(),
  phoneNumber: Joi.string()
    .trim()
    .pattern(/^(\+?63|0)9\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid Philippine mobile number (e.g., 09123456789 or +639123456789)',
      'any.required': 'Phone number is required for delivery coordination'
    }),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  }).optional()
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled').required()
});
