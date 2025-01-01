import { compilePack } from '@foundryvtt/foundryvtt-cli';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODULE_ID = path.join(__dirname, '..');
const yaml = true;

const packs = await fs.readdir(path.join(MODULE_ID, 'src', 'packs'));
for (const pack of packs) {
  if (pack === '.gitattributes') continue;
  console.log('Packing ' + pack);
  await compilePack(
    path.join(MODULE_ID, 'src', 'packs', pack),
    path.join(MODULE_ID, 'packs', pack),
    { yaml }
  );
}