import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { restaurantSeed } from './restaurantSeed.js';

const directory = resolve(process.env.DATA_DIR || 'storage');
const file = resolve(directory, 'restaurant.json');
let restaurant;
try { restaurant = JSON.parse(await readFile(file, 'utf8')); }
catch (error) {
  if (error.code !== 'ENOENT') throw error;
  restaurant = structuredClone(restaurantSeed);
}
let queue = Promise.resolve();
export const getRestaurant = () => structuredClone(restaurant);
export function changeRestaurant(change) {
  const operation = queue.then(async () => {
    const next = structuredClone(restaurant);
    change(next);
    await mkdir(directory, { recursive: true });
    await writeFile(`${file}.tmp`, JSON.stringify(next, null, 2));
    await rename(`${file}.tmp`, file);
    restaurant = next;
    return getRestaurant();
  });
  queue = operation.catch(() => {});
  return operation;
}
