import { processFile, processJSON } from './balatro-save-loader.js';
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
    download.disabled = !canClose;
}

function initUI() {
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
                dataDiv.innerText = 'Error loading file: ' + e.message;
                updateInfo(null, file?.files?.[0] || null, 'error');
            }
        }
    };
    reader.readAsArrayBuffer(file?.files?.[0]);
}

initUI();