import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const dir = path.resolve('.apm');
const file = path.join(dir, 'project-mode.json');

mkdirSync(dir, { recursive: true });
writeFileSync(file, JSON.stringify({ mode: 'strict' }, null, 2), 'utf8');

console.log('[apm] Project mode set to: strict');
console.log('[apm] All package instructions will apply to every file.');
