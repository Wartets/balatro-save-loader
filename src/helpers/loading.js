import Pako from "pako";

const returnPrefix = /^return /;
const stringKeys = /\[\s*"([^"\\]*)"\s*\]\s*=\s*/g;
const numberKeys = /\[\s*(\d+)\s*\]\s*=\s*/g;
const trailingCommas = /,\s*}/g;

const numberKey = /"NOSTRING_(\d+)":/g
const stringKey = /"([^"]*?)":/g;

function decompress(data) {
  return Pako.inflateRaw(data, { to: "string" });
}

function compress(data) {
  return Pako.deflateRaw(data);
}

function rawToJSON(data) {
  // Some modded saves include Lua logic before the final return statement
  // (e.g. `if not OmegaMeta then return {...} end return {...}`).
  // In that case take the last `return ` and parse the table that follows.
  const lastReturn = data.lastIndexOf('return ');
  let relevant = lastReturn !== -1 ? data.slice(lastReturn + 7) : data;

  // Unescape any backslash-escaped quotes that may appear in some modded saves
  // e.g. transform \" into " so our further replacements work
  relevant = relevant.replace(/\\(["'])/g, '$1');

  // Extract the first balanced table starting at the first '{' to avoid surrounding Lua logic
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
      // Try a robust Lua-table parser instead of fragile regex-to-JSON conversions
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
          // identifiers: true, false, nil, or function calls
          const idStart = i;
          while (i < len && /[A-Za-z0-9_]/.test(src[i])) i++;
          const id = src.slice(idStart, i);
          if (id === 'true') return true;
          if (id === 'false') return false;
          if (id === 'nil') return null;
          skipWS();
          // function call like to_big({...},1)
          if (src[i] === '(') {
            i++; // skip '('
            skipWS();
            if (src[i] === '{') {
              const val = parseTable();
              // skip until matching ')'
              let depth = 1;
              while (i < len && depth > 0) {
                const ch = src[i++];
                if (ch === '(') depth++;
                else if (ch === ')') depth--;
              }
              return val;
            }
            // otherwise skip to closing ')'
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
          // expects src[i] === '{'
          i++; // skip '{'
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
                if (src[i] === '=') i++; // skip '='
                key = k;
              } else {
                // numeric key
                const num = parseNumberToken();
                skipWS(); if (src[i] === ']') i++; skipWS();
                if (src[i] === '=') i++; // skip '='
                key = `NOSTRING_${num}`;
              }
              skipWS();
              const val = parseValue();
              obj[key] = val;
            } else if (src[i] === '"' || src[i] === "'") {
              // value without explicit key (array style)
              const val = parseValue();
              obj[`NOSTRING_${index++}`] = val;
            } else {
              // maybe bare identifier key or malformed; try to read identifier key
              const idStart = i;
              while (i < len && /[A-Za-z0-9_]/.test(src[i])) i++;
              const id = src.slice(idStart, i);
              skipWS();
              if (src[i] === '=') { i++; const val = parseValue(); obj[id] = val; }
              else if (src[i] === ',') { i++; continue; }
              else { // fallback: parse a value
                const val = parseValue(); obj[`NOSTRING_${index++}`] = val; }
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

      // try parser
      try {
        const obj = parseLuaTable(tableStr);
        // debug: confirm parser success
        // console.debug('parseLuaTable succeeded');
        return obj;
      } catch (err) {
        // fallback to previous cleaned->JSON approach
      }
    }
  }
  // Fallback: try to parse whole relevant string
  // Try parsing the whole relevant string with a cleaned conversion from Lua to JSON
  function cleanLuaToJSON(src) {
    let out = src;
    // remove simple function wrappers like to_big({ ... },1) -> { ... }
    out = out.replace(/([a-zA-Z_]\w*)\s*\(\s*\{/g, '{');
    out = out.replace(/\},\s*\d+\s*\)/g, '}');
    // unescape any remaining escaped quotes
    out = out.replace(/\\(["'])/g, '$1');
    // convert ["key"] =  to "key":
    out = out.replace(/\[\s*"([^"\\]*)"\s*\]\s*=\s*/g, '"$1":');
    // convert [number] = to "NOSTRING_number":
    out = out.replace(/\[\s*(\d+)\s*\]\s*=\s*/g, '"NOSTRING_$1":');
    // convert bare key = value to "key":value
    out = out.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\s*=\s*/g, '"$1":');
    // remove trailing commas before closing braces
    out = out.replace(/,\s*}/g, '}');
    return out;
  }

  try {
    const cleanedAll = cleanLuaToJSON(relevant);
    return JSON.parse(cleanedAll);
  } catch (e) {
    // rethrow with snippet for debugging
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
    .replace(numberKey, "[$1]=")
    .replace(stringKey, "[\"$1\"]=");
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

export { decompress, compress, rawToJSON, JSONToRaw, processFile, processJSON, FixJSONArrays, FixLuaArrays};