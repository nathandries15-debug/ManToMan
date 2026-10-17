import test from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../server.js';
test('serves the experience and rejects unknown routes', async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(base);
    assert.equal(page.status, 200);
    const html = await page.text();
    for (const path of ['support', 'routine', 'health']) assert.ok(html.includes(`data-path="${path}"`));
    assert.ok(html.includes('Scripted responses'));
    assert.ok(html.includes('findahelpline.com'));
    for (const file of ['/app.js', '/style.css']) assert.equal((await fetch(base + file)).status, 200);
    assert.equal((await fetch(base + '/package.json')).status, 404);
    assert.equal((await fetch(base + '/missing')).status, 404);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
