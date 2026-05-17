'use strict'

const createProjectSchema = {
  body: {
    type: 'object',
    required: ['title', 'category_id'],
    properties: {
      title:       { type: 'string', minLength: 3, maxLength: 255 },
      description: { type: 'string' },
      icon:        { type: 'string', maxLength: 10 },
      icon_bg:     { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
      category_id: { type: 'integer' },
      start_date:  { type: 'string', format: 'date' },
      end_date:    { type: 'string', format: 'date' },
      tag_ids:     { type: 'array', items: { type: 'integer' }, uniqueItems: true },
    },
    additionalProperties: false,
  },
}

const updateProjectSchema = {
  body: {
    type: 'object',
    minProperties: 1,
    properties: {
      title:       { type: 'string', minLength: 3, maxLength: 255 },
      description: { type: 'string' },
      status:      { type: 'string', enum: ['new', 'active', 'in_progress', 'completed', 'archived'] },
      progress:    { type: 'integer', minimum: 0, maximum: 100 },
      icon:        { type: 'string', maxLength: 10 },
      icon_bg:     { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
      start_date:  { type: 'string', format: 'date' },
      end_date:    { type: 'string', format: 'date' },
    },
    additionalProperties: false,
  },
}

module.exports = { createProjectSchema, updateProjectSchema }
