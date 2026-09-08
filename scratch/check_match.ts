import 'dotenv/config'
import { db } from '../server/utils/db'
import { users } from '../db/schema/users'
import { scryptSync } from 'node:crypto'

// Test candidates
const hashStr = '$scrypt$n=16384,r=8,p=1$2uUBUH6rJPs71yuVWXyUvA$2mLOyFBN0VDIiNjBcUSbtpjw4DKN6AA7QA7b27phb5Dl98j3e4Wqrn9o9PTb7J2VuLVeYpU1sGRzr3cktHQMzw'

// parse format
const parts = hashStr.split('$')
// parts: ['', 'scrypt', 'n=16384,r=8,p=1', salt (base64 or hex?), hash]
const salt = Buffer.from(parts[3], 'base64')
const expectedHash = Buffer.from(parts[4], 'base64')

const candidates = [
  'password',
  'password123',
  'Password123!',
  'admin123',
  'Admin123!',
  '12345678',
  'test1234',
  'Test1234!',
  'shopizz123',
  'Sharad@123',
  'Rey@123',
]

for (const c of candidates) {
  const derived = scryptSync(c, salt, expectedHash.length, { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 })
  if (derived.equals(expectedHash)) {
    console.log('MATCH FOUND! Password is:', c)
    process.exit(0)
  }
}
console.log('No direct match in common candidates')
process.exit(0)
