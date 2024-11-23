import hono from "./main.ts";
declare global {
type HonoApp = typeof hono
}