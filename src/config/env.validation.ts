import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .required(),
  PORT:               Joi.number().default(3000),
  SUPABASE_URL:       Joi.string().uri().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  STRIPE_SECRET_KEY:  Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),
  RESEND_API_KEY:     Joi.string().required(),
  REDIS_URL:          Joi.string().required(),
});
