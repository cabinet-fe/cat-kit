import { GROUPS_BUILD } from './build'

await Promise.all(Object.values(GROUPS_BUILD).map(fn => fn()))
