import { glob } from 'glob';
import CleanCSS from 'clean-css';
import { readFile, writeFile } from 'fs/promises';

async function run() {
  const files = await glob('../dist/**/*.css', { nodir: true });
  let savedTotal = 0;
  const cleaner = new CleanCSS({ level: 2 });
  for (const file of files) {
    const css = await readFile(file, 'utf8');
    const before = Buffer.byteLength(css, 'utf8');
    const { styles } = cleaner.minify(css);
    await writeFile(file, styles, 'utf8');
    const after = Buffer.byteLength(styles, 'utf8');
    savedTotal += before - after;
    console.log(`Minified CSS: ${file} → ${(before - after)} bytes saved`);
  }
  console.log(`Total CSS bytes saved: ${savedTotal}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
