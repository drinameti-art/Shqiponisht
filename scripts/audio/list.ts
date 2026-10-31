/// <reference types="node" />
// Writes scripts/audio/sayables.json: everything the app can pronounce.
import { writeFileSync } from 'node:fs';

import { allSayables } from '../../src/lib/sayables';

const list = allSayables();
writeFileSync(new URL('./sayables.json', import.meta.url), JSON.stringify(list, null, 1) + '\n');
console.log(`${list.length} sayables`);
