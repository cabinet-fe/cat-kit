import { buildUtils } from './build-utils'
import { clean } from './clean'
import { copy } from './copy'

async function build() {
  await clean()
  await buildUtils()
  // copy(process.argv[2])
}

build()