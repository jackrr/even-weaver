import tailwind from "bun-plugin-tailwind";

await Bun.build({
  plugins: [tailwind],
  external: ["pg-hstore"], // sequelize fix
  outdir: "dist",
  entrypoints: ["src/index.ts"],
  target: "bun",
});
