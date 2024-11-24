# Hono + Hono JSX + Deno + DunnoPageloader
This is a Hono & Deno server with the minimal configuration using our own `pageloader` monorepo. For now it only detects react (`.tsx`) files

It dosent need any imports to your main file, just add the files directly to the `page` folder and boom! Your built-in Hono just showed up

And because Hono dosent have a Router like `express` does, you can just do this without any imports

```js
// deno-lint-ignore require-await
export default async (app: HonoApp) => {
    app.get("/gm", (c) => {
        return c.text("good morning!");
    });
};
```

The `HonoApp` type is from our predefined `Hono` class on [./types.d.ts](./types.d.ts), which is linked to our [main file](./main.ts)

You can even make a static folder by just making `root` folder inside `page`, then change the code on the main file
```js
await loader.load({static:["root"]},app)
```
Only the `root` folder name are special, because you cant really name your folder using slash, so i made the `root` folder special

And you can visit them on your website under `/`

Or another name like `assets` and add it to `page`. You can visit them on your website under `assets`. For this case, No need to change the [main file](./main.ts) because I already included it

## Installation
To install every dependecies that our projects needed, use
```shell
$ deno task init
```
To run without watcher, use 
```shell
$ deno task start
```
To run with a watcher, use 
```shell
$ deno task dev
```


## Future ideas
- Detect a separate `pageloader.json` file. Not just our own [pageloader.Config](./pageloader/mod.ts#14) code. Luckily, we use Typebox (a much lighter option to Zod) so its going to be easier to add it
- Detect both `.tsx` and `.ts` file. Plain Javscript is absolutely NOT SUPPORTED
- Befriend with Bun :handshake: (by adding `package.json`. But later for now)
