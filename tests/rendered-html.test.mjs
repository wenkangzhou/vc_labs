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

test("server-renders the project launchpad", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Chou&#x27;s Infinite Labs/);
  assert.match(html, /Things <em>I<\/em> build/);
  assert.match(html, /Project nodes/);
  assert.match(html, /Run Blue/);
  assert.match(html, /20 以内加减法/);
  assert.match(html, /biu_calendar/);
  assert.match(html, /mario-go/);
  assert.match(html, /cocos_practice/);
  assert.match(html, /PDF Frames/);
  assert.match(html, /Recent activity/);
  assert.match(html, /搜索项目、技术栈、标签/);
  assert.match(html, /aria-label="打开命令面板"/);
  assert.doesNotMatch(html, /SCAN WITH WECHAT|biu-calendar-qr/);
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
  assert.match(css, /prefers-reduced-motion/);
  assert.equal(skeleton, false);
});
