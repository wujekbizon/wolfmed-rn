import 'dotenv/config'
import {
  populateCategories,
  populateTags,
  populateTests,
  populateProcedures,
  populateProcedureTags,
  populatePosts,
} from '@/server/db/populateDb'

async function main() {
  console.log('Seeding database...')
  await populateCategories()
  await populateTags()
  await populateTests()
  await populateProcedures()
  await populateProcedureTags()
  await populatePosts()
  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
