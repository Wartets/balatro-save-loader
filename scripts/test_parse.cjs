const fs = require('fs');
const zlib = require('zlib');
const path = 'c:/Users/Colin/Documents/Github/balatro-save-loader/test-files/save-modded.jkr';
try {
	const buf = fs.readFileSync(path);
	const s = zlib.inflateRawSync(buf).toString('utf8');
	const lastReturn = s.lastIndexOf('return ');
	let relevant = lastReturn !== -1 ? s.slice(lastReturn + 7) : s;
	console.log('---PARSED START---');
	console.log(relevant.slice(0, 1000));
	console.log('---TRY JSON.parse---');
	// mirrors the parsing logic used in the loader
	const stringKeys = /\[\s*\"(.*?)\"\s*\]\s*=\s*/g;
	const numberKeys = /\[\s*(\d+)\s*\]\s*=\s*/g;
	const trailingCommas = /,}/g;
	// remove simple function wrappers like to_big({ ... },1) -> { ... }
	relevant = relevant.replace(/([a-zA-Z_]\w*)\s*\(\s*\{/g, '{');
	relevant = relevant.replace(/\},\s*\d+\s*\)/g, '}');

	console.log('stringKeys.test(relevant)=', (function(){ const re=/\[\s*\"(.*?)\"\s*\]\s*=\s*/g; return re.test(relevant); })());
	console.log('numberKeys.test(relevant)=', (function(){ const re=/\[\s*(\d+)\s*\]\s*=\s*/g; return re.test(relevant); })());

	const jsonStr = relevant
		.replace(stringKeys, '\"$1\":')
		.replace(numberKeys, '\"NOSTRING_$1\":')
		.replace(trailingCommas, '}');
	console.log('---JSON STR PREVIEW---');
	console.log(jsonStr.slice(0, 1000));
	const obj = JSON.parse(jsonStr);
	console.log('OK parsed root keys:', Object.keys(obj).slice(0, 20));
} catch (e) {
	console.error('ERR', e.message);
}