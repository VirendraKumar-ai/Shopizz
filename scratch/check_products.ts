import 'dotenv/config'
import { db } from '../server/utils/db'
import { products } from '../db/schema/products'

async function run() {
  const prods = await db.select().from(products)
  console.log('Products in DB count:', prods.length)
  console.log('Products:', JSON.stringify(prods.slice(0, 5), null, 2))
  process.exit(0)
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
