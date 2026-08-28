#!/usr/bin/env node
/**
 * Smoke Lighthouse — lancer avec le serveur dev actif :
 *   npm run dev
 *   npm run lighthouse:smoke
 */
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

const base = process.env.LIGHTHOUSE_BASE_URL || "http://localhost:3000";
const outDir = "lighthouse-reports";

const pages = [
  { name: "home", path: "/" },
  { name: "blog", path: "/blog" },
  { name: "events", path: "/evenements" },
];

await mkdir(outDir, { recursive: true });

for (const page of pages) {
  const url = `${base}${page.path}`;
  const output = `${outDir}/${page.name}.html`;
  console.log(`\n▶ Lighthouse ${url}`);

  await new Promise((resolve, reject) => {
    const child = spawn(
      "npx",
      [
        "lighthouse",
        url,
        "--only-categories=performance,accessibility,best-practices,seo",
        "--form-factor=mobile",
        "--quiet",
        "--chrome-flags=--headless",
        `--output-path=${output}`,
        "--output=html",
      ],
      { stdio: "inherit", shell: true },
    );
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${page.name} failed`))));
  });
}

console.log(`\n✓ Rapports dans ./${outDir}/`);
