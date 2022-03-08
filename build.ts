await Deno.run({ cmd: ["deno", "bundle", "app.ts", "bundle.js"] }).status();
