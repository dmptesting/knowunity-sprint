// Fails if a raw hex colour appears anywhere in app/. Colours come from
// build/css/tokens.css (generated from tokens/tokens.json), never typed in.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'app';
const EXTENSIONS = /\.(css|ts|tsx)$/;
// #rgb, #rgba, #rrggbb, #rrggbbaa. The & guard skips HTML entities like &#039;.
const HEX = /(?<!&)#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;

let found = 0;

for (const file of readdirSync(ROOT, { recursive: true })) {
  if (!EXTENSIONS.test(file)) continue;
  const path = join(ROOT, file);
  readFileSync(path, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const [hex] of line.matchAll(HEX)) {
        console.log(`${path}:${i + 1}  ${hex}`);
        found++;
      }
    });
}

if (found > 0) {
  console.error(`\n${found} raw hex colour(s) found. Use a token from build/css/tokens.css instead.`);
  process.exit(1);
}
console.log('No raw hex colours in app/.');
