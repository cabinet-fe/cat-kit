import { MonoRepoBundler } from './repo'
import { pkgs } from './pkgs'

const bundler = new MonoRepoBundler(pkgs)

await bundler.build()
