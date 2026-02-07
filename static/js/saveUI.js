import { calculatorTab } from "./calculatorCompat/calculatorExport.js";
import { makeValuesTab, rawTab } from "./sharedTabs.js";
import { get, set } from "./saveLogic.js";

const values = [
    {
        name: 'Progression',
        type: 'label',
    },
    {
        name: 'Round',
        path: 'GAME.round',
        type: 'number',
    },
    {
        name: 'Ante',
        path: 'GAME.round_resets.ante',
        type: 'number',
    },
    {
        name: 'Win Ante',
        path: 'GAME.win_ante',
        type: 'number',
    },
    {
        name: 'Bankrupt At',
        path: 'GAME.bankrupt_at',
        type: 'number',
    },

    {
        name: 'Finances',
        type: 'label',
    },
    {
        name: 'Money',
        path: 'GAME.dollars',
        type: 'number',
    },
    {
        name: 'Chips',
        path: 'GAME.chips',
        type: 'number',
    },
    {
        name: 'Chips Multiplier',
        path: 'GAME.mult',
        type: 'number',
    },

    {
        name: 'Resources',
        type: 'label',
    },
    {
        name: 'Hands Remaining',
        path: 'GAME.round_resets.hands',
        type: 'number',
    },
    {
        name: 'Discards Remaining',
        path: 'GAME.round_resets.discards',
        type: 'number',
    },
    {
        name: 'Reroll Cost',
        path: 'GAME.round_resets.reroll_cost',
        type: 'number',
    },

    {
        name: 'Limits',
        type: 'label',
    },
    {
        name: 'Hand Size',
        path: 'cardAreas.hand.config.card_limit',
        type: 'number',
    },
    {
        name: 'Joker Limit',
        path: 'cardAreas.jokers.config.card_limit',
        type: 'number',
    },
    {
        name: 'Consumable Limit',
        path: 'cardAreas.consumeables.config.card_limit',
        type: 'number',
    },

    {
        name: 'Shop',
        type: 'label',
    },
    {
        name: 'Shop Joker Max',
        path: 'GAME.shop.joker_max',
        type: 'number',
    },
    {
        name: 'Shop Current Level',
        path: 'GAME.shop.current_level',
        type: 'number',
    },

    {
        name: 'Probabilities',
        type: 'label',
    },
    {
        name: 'Normal Probability',
        path: 'GAME.probabilities.normal',
        type: 'number',
    },
    {
        name: 'Eternal Probability',
        path: 'GAME.probabilities.eternal',
        type: 'number',
    },
    {
        name: 'Perishable Probability',
        path: 'GAME.probabilities.perishable',
        type: 'number',
    },
    {
        name: 'Rental Probability',
        path: 'GAME.probabilities.rental',
        type: 'number',
    },

    {
        name: 'Seals',
        type: 'label',
    },
    {
        name: 'Gold Seal Probability',
        path: 'GAME.probabilities.seal_gold',
        type: 'number',
    },
    {
        name: 'Red Seal Probability',
        path: 'GAME.probabilities.seal_red',
        type: 'number',
    },
    {
        name: 'Purple Seal Probability',
        path: 'GAME.probabilities.seal_purple',
        type: 'number',
    },
    {
        name: 'Blue Seal Probability',
        path: 'GAME.probabilities.seal_blue',
        type: 'number',
    },

    {
        name: 'Editions',
        type: 'label',
    },
    {
        name: 'Holographic Edition Probability',
        path: 'GAME.probabilities.edition_holo',
        type: 'number',
    },
    {
        name: 'Foil Edition Probability',
        path: 'GAME.probabilities.edition_foil',
        type: 'number',
    },
    {
        name: 'Polychrome Edition Probability',
        path: 'GAME.probabilities.edition_poly',
        type: 'number',
    },

    {
        name: 'Modifiers & Effects',
        type: 'label',
    },
    {
        name: 'Shield',
        path: 'GAME.shield',
        type: 'number',
    },
    {
        name: 'Current Hand Played',
        path: 'GAME.current_round.hands_left',
        type: 'number',
    },
    {
        name: 'Voucher Slot Count',
        path: 'GAME.voucher_slot_count',
        type: 'number',
    },
    {
        name: 'Spectral Cards Seen',
        path: 'GAME.spectral_count',
        type: 'number',
    },

    {
        name: 'Game Settings',
        type: 'label',
    },
    {
        name: 'Seed Hash',
        path: 'GAME.seed_hash',
        type: 'text',
    },
];

function makeBulkImportTab() {
    return {
        name: 'Bulk Import',
        render: (ctx) => {
            try {
                const { dataDiv, data, setCanClose } = ctx;

                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.gap = 'var(--spacing-lg)';

                const section = document.createElement('div');
                section.className = 'form-section';

                const title = document.createElement('div');
                title.className = 'form-section-title';
                title.textContent = 'Bulk Value Import';
                section.appendChild(title);

                const hint = document.createElement('div');
                hint.style.fontSize = '0.85rem';
                hint.style.color = 'color-mix(in srgb, canvastext 70%, transparent)';
                hint.style.marginBottom = 'var(--spacing-md)';
                hint.innerHTML = 'Paste JSON object with paths as keys. Example: {"GAME.dollars": 10000, "GAME.chips": 5000}';
                section.appendChild(hint);

                const textarea = document.createElement('textarea');
                textarea.placeholder = 'Paste JSON object here...';
                textarea.style.minHeight = '200px';
                section.appendChild(textarea);

                const buttonGroup = document.createElement('div');
                buttonGroup.style.display = 'flex';
                buttonGroup.style.gap = 'var(--spacing-sm)';
                buttonGroup.style.marginTop = 'var(--spacing-lg)';

                const applyBtn = document.createElement('button');
                applyBtn.textContent = 'Apply Values';
                applyBtn.addEventListener('click', () => {
                    try {
                        const imported = JSON.parse(textarea.value);
                        let count = 0;
                        for (const [path, value] of Object.entries(imported)) {
                            set(data, path, value);
                            count++;
                        }
                        setCanClose(true);
                        textarea.value = '';
                        alert('Applied ' + count + ' values');
                    } catch (e) {
                        alert('Invalid JSON: ' + e.message);
                    }
                });
                buttonGroup.appendChild(applyBtn);

                const clearBtn = document.createElement('button');
                clearBtn.textContent = 'Clear';
                clearBtn.addEventListener('click', () => {
                    textarea.value = '';
                });
                buttonGroup.appendChild(clearBtn);

                const exportBtn = document.createElement('button');
                exportBtn.textContent = 'Export Current';
                exportBtn.addEventListener('click', () => {
                    const exportObj = {};
                    values.forEach(v => {
                        if (v.type !== 'label' && v.path) {
                            exportObj[v.path] = get(data, v.path);
                        }
                    });
                    textarea.value = JSON.stringify(exportObj, null, 2);
                });
                buttonGroup.appendChild(exportBtn);

                section.appendChild(buttonGroup);
                container.appendChild(section);
                dataDiv.appendChild(container);
                setCanClose(true);
            } catch (e) {
                console.error(e);
                ctx.dataDiv.innerText = 'Error: ' + e.message;
            }
        },
        save: (ctx) => {
        }
    };
}

const saveTabs = [
    makeValuesTab(values),
    makeBulkImportTab(),
    calculatorTab,
    rawTab,
];

export {
    saveTabs,
}