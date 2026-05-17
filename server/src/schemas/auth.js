'use strict'

const registerSchema = {
  body: {
    type: 'object',
    required: ['first_name', 'last_name', 'email', 'password'],
    properties: {
      first_name: { type: 'string', minLength: 1, maxLength: 100 },
      last_name:  { type: 'string', minLength: 1, maxLength: 100 },
      email:      { type: 'string', format: 'email' },
      password:   { type: 'string', minLength: 8 },
    },
    additionalProperties: false,
  },
}

const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email:    { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
    additionalProperties: false,
  },
}

module.exports = { registerSchema, loginSchema }
