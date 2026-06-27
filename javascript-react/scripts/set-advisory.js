import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const dir = path.resolve('.apm');
const file = path.join(dir, 'project-mode.json');

mkdirSync(dir, { recursive: true });
writeFileSync(file, JSON.stringify({ mode: 'advisory' }, null, 2), 'utf8');

console.log('[apm] Project mode set to: advisory');
console.log(
  '[apm] Quality instructions will apply to new and modified files only.',
);
console.log('[apm] critical-donts remains universally enforced.');
