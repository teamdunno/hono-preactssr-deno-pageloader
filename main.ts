import * as loader from "pageloader"
import {Hono} from "hono"
const app = new Hono()
export default app
await loader.load({static:["assets"]},app)