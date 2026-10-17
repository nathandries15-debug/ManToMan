import { mkdir, copyFile } from 'node:fs/promises';
await mkdir(new URL('./dist/', import.meta.url), { recursive: true });
for (const file of ['index.html', 'style.css', 'app.js', 'workspace.js', 'workspace-model.js']) {
  await copyFile(new URL(file, import.meta.url), new URL(`dist/${file}`, import.meta.url));
}
console.log('Built static site in dist/');
