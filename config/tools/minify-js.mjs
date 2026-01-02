import { glob } from 'glob';
import { minify } from 'terser';
import { readFile, writeFile } from 'fs/promises';

async function run() {
  const files = await glob('../dist/**/*.js', { nodir: true });
  let savedTotal = 0;
  for (const file of files) {
    const code = await readFile(file, 'utf8');
    const before = Buffer.byteLength(code, 'utf8');
    const result = await minify(code, {
      compress: { drop_console: true, drop_debugger: true },
      mangle: true,
      format: { comments: false },
    });
    if (result.code) {
      await writeFile(file, result.code, 'utf8');
      const after = Buffer.byteLength(result.code, 'utf8');
      savedTotal += before - after;
      console.log(`Minified JS: ${file} → ${(before - after)} bytes saved`);
    }
  }
  console.log(`Total JS bytes saved: ${savedTotal}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
