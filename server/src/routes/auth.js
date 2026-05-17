'use strict'

const bcrypt = require('bcrypt')
const { registerSchema, loginSchema } = require('../schemas/auth')

async function authRoutes(fastify) {
  const { db } = fastify

  // POST /api/auth/register
  fastify.post('/register', { schema: registerSchema }, async (req, reply) => {
    const { first_name, last_name, email, password } = req.body

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length) {
      return reply.conflict('Email вже використовується')
    }

    const password_hash = await bcrypt.hash(password, 12)
    const { rows } = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, agreed_terms)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING id, first_name, last_name, email, system_role, joined_at`,
      [first_name, last_name, email, password_hash],
    )

    const user = rows[0]
    const token = fastify.jwt.sign({ id: user.id, role: user.system_role })
    return reply.code(201).send({ token, user })
  })

  // POST /api/auth/login
  fastify.post('/login', { schema: loginSchema }, async (req, reply) => {
    const { email, password } = req.body

    const { rows } = await db.query(
      `SELECT id, first_name, last_name, email, password_hash, system_role
       FROM users WHERE email = $1 AND is_active = TRUE`,
      [email],
    )

    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return reply.unauthorized('Невірний email або пароль')
    }

    const token = fastify.jwt.sign({ id: user.id, role: user.system_role })
    const { password_hash: _, ...safeUser } = user
    return { token, user: safeUser }
  })

  // GET /api/auth/me
  fastify.get('/me', { onRequest: [fastify.authenticate] }, async (req) => {
    const { rows } = await db.query('SELECT * FROM user_stats WHERE id = $1', [req.user.id])
    return rows[0]
  })

}

module.exports = authRoutes
