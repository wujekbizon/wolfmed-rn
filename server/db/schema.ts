import {
  pgTableCreator,
  timestamp,
  varchar,
  jsonb,
  integer,
  uuid,
  index,
  serial,
  text,
  pgEnum,
  boolean,
  primaryKey,
} from 'drizzle-orm/pg-core'

export const createTable = pgTableCreator((name) => `wolfmed_mobile_${name}`)

export const categories = createTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  description: varchar('description', { length: 512 }),
  isActive: boolean('isActive').default(true).notNull(),
})

export const tags = createTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  isActive: boolean('isActive').default(true).notNull(),
})

export const users = createTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('userId', { length: 256 }).notNull().unique(),
    testLimit: integer('testLimit').default(150),
    createdAt: timestamp('createdAt').defaultNow(),
    motto: varchar('motto').default('').notNull(),
    supporter: boolean('supporter').default(false).notNull(),
    username: varchar('username', { length: 256 }).default('').notNull(),
    updatedAt: timestamp('updatedAt'),
    testsAttempted: integer('tests_attempted').default(0).notNull(),
    totalScore: integer('total_score').default(0).notNull(),
    totalQuestions: integer('total_questions').default(0).notNull(),
  },
  (table) => ({
    userIdIndex: index('usersUserId').on(table.userId),
    usernameIndex: index('usersUsername').on(table.username),
  })
)

export const completedTestes = createTable('completed_tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('userId', { length: 256 })
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' }),
  testResult: jsonb('testResult').default([]),
  score: integer('score').notNull(),
  completedAt: timestamp('completedAt').notNull().defaultNow(),
})

export const tests = createTable('tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: varchar('category', { length: 256 }).notNull(),
  categoryId: integer('categoryId').references(() => categories.id),
  data: jsonb('data').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt'),
})

export const procedures = createTable('procedures', {
  id: uuid('id').primaryKey().defaultRandom(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt'),
})

export const customersMessages = createTable('messages', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt'),
})

export const blogPosts = createTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 256 }).notNull(),
  date: varchar('date', { length: 64 }).notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt'),
})

export const comments = createTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  blogPostId: uuid('blogPostId')
    .notNull()
    .references(() => blogPosts.id, { onDelete: 'cascade' }),
  userId: varchar('userId', { length: 256 })
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt'),
})

export const procedureTags = createTable(
  'procedure_tags',
  {
    procedureId: uuid('procedureId')
      .notNull()
      .references(() => procedures.id, { onDelete: 'cascade' }),
    tagId: integer('tagId')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.procedureId, table.tagId] }),
  })
)

