'use strict'

require('dotenv').config()

const fastify = require('fastify')({
  logger:
    process.env.NODE_ENV === 'development'
      ? { transport: { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } } }
      : true,
})

// ── Core plugins ──────────────────────────────────────────────
fastify.register(require('@fastify/sensible'))
fastify.register(require('@fastify/cors'), {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
})
fastify.register(require('@fastify/cookie'))

// ── Swagger (API docs at /docs) ────────────────────────────────
fastify.register(require('@fastify/swagger'), {
  openapi: {
    info: { title: 'Kindora API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
})
fastify.register(require('@fastify/swagger-ui'), { routePrefix: '/docs' })

// ── App plugins ────────────────────────────────────────────────
fastify.register(require('./plugins/db'))
fastify.register(require('./plugins/auth'))

// ── Routes ────────────────────────────────────────────────────
fastify.register(require('./routes/auth'),          { prefix: '/api/auth' })
fastify.register(require('./routes/users'),         { prefix: '/api/users' })
fastify.register(require('./routes/projects'),      { prefix: '/api/projects' })
fastify.register(require('./routes/tags'),          { prefix: '/api/tags' })
fastify.register(require('./routes/categories'),    { prefix: '/api/categories' })
fastify.register(require('./routes/applications'),  { prefix: '/api/applications' })
fastify.register(require('./routes/notifications'), { prefix: '/api/notifications' })

fastify.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

module.exports = fastify
