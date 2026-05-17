'use strict'

async function tagRoutes(fastify) {
  const { db } = fastify

  // GET /api/tags — всі теги (публічно)
  fastify.get('/', async () => {
    const { rows } = await db.query('SELECT * FROM tags ORDER BY name')
    return rows
  })

  // POST /api/tags — створити тег (тільки admin)
  fastify.post('/', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    if (req.user.role !== 'admin') return reply.forbidden()
    const { name, color } = req.body
    if (!name) return reply.badRequest('name обовʼязковий')

    const slug = name.toLowerCase().trim().replace(/\s+/g, '-')
    const { rows } = await db.query(
      `INSERT INTO tags (name, slug, color) VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO NOTHING RETURNING *`,
      [name.trim(), slug, color ?? '#6B7280'],
    )
    if (!rows[0]) return reply.conflict('Тег з такою назвою вже існує')
    return reply.code(201).send(rows[0])
  })

  // DELETE /api/tags/:id — видалити тег (тільки admin)
  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    if (req.user.role !== 'admin') return reply.forbidden()
    const { rowCount } = await db.query('DELETE FROM tags WHERE id = $1', [req.params.id])
    if (!rowCount) return reply.notFound('Тег не знайдено')
    return reply.code(204).send()
  })
}

module.exports = tagRoutes
