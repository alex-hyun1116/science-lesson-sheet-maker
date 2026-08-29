import fs from 'node:fs';
import path from 'node:path';

const input = process.argv[2] || 'recovery/edge-127-5173-leveldb/000004.log';
const output = process.argv[3] || 'data/recovered-from-edge.json';
const bytes = fs.readFileSync(input);

function readVarint(cursor) {
  let result = 0;
  let shift = 0;
  while (cursor.index < bytes.length) {
    const byte = bytes[cursor.index++];
    result |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) return result >>> 0;
    shift += 7;
  }
  throw new Error('Unexpected EOF while reading varint');
}

function readString(cursor, twoByte) {
  const length = readVarint(cursor);
  const start = cursor.index;
  const end = start + length;
  cursor.index = end;
  return bytes.subarray(start, end).toString(twoByte ? 'utf16le' : 'utf8');
}

function parseValue(cursor, depth = 0) {
  if (depth > 200) throw new Error('Too deep');
  let tag = bytes[cursor.index++];
  while (tag === 0x00) tag = bytes[cursor.index++];

  if (tag === 0xff) {
    readVarint(cursor);
    return parseValue(cursor, depth + 1);
  }
  if (tag === 0x22) return readString(cursor, false);
  if (tag === 0x63) return readString(cursor, true);
  if (tag === 0x30) return null;
  if (tag === 0x54) return true;
  if (tag === 0x46) return false;
  if (tag === 0x5f) return undefined;
  if (tag === 0x49) return readVarint(cursor);
  if (tag === 0x55) return readVarint(cursor);
  if (tag === 0x4e) {
    const value = bytes.readDoubleLE(cursor.index);
    cursor.index += 8;
    return value;
  }
  if (tag === 0x5e) {
    readVarint(cursor);
    return null;
  }
  if (tag === 0x5c) {
    cursor.index += 1;
    readVarint(cursor);
    return null;
  }

  if (tag === 0x6f) {
    const object = {};
    while (cursor.index < bytes.length && bytes[cursor.index] !== 0x7b) {
      const key = parseValue(cursor, depth + 1);
      const value = parseValue(cursor, depth + 1);
      if (typeof key === 'string') object[key] = value;
    }
    if (bytes[cursor.index] !== 0x7b) throw new Error('Object end not found');
    cursor.index += 1;
    readVarint(cursor);
    return object;
  }

  if (tag === 0x41) {
    const length = readVarint(cursor);
    const array = [];
    for (let index = 0; index < length; index += 1) array.push(parseValue(cursor, depth + 1));
    if (bytes[cursor.index] === 0x24) {
      cursor.index += 1;
      readVarint(cursor);
      readVarint(cursor);
    }
    return array;
  }

  if (tag === 0x61) {
    readVarint(cursor);
    const array = [];
    while (cursor.index < bytes.length && bytes[cursor.index] !== 0x40) {
      const key = parseValue(cursor, depth + 1);
      const value = parseValue(cursor, depth + 1);
      if (Number.isInteger(key)) array[key] = value;
    }
    if (bytes[cursor.index] === 0x40) {
      cursor.index += 1;
      readVarint(cursor);
      readVarint(cursor);
    }
    return array.filter((item) => item !== undefined);
  }

  throw new Error(`Unsupported tag 0x${tag.toString(16)} at ${cursor.index - 1}`);
}

function collectCandidates() {
  const candidates = [];
  for (let index = 0; index < bytes.length - 16; index += 1) {
    if (bytes[index] === 0xff && bytes[index + 1] === 0x10 && bytes[index + 2] === 0x6f) {
      const cursor = { index };
      try {
        const value = parseValue(cursor);
        if (value && Array.isArray(value.workbooks) && Array.isArray(value.problems)) {
          candidates.push({ offset: index, value });
        }
      } catch {
        // Keep scanning. LevelDB log records contain checksums and partial records too.
      }
    }
  }
  return candidates;
}

const candidates = collectCandidates();
const nonEmpty = candidates.filter((candidate) => candidate.value.workbooks.length > 0 || candidate.value.problems.length > 0);
const best = nonEmpty.at(-1);

console.log(`candidates=${candidates.length}`);
console.log(`nonEmpty=${nonEmpty.length}`);
if (!best) {
  console.log('No recoverable non-empty app state found.');
  process.exit(2);
}

const payload = {
  app: 'mathfarm-science-lessons',
  version: 1,
  recoveredAt: new Date().toISOString(),
  recoveredFrom: path.resolve(input),
  state: best.value,
};

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(payload, null, 2), 'utf8');
console.log(`offset=${best.offset}`);
console.log(`workbooks=${best.value.workbooks.length}`);
console.log(`problems=${best.value.problems.length}`);
console.log(`wrote=${output}`);
