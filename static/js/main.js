import { processFile, processJSON, decompress, compress, rawToJSON, FixJSONArrays } from './balatro-save-loader.js';
import { profileTabs } from './profileUI.js';
import { guessFileType, handleKnownArrays, get } from './saveLogic.js';
import { saveTabs } from './saveUI.js';
import { settingsTabs } from './settingsUI.js';
import { cardsTabs } from './cardsUI.js';
import { renderTabs } from './tabs.js';
import { unknownTabs } from './unknownUI.js';

const file = document.getElementById('file');
const download = document.getElementById('download');
const dataDiv = document.getElementById('data');
const buttonDiv = document.getElementById('buttons');
const infoName = document.getElementById('info-name');
const infoType = document.getElementById('info-type');
const infoSize = document.getElementById('info-size');
const infoJokers = document.getElementById('info-jokers');
const infoConsumables = document.getElementById('info-consumables');
const infoHand = document.getElementById('info-hand');
const infoDeck = document.getElementById('info-deck');
const infoDiscard = document.getElementById('info-discard');
const infoTotal = document.getElementById('info-total');

let data = null;
let filename = 'save.jkr';
let saveEverything = null;

function setCanClose(canClose) {
    // Function to enable or disable the download button based on canClose
    download.disabled = !canClose;
}

function initUI() {
    // Function to initialize the user interface and set up event listeners
    file?.addEventListener('change', readFile);

    download?.addEventListener('click', () => {
        if (!data) return;
        saveEverything?.()
        const buffer = processJSON(data);
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    });

    setCanClose(false);
    updateInfo(null, null, null);

    if (file?.files?.length) {
        readFile();
    }
}

function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

let _rawLoadOverlay = null;

function showRawLoadOverlay() {
    if (_rawLoadOverlay) return;
    const ov = document.createElement('div');
    ov.id = 'raw-load-overlay';
    ov.style.position = 'fixed';
    ov.style.bottom = '12px';
    ov.style.left = '12px';
    ov.style.zIndex = '10000';
    ov.style.background = 'rgba(0,0,0,0.7)';
    ov.style.color = 'white';
    ov.style.padding = '8px 10px';
    ov.style.borderRadius = '6px';
    ov.style.fontSize = '12px';
    ov.style.display = 'flex';
    ov.style.alignItems = 'center';
    ov.textContent = 'Loading raw...';
    const dot = document.createElement('span');
    dot.style.width = '10px';
    dot.style.height = '10px';
    dot.style.marginLeft = '8px';
    dot.style.borderRadius = '50%';
    dot.style.background = '#fff';
    dot.style.opacity = '0.9';
    ov.appendChild(dot);
    document.body.appendChild(ov);
    _rawLoadOverlay = ov;
}

function hideRawLoadOverlay() {
    if (!_rawLoadOverlay) return;
    _rawLoadOverlay.remove();
    _rawLoadOverlay = null;
}

function startAsyncLoad(raw, ta, onStarted) {
    // load the raw string into textarea in chunks to keep UI responsive
    return new Promise((resolve, reject) => {
        try {
            const total = raw.length;
            const chunkSize = Math.max(8192, Math.floor(total / 30)); // adapt chunk size
            let idx = 0;
            // if there's already some prefix in textarea, start after it
            const existing = ta.value || '';
            let existingLen = existing.length;
            if (existingLen > 0) {
                ta.value = existing; // keep
                idx = existingLen;
            }

            let overlayTimer = setTimeout(() => { showRawLoadOverlay(); if (onStarted) onStarted(); }, 200);

            function appendChunk() {
                const end = Math.min(idx + chunkSize, total);
                ta.value += raw.slice(idx, end);
                idx = end;
                if (idx < total) {
                    // yield to the event loop
                    setTimeout(appendChunk, 0);
                } else {
                    clearTimeout(overlayTimer);
                    hideRawLoadOverlay();
                    resolve();
                }
            }
            appendChunk();
        } catch (err) {
            hideRawLoadOverlay();
            reject(err);
        }
    });
}

function updateInfo(data, fileObj, type) {
    if (!infoName) return;
    infoName.textContent = fileObj?.name || '-';
    infoType.textContent = type || '-';
    infoSize.textContent = formatBytes(fileObj?.size);

    const jokers = get(data || {}, 'cardAreas.jokers.cards');
    const consumables = get(data || {}, 'cardAreas.consumeables.cards');
    const hand = get(data || {}, 'cardAreas.hand.cards');
    const deck = get(data || {}, 'cardAreas.deck.cards');
    const discard = get(data || {}, 'cardAreas.discard.cards');

    const jCount = Array.isArray(jokers) ? jokers.length : 0;
    const cCount = Array.isArray(consumables) ? consumables.length : 0;
    const hCount = Array.isArray(hand) ? hand.length : 0;
    const dCount = Array.isArray(deck) ? deck.length : 0;
    const diCount = Array.isArray(discard) ? discard.length : 0;
    const total = jCount + cCount + hCount + dCount + diCount;

    infoJokers.textContent = String(jCount);
    infoConsumables.textContent = String(cCount);
    infoHand.textContent = String(hCount);
    infoDeck.textContent = String(dCount);
    infoDiscard.textContent = String(diCount);
    infoTotal.textContent = String(total);
}

function readFile() {
    const reader = new FileReader();
    reader.onload = (e) => {
        const arrayBuffer = e.target?.result;
        if (arrayBuffer instanceof ArrayBuffer) {
            try {
                window.debugData =
                    data = processFile(arrayBuffer);
                handleKnownArrays(data);
                filename = file?.files?.[0]?.name || filename;
                const type = guessFileType(data, filename);
                let tabs = unknownTabs;
                switch (type) {
                    case 'save':
                        tabs = [...saveTabs, ...cardsTabs];
                        break;
                    case 'profile':
                        tabs = profileTabs;
                        break;
                    case 'settings':
                        tabs = settingsTabs;
                        break;
                }
                const tabData = renderTabs(tabs, { dataDiv, data, type }, buttonDiv, dataDiv);
                tabData.setCanClose = setCanClose;
                setCanClose(true);
                saveEverything = tabData.saveCurrent;
                updateInfo(data, file?.files?.[0] || null, type);
            } catch (e) {
                console.error(e);
                // Try to show decompressed raw preview so user can at least inspect and edit the data
                let message = 'Error loading file: ' + e.message;
                try {
                    const raw = decompress(arrayBuffer);
                    // build an editable textarea and controls so user can modify raw and re-save as .jkr
                    dataDiv.innerHTML = '';
                    const msg = document.createElement('div');
                    msg.textContent = message;
                    dataDiv.appendChild(msg);

                    const info = document.createElement('div');
                    info.style.marginTop = '8px';
                    info.textContent = 'Decompressed raw (you may edit and click "Save Raw" to re-compress):';
                    dataDiv.appendChild(info);

                    // detect heuristically if this decompressed content looks modded/contains extra Lua logic
                    const moddedHeuristic = (() => {
                        try {
                            const r = String(raw);
                            const returnCount = (r.match(/\breturn\b/g) || []).length;
                            if (returnCount > 1) return true;
                            if (/\bfunction\b/.test(r)) return true;
                            if (/\bif\b/.test(r) && /\bend\b/.test(r)) return true;
                            if (/[A-Za-z_]\w*\s*\(\s*\{/.test(r)) return true; // function wrapper like to_big({...},1)
                            return false;
                        } catch (e) { return false; }
                    })();

                    if (moddedHeuristic) {
                        const alertBox = document.createElement('div');
                        // lighter, in-page style matching neutral UI
                        alertBox.style.background = 'transparent';
                        alertBox.style.border = '1px solid rgba(0,0,0,0.08)';
                        alertBox.style.color = '#ff9696';
                        alertBox.style.padding = '10px 12px';
                        alertBox.style.marginTop = '8px';
                        alertBox.style.borderRadius = '6px';
                        alertBox.style.display = 'flex';
                        alertBox.style.alignItems = 'center';
                        alertBox.style.justifyContent = 'space-between';
                        alertBox.style.fontSize = '13px';
                        const msg = document.createElement('div');
                        msg.textContent = 'Notice — this file appears to be modded and contains extra Lua code. It may not open correctly in the editor. You can edit the raw and use "Try Parse Edited Raw", or save the raw manually.';
                        alertBox.appendChild(msg);
                        const dismiss = document.createElement('button');
                        dismiss.textContent = 'Close';
                        dismiss.style.marginLeft = '12px';
                        dismiss.style.background = 'transparent';
                        dismiss.style.border = 'none';
                        dismiss.style.color = '#0066cc';
                        dismiss.style.cursor = 'pointer';
                        dismiss.onclick = () => alertBox.remove();
                        alertBox.appendChild(dismiss);
                        dataDiv.appendChild(alertBox);
                    }

                    const ta = document.createElement('textarea');
                    // avoid huge initial DOM payload: load only a prefix, allow user to load full content on demand
                    const initialLoadLimit = 2000;
                    ta.value = raw.length > initialLoadLimit ? raw.slice(0, initialLoadLimit) : raw;
                    ta.style.width = '100%';
                    ta.style.height = '400px';
                    ta.style.whiteSpace = 'pre-wrap';
                    ta.style.fontFamily = 'monospace';
                    ta.style.fontSize = '12px';
                    ta.id = 'raw-editor';
                    dataDiv.appendChild(ta);

                    const ctrl = document.createElement('div');
                    ctrl.style.marginTop = '8px';
                    dataDiv.appendChild(ctrl);

                    const saveBtn = document.createElement('button');
                    saveBtn.textContent = 'Save Raw (.jkr)';
                    saveBtn.onclick = () => {
                        let text = ta.value || '';
                        if (!text.startsWith('return')) {
                            // ensure it has a return prefix as expected by the game save format
                            text = 'return ' + text;
                        }
                        try {
                            const buf = compress(text);
                            const blob = new Blob([buf], { type: 'application/octet-stream' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = (file?.files?.[0]?.name || filename) + '.jkr';
                            a.click();
                        } catch (ce) {
                            alert('Error compressing data: ' + ce.message);
                        }
                    };
                    ctrl.appendChild(saveBtn);

                    const tryParseBtn = document.createElement('button');
                    tryParseBtn.style.marginLeft = '8px';
                    tryParseBtn.textContent = 'Try Parse Edited Raw';
                    tryParseBtn.onclick = () => {
                        const text = ta.value || '';
                        try {
                            const j = rawToJSON(text);
                            data = FixJSONArrays ? FixJSONArrays(j) : j;
                            handleKnownArrays(data);
                            const type = guessFileType(data, filename);
                            const tabData = renderTabs(type === 'save' ? [...saveTabs, ...cardsTabs] : (type === 'profile' ? profileTabs : (type === 'settings' ? settingsTabs : unknownTabs)), { dataDiv, data, type }, buttonDiv, dataDiv);
                            tabData.setCanClose = setCanClose;
                            setCanClose(true);
                            saveEverything = tabData.saveCurrent;
                            updateInfo(data, file?.files?.[0] || null, type);
                        } catch (pe) {
                            alert('Parse failed: ' + (pe && pe.message ? pe.message : String(pe)));
                        }
                    };
                    ctrl.appendChild(tryParseBtn);

                    const loadFullBtn = document.createElement('button');
                    loadFullBtn.style.marginLeft = '8px';
                    loadFullBtn.textContent = 'Load full raw into editor';
                    let _asyncLoadStarted = false;
                    loadFullBtn.onclick = () => {
                        if (_asyncLoadStarted) return;
                        _asyncLoadStarted = true;
                        loadFullBtn.disabled = true;
                        startAsyncLoad(raw, ta).catch((err) => { console.error(err); alert('Load failed: ' + err.message); });
                    };
                    ctrl.appendChild(loadFullBtn);

                    // automatically start loading full raw asynchronously (non-blocking)
                    _asyncLoadStarted = true;
                    startAsyncLoad(raw, ta, () => { loadFullBtn.disabled = true; }).catch((err) => { console.error(err); });
                } catch (de) {
                    dataDiv.innerText = message;
                }
                updateInfo(null, file?.files?.[0] || null, 'error');
            }
        }
    };
    reader.readAsArrayBuffer(file?.files?.[0]);
}

initUI();