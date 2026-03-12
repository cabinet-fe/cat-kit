import { groups } from './groups'

await Promise.all(Object.values(groups).map((item) => item.build?.()))
