import { MonoRepoLib } from './repo'
import { pkgs } from './pkgs'

const lib = new MonoRepoLib(pkgs)

await lib.build()
