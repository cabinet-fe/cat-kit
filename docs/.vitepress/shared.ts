import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const DOCS_DIR = path.resolve(__dirname, '..')
export const EXAMPLES_DIR = path.resolve(DOCS_DIR, 'examples')