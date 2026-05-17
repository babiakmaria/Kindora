'use strict'

const fp = require('fastify-plugin')

async function authPlugin(fastify) {
  fastify.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET,
    sign: { expiresIn: '7d' },
  })

  // Attach to routes via: { onRequest: [fastify.authenticate] }
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch {
      reply.unauthorized('Необхідна авторизація')
    }
  })

  // Optional auth — attaches user if token present, does not reject
  fastify.decorate('optionalAuth', async function (request) {
    try {
      await request.jwtVerify()
    } catch {
      // no-op
    }
  })
}

module.exports = fp(authPlugin, { name: 'auth', dependencies: ['db'] })
