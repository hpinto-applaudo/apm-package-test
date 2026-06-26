import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const dir = path.resolve('.apm');
const file = path.join(dir, 'project-mode');

mkdirSync(dir, { recursive: true });
writeFileSync(file, 'strict', 'utf8');

console.log('[apm] Project mode set to: strict');
console.log('[apm] All package instructions will apply to every file.');
