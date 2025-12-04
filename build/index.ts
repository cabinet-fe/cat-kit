import { MonoRepoBundler } from '@cat-kit/maintenance/src'
import { pkgs } from './pkgs'

const bundler = new MonoRepoBundler(pkgs)

await bundler.build()
