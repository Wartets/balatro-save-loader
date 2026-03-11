const fs = require('fs');
const path = 'c:/Users/Colin/Documents/Github/balatro-save-loader/static/js/balatro-save-loader.js';
const s = fs.readFileSync(path, 'utf8');
let depth = 0;
let inStr = null;
let esc = false;
for (let i = 0; i < s.length; i++) {
  const ch = s[i];
  if (inStr) {
    if (esc) { esc = false; }
    else if (ch === '\\') { esc = true; }
    else if (ch === inStr) { inStr = null; }
    continue;
  }
  if (ch === '"' || ch === "'") { inStr = ch; continue; }
  if (ch === '{') depth++;
  if (ch === '}') depth--;
  if (depth < 0) { console.log('Extra closing brace at index', i); break; }
}
console.log('Final depth:', depth);
if (depth > 0) {
  // find approximate location of first unmatched '{'
  let count = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '{') {
      count++;
      if (count === 1) { console.log('First { at index', i); break; }
    }
  }
}
