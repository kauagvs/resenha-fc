// Gera dist-artifact/resenha-fc.html: o build do Vite num arquivo só, no formato de página
// do claude.ai (sem <html>/<head>/<body>, que o claude.ai acrescenta ao publicar).
// Rode depois de `vite build`.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const html = readFileSync("dist/index.html", "utf8");
const asset = (path) => readFileSync(`dist${path}`, "utf8");

const head = html.match(/<head>([\s\S]*)<\/head>/)?.[1] ?? "";
const body = html.match(/<body>([\s\S]*)<\/body>/)?.[1] ?? "";

const title = head.match(/<title>[\s\S]*?<\/title>/)?.[0];
// Links externos (Google Fonts) ficam como estão; o CSS e o JS do build entram inline.
const keep = [...head.matchAll(/<link\s[^>]*href="https:[^>]*>/g)].map((m) =>
  m[0].replace(/\s+/g, " "),
);
const inlineScripts = [...head.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[0]);
const css = [...head.matchAll(/<link\s[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/g)]
  .map((m) => asset(m[1]))
  .join("\n");
const js = [...head.matchAll(/<script\s[^>]*src="(\/assets\/[^"]+\.js)"[^>]*><\/script>/g)]
  .map((m) => asset(m[1]).replace(/<\/script/gi, "<\\/script"))
  .join("\n");

if (!title || !css || !js) throw new Error("dist/index.html não tem o formato esperado do Vite.");

const page = [
  title,
  '<meta name="claude:viewport-fit-sides" content="cover">',
  ...keep,
  `<style>${css}</style>`,
  ...inlineScripts,
  body.replace(/<script type="module"[\s\S]*?<\/script>/g, "").trim(),
  `<script type="module">${js}</script>`,
].join("\n");

mkdirSync("dist-artifact", { recursive: true });
writeFileSync("dist-artifact/resenha-fc.html", page);
console.log(`dist-artifact/resenha-fc.html (${(page.length / 1024).toFixed(0)} kB)`);
