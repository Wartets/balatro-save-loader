import { calculatorTab } from "./calculatorCompat/calculatorExport.js";
import { makeValuesTab, rawTab, createJsonEditor } from "./sharedTabs.js";
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
        altPaths: ['GAME.round_resets.blind_ante'],
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
        name: 'Interest Amount',
        path: 'GAME.interest_amount',
        type: 'number',
    },
    {
        name: 'Inflation',
        path: 'GAME.inflation',
        type: 'number',
    },
    {
        name: 'Perishable Rounds',
        path: 'GAME.perishable_rounds',
        type: 'number',
    },
    {
        name: 'Round Bonus Discards',
        path: 'GAME.round_bonus.discards',
        type: 'number',
    },
    {
        name: 'Round Bonus Hands',
        path: 'GAME.round_bonus.next_hands',
        type: 'number',
    },
    {
        name: 'Max Jokers',
        path: 'GAME.max_jokers',
        type: 'number',
    },
    {
        name: 'Current Boss Streak',
        path: 'GAME.current_boss_streak',
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
        name: 'Hands Played',
        path: 'GAME.hands_played',
        type: 'number',
    },
    {
        name: 'Unused Discards',
        path: 'GAME.unused_discards',
        type: 'number',
    },
    {
        name: 'Hands Remaining',
        path: 'GAME.round_resets.hands',
        altPaths: ['GAME.current_round.hands_left'],
        type: 'number',
    },
    {
        name: 'Discards Remaining',
        path: 'GAME.round_resets.discards',
        altPaths: ['GAME.current_round.discards_left'],
        type: 'number',
    },
    {
        name: 'Reroll Cost',
        path: 'GAME.round_resets.reroll_cost',
        altPaths: ['GAME.current_round.reroll_cost'],
        type: 'number',
    },
    {
        name: 'Blind On Deck',
        path: 'GAME.blind_on_deck',
        type: 'text',
    },
    {
        name: 'Previous Round Dollars',
        path: 'GAME.previous_round.dollars',
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
        name: 'Skips',
        path: 'GAME.skips',
        type: 'number',
    },
    {
        name: 'Tag Tally',
        path: 'GAME.tag_tally',
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
        name: 'Current Discards Left',
        path: 'GAME.current_round.discards_left',
        type: 'number',
    },
    {
        name: 'Current Round Dollars',
        path: 'GAME.current_round.round_dollars',
        type: 'number',
    },
    {
        name: 'Current Round Cards Flipped',
        path: 'GAME.current_round.cards_flipped',
        type: 'number',
    },
    {
        name: 'Current Round Discards Used',
        path: 'GAME.current_round.discards_used',
        type: 'number',
    },
    {
        name: 'Current Round Jokers Purchased',
        path: 'GAME.current_round.jokers_purchased',
        type: 'number',
    },
    {
        name: 'Current Round Reroll Cost',
        path: 'GAME.current_round.reroll_cost',
        type: 'number',
    },
    {
        name: 'Current Round Reroll Increase',
        path: 'GAME.current_round.reroll_cost_increase',
        type: 'number',
    },
    {
        name: 'Current Round Free Rerolls',
        path: 'GAME.current_round.free_rerolls',
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
        name: 'Starting Deck Size',
        path: 'GAME.starting_deck_size',
        type: 'number',
    },
    {
        name: 'Won',
        path: 'GAME.won',
        type: 'checkbox',
    },
    {
        name: 'First Shop Buffoon',
        path: 'GAME.first_shop_buffoon',
        type: 'checkbox',
    },
    {
        name: 'Last Hand Played',
        path: 'GAME.last_hand_played',
        type: 'text',
    },
    {
        name: 'Last Tarot Planet',
        path: 'GAME.last_tarot_planet',
        type: 'text',
    },
    {
        name: 'Subhash',
        path: 'GAME.subhash',
        type: 'text',
    },

    {
        name: 'Game Settings',
        type: 'label',
    },
    {
        name: 'Chips Text',
        path: 'GAME.chips_text',
        type: 'text',
    },
    {
        name: 'Selected Back',
        path: 'GAME.selected_back',
        type: 'text',
    },
    {
        name: 'Selected Back Details',
        path: 'GAME.selected_back_key',
        type: 'json',
    },
    {
        name: 'Last Blind Details',
        path: 'GAME.last_blind',
        type: 'json',
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

                const editorHost = document.createElement('div');
                const editor = createJsonEditor(editorHost, '', () => {
                    setCanClose(true);
                });
                section.appendChild(editorHost);

                const buttonGroup = document.createElement('div');
                buttonGroup.style.display = 'flex';
                buttonGroup.style.gap = 'var(--spacing-sm)';
                buttonGroup.style.marginTop = 'var(--spacing-lg)';

                const applyBtn = document.createElement('button');
                applyBtn.textContent = 'Apply Values';
                applyBtn.addEventListener('click', () => {
                    try {
                        const imported = JSON.parse(editor.getValue());
                        let count = 0;
                        for (const [path, value] of Object.entries(imported)) {
                            set(data, path, value);
                            count++;
                        }
                        setCanClose(true);
                        editor.setValue('');
                        alert('Applied ' + count + ' values');
                    } catch (e) {
                        alert('Invalid JSON: ' + e.message);
                    }
                });
                buttonGroup.appendChild(applyBtn);

                const clearBtn = document.createElement('button');
                clearBtn.textContent = 'Clear';
                clearBtn.addEventListener('click', () => {
                    editor.setValue('');
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
                    editor.setValue(JSON.stringify(exportObj, null, 2));
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

function makeSectionEditorTab() {
    return {
        name: 'Section Editor',
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
                title.textContent = 'Edit JSON Section';
                section.appendChild(title);

                const row = document.createElement('div');
                row.className = 'form-row';
                row.style.gridTemplateColumns = '1fr';

                const label = document.createElement('label');
                label.textContent = 'Section';
                row.appendChild(label);

                const select = document.createElement('select');
                select.style.padding = 'var(--spacing-sm)';
                select.style.borderRadius = 'var(--radius)';
                select.style.border = '1px solid color-mix(in srgb, canvastext 20%, transparent)';
                select.style.backgroundColor = 'color-mix(in srgb, canvas 96%, canvastext 4%)';
                select.style.color = 'inherit';
                select.style.fontSize = '0.95rem';
                select.style.cursor = 'pointer';

                const sections = [
                    { name: 'GAME', path: 'GAME' },
                    { name: 'Round Resets', path: 'GAME.round_resets' },
                    { name: 'Current Round', path: 'GAME.current_round' },
                    { name: 'Probabilities', path: 'GAME.probabilities' },
                    { name: 'Shop', path: 'GAME.shop' },
                    { name: 'Card Areas', path: 'cardAreas' },
                    { name: 'Hand', path: 'cardAreas.hand' },
                    { name: 'Deck', path: 'cardAreas.deck' },
                    { name: 'Discard', path: 'cardAreas.discard' },
                    { name: 'Consumables', path: 'cardAreas.consumeables' },
                    { name: 'Jokers', path: 'cardAreas.jokers' },
                ];

                sections.forEach((s, i) => {
                    const opt = document.createElement('option');
                    opt.value = s.path;
                    opt.textContent = s.name;
                    if (i === 0) opt.selected = true;
                    select.appendChild(opt);
                });

                row.appendChild(select);
                section.appendChild(row);

                const editorHost = document.createElement('div');
                const status = document.createElement('div');
                status.className = 'status-line';
                const initialValue = JSON.stringify(get(data, select.value) ?? {}, null, 2);
                const editor = createJsonEditor(editorHost, initialValue, (valueText) => {
                    if (valueText.trim() === '') {
                        status.textContent = '';
                        setCanClose(false);
                        return;
                    }
                    try {
                        JSON.parse(valueText);
                        status.textContent = 'Valid JSON';
                        status.dataset.state = 'ok';
                        setCanClose(true);
                    } catch (e) {
                        status.textContent = 'Invalid JSON: ' + e.message;
                        status.dataset.state = 'error';
                        setCanClose(false);
                    }
                });

                select.addEventListener('change', () => {
                    const value = get(data, select.value) ?? {};
                    editor.setValue(JSON.stringify(value, null, 2));
                    status.textContent = 'Valid JSON';
                    status.dataset.state = 'ok';
                });

                const buttonRow = document.createElement('div');
                buttonRow.style.display = 'flex';
                buttonRow.style.gap = 'var(--spacing-sm)';
                buttonRow.style.justifyContent = 'flex-end';

                const saveBtn = document.createElement('button');
                saveBtn.textContent = 'Apply Section';
                saveBtn.addEventListener('click', () => {
                    try {
                        const parsed = JSON.parse(editor.getValue());
                        set(data, select.value, parsed);
                        setCanClose(true);
                    } catch (e) {
                        alert('Invalid JSON: ' + e.message);
                    }
                });
                buttonRow.appendChild(saveBtn);

                container.appendChild(section);
                container.appendChild(editorHost);
                container.appendChild(status);
                container.appendChild(buttonRow);
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

function makePresetsTab() {
    return {
        name: 'Presets',
        render: (ctx) => {
            try {
                const { dataDiv, data, setCanClose } = ctx;
                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.gap = 'var(--spacing-lg)';

                const ensureArray = (path) => {
                    const current = get(data, path);
                    if (Array.isArray(current)) return current;
                    const created = [];
                    set(data, path, created);
                    return created;
                };

                const shuffle = (arr) => {
                    for (let i = arr.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        const temp = arr[i];
                        arr[i] = arr[j];
                        arr[j] = temp;
                    }
                };

                const makeCard = (title, desc, action) => {
                    const card = document.createElement('div');
                    card.className = 'preset-card';
                    const h = document.createElement('div');
                    h.className = 'preset-title';
                    h.textContent = title;
                    const p = document.createElement('div');
                    p.className = 'preset-desc';
                    p.textContent = desc;
                    const b = document.createElement('button');
                    b.textContent = 'Apply';
                    b.addEventListener('click', () => {
                        action();
                        setCanClose(true);
                    });
                    card.appendChild(h);
                    card.appendChild(p);
                    card.appendChild(b);
                    return card;
                };

                const makeSection = (title, items) => {
                    const section = document.createElement('div');
                    section.className = 'form-section';
                    const header = document.createElement('div');
                    header.className = 'form-section-title';
                    header.textContent = title;
                    const grid = document.createElement('div');
                    grid.className = 'preset-grid';
                    items.forEach((item) => grid.appendChild(makeCard(item.title, item.desc, item.action)));
                    section.appendChild(header);
                    section.appendChild(grid);
                    container.appendChild(section);
                };

                makeSection('Economy & Shop', [
                    {
                        title: 'Max Money',
                        desc: 'Set dollars to 99999',
                        action: () => set(data, 'GAME.dollars', 99999),
                    },
                    {
                        title: 'Max Chips',
                        desc: 'Set chips to 99999 and mult to 999',
                        action: () => {
                            set(data, 'GAME.chips', 99999);
                            set(data, 'GAME.mult', 999);
                        },
                    },
                    {
                        title: 'Free Rerolls',
                        desc: 'Set reroll cost to 0',
                        action: () => {
                            set(data, 'GAME.round_resets.reroll_cost', 0);
                            set(data, 'GAME.current_round.reroll_cost', 0);
                        },
                    },
                    {
                        title: 'Shop Boost',
                        desc: 'Increase shop joker max and voucher slots',
                        action: () => {
                            set(data, 'GAME.shop.joker_max', 10);
                            set(data, 'GAME.voucher_slot_count', 10);
                        },
                    },
                    {
                        title: 'Max Hands/Discards',
                        desc: 'Set hands and discards to 99',
                        action: () => {
                            set(data, 'GAME.round_resets.hands', 99);
                            set(data, 'GAME.round_resets.discards', 99);
                            set(data, 'GAME.current_round.hands_left', 99);
                            set(data, 'GAME.current_round.discards_left', 99);
                        },
                    },
                ]);

                makeSection('Jokers', [
                    {
                        title: 'Clear Jokers',
                        desc: 'Remove all jokers',
                        action: () => set(data, 'cardAreas.jokers.cards', []),
                    },
                    {
                        title: 'Duplicate First Joker',
                        desc: 'Clone the first joker into all slots',
                        action: () => {
                            const jokers = ensureArray('cardAreas.jokers.cards');
                            if (jokers.length === 0) return;
                            const limit = get(data, 'cardAreas.jokers.config.card_limit') ?? get(data, 'GAME.max_jokers') ?? jokers.length;
                            const source = jokers[0];
                            while (jokers.length < limit) {
                                jokers.push(JSON.parse(JSON.stringify(source)));
                            }
                            set(data, 'cardAreas.jokers.cards', jokers);
                        },
                    },
                    {
                        title: 'Max Joker Slots',
                        desc: 'Set joker capacity to 12',
                        action: () => {
                            set(data, 'GAME.max_jokers', 12);
                            set(data, 'cardAreas.jokers.config.card_limit', 12);
                        },
                    },
                ]);

                makeSection('Vouchers', [
                    {
                        title: 'Enable Common Vouchers',
                        desc: 'Mark common vouchers as used',
                        action: () => {
                            const current = get(data, 'GAME.used_vouchers') || {};
                            const next = { ...current };
                            [
                                'v_overstock',
                                'v_overstock_plus',
                                'v_clearance_sale',
                                'v_liquidation',
                                'v_reroll_surplus',
                                'v_reroll_glut',
                                'v_grabber',
                                'v_nacho_tong',
                                'v_wasteful',
                                'v_wasteful_plus',
                                'v_seed_money',
                                'v_money_tree',
                                'v_omen_globe',
                                'v_observatory',
                            ].forEach((key) => {
                                next[key] = true;
                            });
                            set(data, 'GAME.used_vouchers', next);
                        },
                    },
                    {
                        title: 'Reset Vouchers',
                        desc: 'Clear used voucher list',
                        action: () => set(data, 'GAME.used_vouchers', {}),
                    },
                    {
                        title: 'Voucher Slots 10',
                        desc: 'Set voucher slots to 10',
                        action: () => set(data, 'GAME.voucher_slot_count', 10),
                    },
                ]);

                makeSection('Playing Cards', [
                    {
                        title: 'Draw 5 to Hand',
                        desc: 'Move up to 5 cards from deck to hand',
                        action: () => {
                            const deck = ensureArray('cardAreas.deck.cards');
                            const hand = ensureArray('cardAreas.hand.cards');
                            const count = Math.min(5, deck.length);
                            for (let i = 0; i < count; i++) {
                                hand.push(deck.shift());
                            }
                            set(data, 'cardAreas.deck.cards', deck);
                            set(data, 'cardAreas.hand.cards', hand);
                        },
                    },
                    {
                        title: 'Shuffle Deck',
                        desc: 'Randomize deck order',
                        action: () => {
                            const deck = ensureArray('cardAreas.deck.cards');
                            shuffle(deck);
                            set(data, 'cardAreas.deck.cards', deck);
                        },
                    },
                    {
                        title: 'Move Discard to Deck',
                        desc: 'Move all discard cards back to the deck',
                        action: () => {
                            const deck = ensureArray('cardAreas.deck.cards');
                            const discard = ensureArray('cardAreas.discard.cards');
                            deck.push(...discard);
                            discard.length = 0;
                            set(data, 'cardAreas.deck.cards', deck);
                            set(data, 'cardAreas.discard.cards', discard);
                        },
                    },
                    {
                        title: 'Send Hand to Discard',
                        desc: 'Move all hand cards to discard',
                        action: () => {
                            const hand = ensureArray('cardAreas.hand.cards');
                            const discard = ensureArray('cardAreas.discard.cards');
                            discard.push(...hand);
                            hand.length = 0;
                            set(data, 'cardAreas.hand.cards', hand);
                            set(data, 'cardAreas.discard.cards', discard);
                        },
                    },
                    {
                        title: 'Clear Hand',
                        desc: 'Remove all hand cards',
                        action: () => set(data, 'cardAreas.hand.cards', []),
                    },
                    {
                        title: 'Trim Deck to 52',
                        desc: 'Keep only the first 52 cards in deck',
                        action: () => {
                            const deck = ensureArray('cardAreas.deck.cards');
                            deck.length = Math.min(deck.length, 52);
                            set(data, 'cardAreas.deck.cards', deck);
                        },
                    },
                    {
                        title: 'Copy Hand to Deck',
                        desc: 'Duplicate hand cards into deck',
                        action: () => {
                            const hand = ensureArray('cardAreas.hand.cards');
                            const deck = ensureArray('cardAreas.deck.cards');
                            hand.forEach((card) => {
                                deck.push(JSON.parse(JSON.stringify(card)));
                            });
                            set(data, 'cardAreas.deck.cards', deck);
                        },
                    },
                ]);

                makeSection('Probabilities', [
                    {
                        title: 'Max Probabilities',
                        desc: 'Set all probabilities to 1',
                        action: () => {
                            set(data, 'GAME.probabilities.normal', 1);
                            set(data, 'GAME.probabilities.eternal', 1);
                            set(data, 'GAME.probabilities.perishable', 1);
                            set(data, 'GAME.probabilities.rental', 1);
                            set(data, 'GAME.probabilities.seal_gold', 1);
                            set(data, 'GAME.probabilities.seal_red', 1);
                            set(data, 'GAME.probabilities.seal_purple', 1);
                            set(data, 'GAME.probabilities.seal_blue', 1);
                            set(data, 'GAME.probabilities.edition_holo', 1);
                            set(data, 'GAME.probabilities.edition_foil', 1);
                            set(data, 'GAME.probabilities.edition_poly', 1);
                        },
                    },
                    {
                        title: 'Reset Probabilities',
                        desc: 'Set all probabilities to 0',
                        action: () => {
                            set(data, 'GAME.probabilities.normal', 0);
                            set(data, 'GAME.probabilities.eternal', 0);
                            set(data, 'GAME.probabilities.perishable', 0);
                            set(data, 'GAME.probabilities.rental', 0);
                            set(data, 'GAME.probabilities.seal_gold', 0);
                            set(data, 'GAME.probabilities.seal_red', 0);
                            set(data, 'GAME.probabilities.seal_purple', 0);
                            set(data, 'GAME.probabilities.seal_blue', 0);
                            set(data, 'GAME.probabilities.edition_holo', 0);
                            set(data, 'GAME.probabilities.edition_foil', 0);
                            set(data, 'GAME.probabilities.edition_poly', 0);
                        },
                    },
                ]);

                const toolsSection = document.createElement('div');
                toolsSection.className = 'form-section';

                const toolsTitle = document.createElement('div');
                toolsTitle.className = 'form-section-title';
                toolsTitle.textContent = 'Tags & Tools';
                toolsSection.appendChild(toolsTitle);

                const tagsHint = document.createElement('div');
                tagsHint.style.fontSize = '0.85rem';
                tagsHint.style.color = 'color-mix(in srgb, canvastext 70%, transparent)';
                tagsHint.textContent = 'Import or append tags as a JSON array.';
                toolsSection.appendChild(tagsHint);

                const tagsEditorHost = document.createElement('div');
                const tagsValue = JSON.stringify(get(data, 'tags') ?? [], null, 2);
                const tagsEditor = createJsonEditor(tagsEditorHost, tagsValue, () => {});
                toolsSection.appendChild(tagsEditorHost);

                const tagsButtons = document.createElement('div');
                tagsButtons.style.display = 'flex';
                tagsButtons.style.gap = 'var(--spacing-sm)';
                tagsButtons.style.flexWrap = 'wrap';
                tagsButtons.style.marginTop = 'var(--spacing-md)';

                const applyTags = document.createElement('button');
                applyTags.textContent = 'Apply Tags';
                applyTags.addEventListener('click', () => {
                    try {
                        const parsed = JSON.parse(tagsEditor.getValue());
                        if (!Array.isArray(parsed)) {
                            alert('Tags must be an array');
                            return;
                        }
                        set(data, 'tags', parsed);
                        setCanClose(true);
                    } catch (e) {
                        alert('Invalid JSON: ' + e.message);
                    }
                });

                const appendTags = document.createElement('button');
                appendTags.textContent = 'Append Tags';
                appendTags.addEventListener('click', () => {
                    try {
                        const parsed = JSON.parse(tagsEditor.getValue());
                        if (!Array.isArray(parsed)) {
                            alert('Tags must be an array');
                            return;
                        }
                        const current = get(data, 'tags') ?? [];
                        const merged = [...current];
                        parsed.forEach((tag) => {
                            const key = typeof tag === 'string' ? tag : JSON.stringify(tag);
                            const exists = merged.some((t) => (typeof t === 'string' ? t : JSON.stringify(t)) === key);
                            if (!exists) merged.push(tag);
                        });
                        set(data, 'tags', merged);
                        setCanClose(true);
                    } catch (e) {
                        alert('Invalid JSON: ' + e.message);
                    }
                });

                const clearTags = document.createElement('button');
                clearTags.textContent = 'Clear Tags';
                clearTags.addEventListener('click', () => {
                    set(data, 'tags', []);
                    tagsEditor.setValue('[]');
                    setCanClose(true);
                });

                tagsButtons.appendChild(applyTags);
                tagsButtons.appendChild(appendTags);
                tagsButtons.appendChild(clearTags);
                toolsSection.appendChild(tagsButtons);

                const patchTitle = document.createElement('div');
                patchTitle.className = 'form-section-title';
                patchTitle.textContent = 'Quick Patch';
                toolsSection.appendChild(patchTitle);

                const patchRow = document.createElement('div');
                patchRow.className = 'form-row';
                patchRow.style.gridTemplateColumns = '1fr';

                const pathInput = document.createElement('input');
                pathInput.type = 'text';
                pathInput.placeholder = 'Path (ex: GAME.dollars or cardAreas.jokers.cards)';
                patchRow.appendChild(pathInput);

                const patchEditorHost = document.createElement('div');
                const patchEditor = createJsonEditor(patchEditorHost, '', () => {});
                patchRow.appendChild(patchEditorHost);

                toolsSection.appendChild(patchRow);

                const patchButtons = document.createElement('div');
                patchButtons.style.display = 'flex';
                patchButtons.style.gap = 'var(--spacing-sm)';
                patchButtons.style.flexWrap = 'wrap';

                const applyPatch = document.createElement('button');
                applyPatch.textContent = 'Apply Patch';
                applyPatch.addEventListener('click', () => {
                    const path = pathInput.value.trim();
                    if (!path) {
                        alert('Path is required');
                        return;
                    }
                    const raw = patchEditor.getValue();
                    try {
                        const parsed = raw.trim() === '' ? null : JSON.parse(raw);
                        set(data, path, parsed);
                        setCanClose(true);
                    } catch (e) {
                        set(data, path, raw);
                        setCanClose(true);
                    }
                });

                const clearPatch = document.createElement('button');
                clearPatch.textContent = 'Clear Patch';
                clearPatch.addEventListener('click', () => {
                    pathInput.value = '';
                    patchEditor.setValue('');
                });

                patchButtons.appendChild(applyPatch);
                patchButtons.appendChild(clearPatch);
                toolsSection.appendChild(patchButtons);

                container.appendChild(toolsSection);
                dataDiv.appendChild(container);
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
    makeSectionEditorTab(),
    makePresetsTab(),
    calculatorTab,
    rawTab,
];

export {
    saveTabs,
}