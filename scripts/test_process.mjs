import fs from 'fs';
import { decompress, rawToJSON } from '../src/helpers/loading.js';

const path = 'c:/Users/Colin/Documents/Github/balatro-save-loader/test-files/save-modded.jkr';
try {
  const buf = fs.readFileSync(path);
  const s = decompress(buf);
  console.log('DECOMPRESSED START:\n', s.slice(0, 500));
  try {
    const obj = rawToJSON(s);
    console.log('OK parsed root keys:', Object.keys(obj).slice(0, 20));
  } catch (e) {
    console.error('rawToJSON ERR', e.message);
    const lastReturn = s.lastIndexOf('return ');
    const relevant = lastReturn !== -1 ? s.slice(lastReturn + 7) : s;
    const firstBrace = relevant.indexOf('{');
    const snippet = firstBrace !== -1 ? relevant.slice(firstBrace, firstBrace + 1000) : relevant.slice(0, 1000);
    console.error('RELEVANT SNIPPET:\n', snippet);
      // if our error includes 'context:' from rawToJSON, print it nicely
      const m = String(e.message).match(/context:(.*)$/s);
      if (m) {
        console.error('\n--- JSON parse context (around error) ---\n', m[1]);
        try {
          console.error('JSON.stringify(context):', JSON.stringify(m[1]));
          const center = m[1];
          console.error('Context char codes:', Array.from(center).map(c=>c.charCodeAt(0)).slice(0,200));
        } catch (ex) {
          // ignore
        }
      }
  }
} catch (e) {
  console.error('ERR', e.message);
}
