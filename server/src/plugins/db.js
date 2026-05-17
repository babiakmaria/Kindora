'use strict'

const fp = require('fastify-plugin')
const { Pool } = require('pg')

async function dbPlugin(fastify) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
  })

  // Verify connection on startup
  const client = await pool.connect()
  client.release()
  fastify.log.info('PostgreSQL connected')

  fastify.decorate('db', pool)

  fastify.addHook('onClose', async () => pool.end())
}

module.exports = fp(dbPlugin, { name: 'db' })
