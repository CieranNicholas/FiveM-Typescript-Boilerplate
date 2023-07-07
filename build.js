import { build } from "esbuild";
import { readdirSync } from "fs";
import { join } from "path";

const production =
  process.argv.findIndex((argItem) => argItem === "--mode=production") >= 0;

const onRebuild = (context) => {
  return async (err, res) => {
    if (err) {
      return console.error(`[${context}]: Rebuild failed`, err);
    }

    console.log(`[${context}]: Rebuild succeeded, warnings:`, res.warnings);
  };
};

const server = {
  platform: "node",
  target: ["node16"],
  format: "cjs",
};

const client = {
  platform: "browser",
  target: ["chrome93"],
  format: "iife",
};

const directories = ["client", "server"];

for (const context of directories) {
  const files = readdirSync(context, { withFileTypes: true });

  const entryPoints = files
    .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".ts"))
    .map((dirent) => join(context, dirent.name));

  build({
    bundle: true,
    entryPoints,
    outdir: `dist/${context}`, // Specify the output directory
    watch: production
      ? false
      : {
          onRebuild: onRebuild(context),
        },
    ...(context === "client" ? client : server),
  })
    .then(() => console.log(`[${context}]: Built successfully!`))
    .catch(() => process.exit(1));
}
