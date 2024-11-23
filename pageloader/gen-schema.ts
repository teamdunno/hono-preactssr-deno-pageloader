import * as fs from "node:fs/promises"
import path from "node:path"
import { ConfigPrimitive } from "./mod.ts";
async function generateSchema(){
    await fs.writeFile(path.join(import.meta.dirname!, "schema.json"), JSON.stringify(ConfigPrimitive))
}
generateSchema().then(()=>{}).catch(()=>{})