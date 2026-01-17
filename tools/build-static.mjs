import { cp, rm, mkdir } from 'fs/promises';
import { join } from 'path';

async function exists(path) {
  try {
    await cp(path, path); // quick noop to test permissions
    return true;
  } catch {
    return false;
  }
}

async function run() {
  const projectRoot = join(process.cwd(), '..');
  const dist = join(projectRoot, 'dist');

  // Clean dist
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  // Items to copy
  const items = [
    'index.html',
    'assets',
    'icons',
    'javascript',
    'php',
    'portfolio',
    'pwa',
    'seiten',
    'stylesheets',
  ];

  for (const item of items) {
    const src = join(projectRoot, item);
    const dest = join(dist, item);
    try {
      await cp(src, dest, { recursive: true, force: true });
      console.log(`Copied: ${item}`);
    } catch (err) {
      console.warn(`Skip copy (missing?): ${item} -> ${err.message}`);
    }
  }

  console.log('Static build complete.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
