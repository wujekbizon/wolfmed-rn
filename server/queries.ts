import 'server-only'
import { db } from '@/server/db/index'
import { completedTestes, users } from './db/schema'
import { ExtendedCompletedTest, ExtendedProcedures, ExtendedTest, Post } from '@/types/dataTypes'
import { eq, asc, desc } from 'drizzle-orm'
import { Post as ForumPost } from '@/types/forumPostsTypes'

// Get all tests with their data, ordered by newest first
export const getAllTests = async (): Promise<ExtendedTest[]> => {
  const tests = await db.query.tests.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  })
  return tests
}

// Get all medical procedures, ordered by newest first
export const getAllProcedures = async (): Promise<ExtendedProcedures[]> => {
  const procedures = await db.query.procedures.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  })
  return procedures
}

// Get all blog posts, ordered by newest first
export const getAllPosts = async (): Promise<Post[]> => {
  const posts = await db.query.blogPosts.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  })
  return posts
}

// Get all completed tests for a specific user, ordered by completion date
export const getCompletedTestsByUser = async (userId: string): Promise<ExtendedCompletedTest[]> => {
  const completedTest = await db.query.completedTestes.findMany({
    where: (model, { eq }) => eq(model.userId, userId),
    orderBy: (model, { desc }) => desc(model.completedAt),
  })
  return completedTest
}

// Get a specific completed test by its ID
export const getCompletedTest = async (testId: string) => {
  const completedTest = await db.query.completedTestes.findFirst({
    where: (model, { eq }) => eq(model.id, testId),
  })
  return completedTest
}

// Get a specific question by its test ID
export const getQuestionById = async (testId: string) => {
  const question = await db.query.tests.findFirst({
    where: (model, { eq }) => eq(model.id, testId),
  })
  return question
}

// Get user's remaining test limit
export const getUserTestLimit = async (id: string) => {
  const [testLimit] = await db.select({ testLimit: users.testLimit }).from(users).where(eq(users.userId, id))
  return testLimit
}



// Get a blog post by its ID
export const getPostById = async (id: string) => {
  const post = await db.query.blogPosts.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  })
  return post
}

// Delete a completed test by its ID
export const deleteCompletedTest = async (testId: string) => {
  await db.delete(completedTestes).where(eq(completedTestes.id, testId))
}

// Update username for a specific user
export const updateUsernameByUserId = async (userId: string, newUsername: string) => {
  await db.update(users).set({ username: newUsername }).where(eq(users.userId, userId))
}

// Get username for a specific user
export const getUserUsername = async (userId: string): Promise<string> => {
  const user = await db.query.users.findFirst({
    where: (model, { eq }) => eq(model.userId, userId),
    columns: { username: true },
  })
  return user?.username || ''
}

// Update motto for a specific user
export const updateMottoByUserId = async (userId: string, newMotto: string) => {
  await db.update(users).set({ motto: newMotto }).where(eq(users.userId, userId))
}

// Get motto for a specific user
export const getUserMotto = async (userId: string): Promise<string> => {
  const user = await db.query.users.findFirst({
    where: (model, { eq }) => eq(model.userId, userId),
    columns: { motto: true },
  })
  return user?.motto || ''
}

// Get user statistics (total score, questions, tests attempted)
export const getUserStats = 
  async (
    userId: string
  ): Promise<{
    totalScore: number
    totalQuestions: number
    testsAttempted: number
  }> => {
    const result = await db
      .select({
        totalScore: users.totalScore,
        totalQuestions: users.totalQuestions,
        testsAttempted: users.testsAttempted,
      })
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1)

    return {
      totalScore: result[0]?.totalScore || 0,
      totalQuestions: result[0]?.totalQuestions || 0,
      testsAttempted: result[0]?.testsAttempted || 0,
    }
 }
