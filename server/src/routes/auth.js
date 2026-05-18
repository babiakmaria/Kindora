'use strict'

const bcrypt = require('bcrypt')
const { registerSchema, loginSchema } = require('../schemas/auth')

// Palette shared with the frontend — matches PRESET_COLORS used for member avatars
const AVATAR_COLORS = [
  '#FF6B9D', '#4CAF7D', '#8B5CF6', '#F59E0B', '#06B6D4',
  '#10B981', '#F97316', '#6366F1', '#EC4899', '#14B8A6',
]
const randomAvatarColor = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

async function authRoutes(fastify) {
  const { db } = fastify

  // POST /api/auth/register
  fastify.post('/register', { schema: registerSchema }, async (req, reply) => {
    const { first_name, last_name, email, password, system_role = 'volunteer' } = req.body

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length) {
      return reply.conflict('Email вже використовується')
    }

    const password_hash = await bcrypt.hash(password, 12)
    const avatar_color  = randomAvatarColor()

    const { rows } = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, system_role, avatar_color, agreed_terms)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       RETURNING id, first_name, last_name, email, system_role, avatar_color, joined_at`,
      [first_name, last_name, email, password_hash, system_role, avatar_color],
    )

    const user = rows[0]
    const token = fastify.jwt.sign({ id: user.id, role: user.system_role })
    return reply.code(201).send({ token, user })
  })

  // POST /api/auth/login
  fastify.post('/login', { schema: loginSchema }, async (req, reply) => {
    const { email, password } = req.body

    const { rows } = await db.query(
      `SELECT id, first_name, last_name, email, password_hash, system_role, avatar_color
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
