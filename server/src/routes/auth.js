'use strict'

const bcrypt = require('bcrypt')
const crypto = require('crypto')
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

  // POST /api/auth/forgot-password
  // Accepts { email }, creates a reset token valid for 24h.
  // In dev mode returns the token directly (no email sending).
  fastify.post('/forgot-password', async (req, reply) => {
    const { email } = req.body || {}
    if (!email) return reply.badRequest('Email обовʼязковий')

    const { rows } = await db.query(
      'SELECT id FROM users WHERE email = $1 AND is_active = TRUE',
      [email],
    )

    // Always respond the same way to prevent email enumeration
    if (!rows.length) {
      return reply.send({ sent: true })
    }

    const userId = rows[0].id
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Invalidate any previous unused tokens for this user
    await db.query(
      `UPDATE password_reset_tokens SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL`,
      [userId],
    )

    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token)
       VALUES ($1, $2)`,
      [userId, resetToken],
    )

    // In production you would send an email with the reset link.
    // In dev mode we return the token so the frontend can simulate the flow.
    const isDev = process.env.NODE_ENV !== 'production'
    return reply.send({ sent: true, ...(isDev ? { reset_token: resetToken } : {}) })
  })

  // POST /api/auth/reset-password
  // Accepts { token, password }, validates the token and updates the password.
  fastify.post('/reset-password', async (req, reply) => {
    const { token, password } = req.body || {}
    if (!token || !password) return reply.badRequest('Token та пароль обовʼязкові')
    if (password.length < 8)  return reply.badRequest('Пароль має містити щонайменше 8 символів')

    const { rows } = await db.query(
      `SELECT id, user_id, expires_at, used_at
       FROM password_reset_tokens WHERE token = $1`,
      [token],
    )

    if (!rows.length) {
      return reply.badRequest('Недійсне посилання для скидання пароля')
    }

    const row = rows[0]

    if (row.used_at) {
      return reply.conflict('Це посилання вже було використано')
    }

    if (new Date(row.expires_at) < new Date()) {
      return reply.gone('Термін дії посилання минув')
    }

    const password_hash = await bcrypt.hash(password, 12)

    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [password_hash, row.user_id],
    )

    await db.query(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1',
      [row.id],
    )

    return reply.send({ success: true })
  })
}

module.exports = authRoutes
