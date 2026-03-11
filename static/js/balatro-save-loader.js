import Pako from 'https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm';

const returnPrefix = /^return /;
const stringKeys = /\[\s*"([^"\\]*)"\s*\]\s*=\s*/g;
const numberKeys = /\[\s*(\d+)\s*\]\s*=\s*/g;
const trailingCommas = /,\s*}/g;

const numberKey = /"NOSTRING_(\d+)":/g;
const stringKey = /"([^"]*?)":/g;

function decompress(data) {
  const input = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  return Pako.inflateRaw(input, { to: 'string' });
}

function compress(data) {
  return Pako.deflateRaw(data);
}

function rawToJSON(data) {
  // Some saves (especially modded) may contain Lua logic before the final return.
  const lastReturn = data.lastIndexOf('return ');
  let relevant = lastReturn !== -1 ? data.slice(lastReturn + 7) : data;

  // Unescape common escaped quotes
  relevant = relevant.replace(/\\(["'])/g, '$1');

  // Try to extract first balanced table from the relevant tail and parse it with a lightweight Lua-table parser
  const firstBrace = relevant.indexOf('{');
  if (firstBrace !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    let quoteChar = null;
    let endIndex = -1;
    for (let i = firstBrace; i < relevant.length; i++) {
      const ch = relevant[i];
      if (inString) {
        if (escape) {
          escape = false;
        } else if (ch === '\\') {
          escape = true;
        } else if (ch === quoteChar) {
          inString = false;
          quoteChar = null;
        }
      } else {
        if (ch === '"' || ch === "'") {
          inString = true;
          quoteChar = ch;
        } else if (ch === '{') {
          depth++;
        } else if (ch === '}') {
          depth--;
          if (depth === 0) {
            endIndex = i;
            break;
          }
        }
      }
    }
    if (endIndex !== -1) {
      let tableStr = relevant.slice(firstBrace, endIndex + 1);

      function parseLuaTable(src) {
        let i = 0;
        const len = src.length;
        function skipWS() {
          while (i < len && /\s/.test(src[i])) i++;
        }
        function parseString() {
          const quote = src[i++];
          let out = '';
          while (i < len) {
            const ch = src[i++];
            if (ch === quote) return out;
            if (ch === '\\') {
              const next = src[i++];
              if (next === 'n') out += '\n';
              else if (next === 'r') out += '\r';
              else if (next === 't') out += '\t';
              else out += next || '';
            } else {
              out += ch;
            }
          }
          return out;
        }
        function parseNumberToken() {
          const start = i;
          if (src[i] === '-' || src[i] === '+') i++;
          while (i < len && /[0-9\.eE+-]/.test(src[i])) i++;
          const token = src.slice(start, i);
          if (token.indexOf('.') !== -1 || /[eE]/.test(token)) return parseFloat(token);
          return parseInt(token, 10);
        }
        function parseValue() {
          skipWS();
          if (src[i] === '{') return parseTable();
          if (src[i] === '"' || src[i] === "'") return parseString();
          if (/[0-9\-]/.test(src[i])) return parseNumberToken();
          const idStart = i;
          while (i < len && /[A-Za-z0-9_]/.test(src[i])) i++;
          const id = src.slice(idStart, i);
          if (id === 'true') return true;
          if (id === 'false') return false;
          if (id === 'nil') return null;
          skipWS();
          if (src[i] === '(') {
            i++;
            skipWS();
            if (src[i] === '{') {
              const val = parseTable();
              let depth = 1;
              while (i < len && depth > 0) {
                const ch = src[i++];
                if (ch === '(') depth++;
                else if (ch === ')') depth--;
              }
              return val;
            }
            let depth = 1;
            while (i < len && depth > 0) {
              const ch = src[i++];
              if (ch === '(') depth++;
              else if (ch === ')') depth--;
            }
            return null;
          }
          return id;
        }
        function parseTable() {
          i++;
          const obj = {};
          let index = 1;
          skipWS();
          while (i < len && src[i] !== '}') {
            skipWS();
            if (src[i] === ',') { i++; skipWS(); continue; }
            let key = null;
            if (src[i] === '[') {
              i++; skipWS();
              if (src[i] === '"' || src[i] === "'") {
                const k = parseString();
                skipWS(); if (src[i] === ']') i++; skipWS();
                if (src[i] === '=') i++;
                key = k;
              } else {
                const num = parseNumberToken();
                skipWS(); if (src[i] === ']') i++; skipWS();
                if (src[i] === '=') i++;
                key = `NOSTRING_${num}`;
              }
              skipWS();
              const val = parseValue();
              obj[key] = val;
            } else if (src[i] === '"' || src[i] === "'") {
              const val = parseValue();
              obj[`NOSTRING_${index++}`] = val;
            } else {
              const idStart = i;
              while (i < len && /[A-Za-z0-9_]/.test(src[i])) i++;
              const id = src.slice(idStart, i);
              skipWS();
              if (src[i] === '=') { i++; const val = parseValue(); obj[id] = val; }
              else if (src[i] === ',') { i++; continue; }
              else { const val = parseValue(); obj[`NOSTRING_${index++}`] = val; }
            }
            skipWS();
            if (src[i] === ',') { i++; skipWS(); }
          }
          if (src[i] === '}') i++;
          return obj;
        }
        skipWS();
        return parseValue();
      }

      try {
        const obj = parseLuaTable(tableStr);
        return obj;
      } catch (err) {
        // fallthrough to cleaned JSON fallback
      }
    }
  }

  function cleanLuaToJSON(src) {
    let out = src;
    out = out.replace(/([a-zA-Z_]\w*)\s*\(\s*\{/g, '{');
    out = out.replace(/\},\s*\d+\s*\)/g, '}');
    out = out.replace(/\\(["'])/g, '$1');
    out = out.replace(/\[\s*"([^"\\]*)"\s*\]\s*=\s*/g, '"$1":');
    out = out.replace(/\[\s*(\d+)\s*\]\s*=\s*/g, '"NOSTRING_$1":');
    out = out.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\s*=\s*/g, '"$1":');
    out = out.replace(/,\s*}/g, '}');
    return out;
  }

  try {
    const cleanedAll = cleanLuaToJSON(relevant);
    return JSON.parse(cleanedAll);
  } catch (e) {
    throw new Error(e.message + ' -- final-clean-snippet: ' + relevant.slice(0, 300));
  }
}

function FixJSONArrays (json) {
  if(typeof json !== 'object' || json === null) {
    return json;
  }
  const keys = Object.keys(json);
  if(keys.length === 0) {
    return json;
  }
  if(!keys.every((key) => key.startsWith('NOSTRING_'))) {
    for(const key of keys) {
      json[key] = FixJSONArrays(json[key]);
    }
    return json;
  }
  const array = [];
  for(const key of keys) {
    // -1 cause lua is 1 indexed
    array[parseInt(key.slice(9)) - 1] = FixJSONArrays(json[key]);
  }
  return array;
}

function FixLuaArrays (json) {
  if(Array.isArray(json)) {
    const array = {};
    for(let i = 0; i < json.length; i++) {
      // +1 cause lua is 1 indexed
      array[`NOSTRING_${i + 1}`] = FixLuaArrays(json[i]);
    }
    return array;
  }
  if(typeof json === 'object' && json !== null) {
    for(const key in json) {
      json[key] = FixLuaArrays(json[key]);
    }
  }
  return json;

}

function JSONToRaw(data) {
  return 'return ' + JSON.stringify(data)
    .replace(numberKey, '[$1]=')
    .replace(stringKey, '["$1"]=');
};

function processFile(buffer) {
  const data = decompress(buffer);
  const json = rawToJSON(data);
  return FixJSONArrays(json);
}

function processJSON(json) {
  json = FixLuaArrays(json);
  const data = JSONToRaw(json);
  return compress(data);
}

export { decompress, compress, rawToJSON, JSONToRaw, processFile, processJSON, FixJSONArrays, FixLuaArrays };