import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/serve-static";
import { type Static, type TSchema, Type } from "@sinclair/typebox";
import glob from "fast-glob";
import path from "node:path";
import * as fs from "node:fs/promises"
const Nullable = <T extends TSchema>(schema: T) =>
    Type.Optional(Type.Union([schema, Type.Null()]));
export const ConfigPrimitive = Type.Object({
    path: Nullable(Type.String()),
    ignore: Nullable(Type.Array(Type.String())),
    static: Nullable(Type.Array(Type.String())),
});
export type Config = Static<typeof ConfigPrimitive>;
type ExcludeNullish<T> = T extends Record<string, unknown>
    ? Exclude<
        Exclude<
            { [K in keyof T]-?: Exclude<Exclude<T[K], null>, undefined> },
            null
        >,
        undefined
    >
    : Exclude<Exclude<T, null>, undefined>;
    function getInfo(optRaw: Config={}) {
    const rootDir: string = path.dirname(import.meta.dirname!);
    const defaultConfig: Config = {
        ignore: [],
        path: "page",
        static: [],
    };
    return {
        rootDir,
        config: {...defaultConfig, ...optRaw} as {
            [K in keyof Config]-?: ExcludeNullish<Config[K]>;
        },
    };
}
/**
 * Load a page directory, but will try to find `pageloader.json`. But if dosent found, stick to the default settings on {@link defaultConfig}
 *
 * @param app Your Hono app
 */
export async function load<T extends Hono>(app: T): Promise<void>;
/**
 * Load a page directory, using your own config
 *
 * @param config Your configuration content
 * @param app Your Hono app
 */
export async function load<T extends Hono>(
    config: Config,
    app: T,
): Promise<void>;
export async function load<T extends Hono>(
    content: Config | T ,
    app?: T,
): Promise<void> {
    const appRes: T = (content instanceof Hono ? content : app) as T;
    const info = getInfo(content instanceof Hono ? undefined : content);
    const ignoreConf = info.config.ignore.length > 0
    ? info.config.ignore.map((e) => {
        return `./${info.config.path}/${e}`;
    })
    : undefined
    const staticConf = info.config.static.length > 0
    ? info.config.static.map((e) => {
        return `./${info.config.path}/${e}`;
    })
    : undefined
    let res:string[]|undefined;
    if (ignoreConf && !staticConf) res = ignoreConf
    else if (!ignoreConf && staticConf) res = staticConf
    else res = undefined
    const files = await glob([`./${info.config.path}/**/*.tsx`], {
        ignore: res,
        deep: 4,
    });
    if (files.length>0){
    for (const each of files) {
        try {
        const obj = ((await import(`../${each}`))?.default)??undefined
        if (typeof obj === "undefined") {continue}
        await (obj as unknown as (app: typeof appRes) => Promise<void> | void)(
            appRes
        );
        } catch (_) {
            continue
        }
    }
    }
    if (info.config.static.length>0) {
    for (const each of info.config.static) {
        console.log(`/${each!=="root"?`${each}/`:undefined}*`)
        appRes.use(`/${each!=="root"?`${each}/`:undefined}*`, serveStatic({ root: './',
            getContent:async p => {
                return await fs.readFile(path.join(info.rootDir, info.config.path, p), "utf-8");
            }}))
    }
    }
}
