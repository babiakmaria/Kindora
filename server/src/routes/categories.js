'use strict'

async function categoryRoutes(fastify) {
  const { db } = fastify

  // GET /api/categories — public list of all project categories
  fastify.get('/', async () => {
    const { rows } = await db.query(
      'SELECT id, name, slug FROM project_categories ORDER BY name',
    )
    return rows
  })
}

module.exports = categoryRoutes
