import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the compact project dock", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /VIBE CODING/);
  assert.match(html, /Projects/);
  assert.match(html, /Pick one\. Open it\./);
  assert.doesNotMatch(html, /Things <em>I<\/em> build|Selected work|直接看作品|回到顶部/);
  assert.match(html, /Run Blue/);
  assert.match(html, /20 以内加减法/);
  assert.match(html, /biu_calendar/);
  assert.match(html, /mario-go/);
  assert.match(html, /cocos_practice/);
  assert.match(html, /基于 Cocos Creator 制作/);
  assert.match(html, /PDF Frames/);
  assert.match(html, /PhraseChu/);
  assert.match(html, /href="https:\/\/runblue\.yibuu\.com\/"/);
  assert.match(html, /href="https:\/\/math-train\.yibuu\.com\/"/);
  assert.doesNotMatch(html, /Recent activity/);
  assert.doesNotMatch(html, /搜索项目、技术栈、标签|aria-label="打开命令面板"/);
  assert.doesNotMatch(html, /IN DEVELOPMENT|PROJECT NODES|LAST SIGNAL|UPDATED|收藏项目|★|☆/);
  assert.doesNotMatch(html, /status-pill|filter-toggle|recent-strip/);
  assert.doesNotMatch(html, /biu-calendar-qr/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/);
});

test("keeps project content in data files", async () => {
  const [{ readFile }, { access }] = await Promise.all([
    import("node:fs/promises"),
    import("node:fs/promises"),
  ]);
  const [data, page, css, skeleton] = await Promise.all([
    readFile(new URL("../src/data/projects.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    access(new URL("../app/_sites-preview", import.meta.url)).then(() => true).catch(() => false),
  ]);

  assert.match(data, /export const projects/);
  assert.match(data, /run-blue/);
  assert.match(data, /pdf-frames/);
  assert.match(data, /biu-calendar/);
  assert.doesNotMatch(data, /seedling-pin|yibu-trail/);
  assert.match(page, /from "\.\.\/src\/data\/projects"/);
  assert.match(page, /target="_blank"/);
  assert.match(page, /onOpenQr/);
  assert.doesNotMatch(page, /scrollToSection|scrollIntoView/);
  assert.match(css, /overflow: clip/);
  assert.match(css, /prefers-reduced-motion/);
  assert.equal(skeleton, false);
});
