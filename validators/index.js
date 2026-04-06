const Joi = require("joi");
const { ROLES, RECORD_TYPES, RECORD_CATEGORIES } = require("../constants");

//  Auth Validators 

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .default("viewer"), // default role keeps things safe
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

//  Record Validators 

const createRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required().messages({
    "number.positive": "Amount must be a positive number",
    "any.required": "Amount is required",
  }),
  type: Joi.string()
    .valid(...Object.values(RECORD_TYPES))
    .required()
    .messages({
      "any.only": `Type must be one of: ${Object.values(RECORD_TYPES).join(", ")}`,
    }),
  category: Joi.string()
    .valid(...RECORD_CATEGORIES)
    .required()
    .messages({
      "any.only": `Category must be one of: ${RECORD_CATEGORIES.join(", ")}`,
    }),
  date: Joi.date().iso().default(() => new Date()),
  notes: Joi.string().trim().max(500).optional().allow(""),
});

const updateRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2),
  type: Joi.string().valid(...Object.values(RECORD_TYPES)),
  category: Joi.string().valid(...RECORD_CATEGORIES),
  date: Joi.date().iso(),
  notes: Joi.string().trim().max(500).allow(""),
}).min(1); // at least one field must be provided

//  User Update Validators (admin only) 

const updateUserSchema = Joi.object({
  role: Joi.string().valid(...Object.values(ROLES)),
  status: Joi.string().valid("active", "inactive"),
}).min(1);

//  Validation middleware factory 
/**
 * validate(schema) — wraps Joi validation as Express middleware.
 * Extracts all errors at once (abortEarly: false) for a better DX.
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true, // quietly drop fields not in schema (security hygiene)
  });

  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  req.body = value; // replace body with sanitised + defaulted values
  next();
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createRecordSchema,
  updateRecordSchema,
  updateUserSchema,
};
