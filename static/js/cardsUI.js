import { get, set } from "./saveLogic.js";
import { createJsonEditor } from "./sharedTabs.js";

function makeCardsTab() {
    return {
        name: 'Cards',
        render: (ctx) => {
            try {
                const { dataDiv, data, setCanClose } = ctx;

                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.gap = 'var(--spacing-lg)';

                const areas = [
                    { name: 'Jokers', path: 'cardAreas.jokers.cards' },
                    { name: 'Consumables', path: 'cardAreas.consumeables.cards' },
                    { name: 'Hand', path: 'cardAreas.hand.cards' },
                    { name: 'Deck', path: 'cardAreas.deck.cards' },
                    { name: 'Discard', path: 'cardAreas.discard.cards' },
                ];

                areas.forEach(area => {
                    const section = document.createElement('div');
                    section.className = 'form-section';

                    const title = document.createElement('div');
                    title.className = 'form-section-title';
                    title.style.display = 'flex';
                    title.style.justifyContent = 'space-between';
                    title.style.alignItems = 'center';

                    const titleText = document.createElement('span');
                    titleText.textContent = area.name;

                    const cardArray = get(data, area.path) || [];
                    const countBadge = document.createElement('span');
                    countBadge.textContent = Array.isArray(cardArray) ? cardArray.length : 0;
                    countBadge.style.backgroundColor = 'color-mix(in srgb, canvastext 20%, transparent)';
                    countBadge.style.padding = 'var(--spacing-xs) var(--spacing-sm)';
                    countBadge.style.borderRadius = 'var(--radius)';
                    countBadge.style.fontSize = '0.9rem';

                    title.appendChild(titleText);
                    title.appendChild(countBadge);
                    section.appendChild(title);

                    const buttonGroup = document.createElement('div');
                    buttonGroup.style.display = 'flex';
                    buttonGroup.style.gap = 'var(--spacing-sm)';
                    buttonGroup.style.flexWrap = 'wrap';

                    const viewBtn = document.createElement('button');
                    viewBtn.textContent = 'Edit JSON';
                    viewBtn.addEventListener('click', () => {
                        const cards = get(data, area.path) || [];
                        const json = JSON.stringify(cards, null, 2);
                        
                        const overlay = document.createElement('div');
                        overlay.style.position = 'fixed';
                        overlay.style.top = '0';
                        overlay.style.left = '0';
                        overlay.style.right = '0';
                        overlay.style.bottom = '0';
                        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
                        overlay.style.display = 'flex';
                        overlay.style.alignItems = 'center';
                        overlay.style.justifyContent = 'center';
                        overlay.style.zIndex = '1000';
                        overlay.style.padding = 'var(--spacing-lg)';

                        const modal = document.createElement('div');
                        modal.style.backgroundColor = getComputedStyle(document.body).backgroundColor || '#fff';
                        modal.style.color = getComputedStyle(document.body).color || '#000';
                        modal.style.padding = 'var(--spacing-lg)';
                        modal.style.borderRadius = 'var(--radius)';
                        modal.style.maxWidth = '50%';
                        modal.style.width = '100%';
                        modal.style.maxHeight = '85vh';
                        modal.style.height = '60%';
                        modal.style.display = 'flex';
                        modal.style.flexDirection = 'column';
                        modal.style.gap = 'var(--spacing-md)';
                        modal.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)';

                        const header = document.createElement('div');
                        header.style.display = 'flex';
                        header.style.justifyContent = 'space-between';
                        header.style.alignItems = 'center';
                        header.style.gap = 'var(--spacing-md)';

                        const heading = document.createElement('h3');
                        heading.textContent = area.name + ' JSON';
                        heading.style.margin = '0';
                        heading.style.flex = '1';

                        const headerBtns = document.createElement('div');
                        headerBtns.style.display = 'flex';
                        headerBtns.style.gap = 'var(--spacing-sm)';

                        const closeBtn = document.createElement('button');
                        closeBtn.textContent = '✕';
                        closeBtn.style.width = '2.4rem';
                        closeBtn.style.height = '2.4rem';
                        closeBtn.style.padding = '0';
                        closeBtn.style.fontSize = '1.2rem';
                        closeBtn.addEventListener('click', () => {
                            overlay.remove();
                        });
                        headerBtns.appendChild(closeBtn);

                        header.appendChild(heading);
                        header.appendChild(headerBtns);
                        modal.appendChild(header);

                        const editorHost = document.createElement('div');
                        const editor = createJsonEditor(editorHost, json, () => {});
                        editorHost.style.flex = '1';
                        modal.appendChild(editorHost);

                        const footer = document.createElement('div');
                        footer.style.display = 'flex';
                        footer.style.gap = 'var(--spacing-sm)';
                        footer.style.justifyContent = 'flex-end';

                        const saveBtn = document.createElement('button');
                        saveBtn.textContent = 'Save';
                        saveBtn.addEventListener('click', () => {
                            try {
                                const updated = JSON.parse(editor.getValue());
                                if (Array.isArray(updated)) {
                                    set(data, area.path, updated);
                                    countBadge.textContent = updated.length;
                                    setCanClose(true);
                                    overlay.remove();
                                } else {
                                    alert('Value must be an array');
                                }
                            } catch (e) {
                                alert('Invalid JSON: ' + e.message);
                            }
                        });
                        footer.appendChild(saveBtn);

                        const cancelBtn = document.createElement('button');
                        cancelBtn.textContent = 'Cancel';
                        cancelBtn.addEventListener('click', () => {
                            overlay.remove();
                        });
                        footer.appendChild(cancelBtn);

                        modal.appendChild(footer);
                        overlay.appendChild(modal);

                        overlay.addEventListener('click', (e) => {
                            if (e.target === overlay) {
                                overlay.remove();
                            }
                        });

                        document.body.appendChild(overlay);
                    });
                    buttonGroup.appendChild(viewBtn);

                    const clearBtn = document.createElement('button');
                    clearBtn.textContent = 'Clear All';
                    clearBtn.addEventListener('click', () => {
                        if (confirm('Clear all ' + area.name.toLowerCase() + '?')) {
                            set(data, area.path, []);
                            countBadge.textContent = '0';
                            setCanClose(true);
                        }
                    });
                    buttonGroup.appendChild(clearBtn);

                    section.appendChild(buttonGroup);
                    container.appendChild(section);
                });

                dataDiv.appendChild(container);
                setCanClose(true);
            } catch (e) {
                console.error(e);
                ctx.dataDiv.innerText = 'Error processing cards: ' + e.message;
            }
        },
        save: (ctx) => {
        }
    };
}

function makeCardEditorTab() {
    return {
        name: 'Add/Edit Cards',
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
                title.textContent = 'Paste Card JSON';
                section.appendChild(title);

                const hint = document.createElement('div');
                hint.style.fontSize = '0.85rem';
                hint.style.color = 'color-mix(in srgb, canvastext 70%, transparent)';
                hint.style.marginBottom = 'var(--spacing-md)';
                hint.textContent = 'Paste one or more card objects as JSON. Example: [{"suit":"H","value":"A"},{"suit":"D","value":"K"}]';
                section.appendChild(hint);

                        const editorHost = document.createElement('div');
                        const editor = createJsonEditor(editorHost, '', () => {});
                        section.appendChild(editorHost);

                const areaSelect = document.createElement('div');
                areaSelect.className = 'form-row';
                areaSelect.style.marginTop = 'var(--spacing-md)';

                const label = document.createElement('label');
                label.textContent = 'Target Area';
                areaSelect.appendChild(label);

                const select = document.createElement('select');
                select.style.padding = 'var(--spacing-sm)';
                select.style.borderRadius = 'var(--radius)';
                select.style.border = '1px solid color-mix(in srgb, canvastext 20%, transparent)';
                select.style.backgroundColor = 'color-mix(in srgb, canvas 96%, canvastext 4%)';
                select.style.color = 'inherit';
                select.style.fontSize = '0.95rem';
                select.style.cursor = 'pointer';

                const areas = [
                    { name: 'Jokers', path: 'cardAreas.jokers.cards' },
                    { name: 'Consumables', path: 'cardAreas.consumeables.cards' },
                    { name: 'Hand', path: 'cardAreas.hand.cards' },
                    { name: 'Deck', path: 'cardAreas.deck.cards' },
                    { name: 'Discard', path: 'cardAreas.discard.cards' },
                ];

                areas.forEach((area, idx) => {
                    const opt = document.createElement('option');
                    opt.value = area.path;
                    opt.textContent = area.name;
                    if (idx === 0) opt.selected = true;
                    select.appendChild(opt);
                });

                areaSelect.appendChild(select);
                section.appendChild(areaSelect);

                const actionBtns = document.createElement('div');
                actionBtns.style.display = 'flex';
                actionBtns.style.gap = 'var(--spacing-sm)';
                actionBtns.style.marginTop = 'var(--spacing-lg)';

                const replaceBtn = document.createElement('button');
                replaceBtn.textContent = 'Replace All';
                replaceBtn.addEventListener('click', () => {
                    try {
                        const json = JSON.parse(editor.getValue());
                        if (Array.isArray(json)) {
                            set(data, select.value, json);
                            setCanClose(true);
                            editor.setValue('');
                            alert('Replaced ' + json.length + ' cards');
                        } else {
                            alert('Must be an array of card objects');
                        }
                    } catch (e) {
                        alert('Invalid JSON: ' + e.message);
                    }
                });
                actionBtns.appendChild(replaceBtn);

                const appendBtn = document.createElement('button');
                appendBtn.textContent = 'Append';
                appendBtn.addEventListener('click', () => {
                    try {
                        const json = JSON.parse(editor.getValue());
                        const cards = Array.isArray(json) ? json : [json];
                        const existing = get(data, select.value) || [];
                        const updated = [...existing, ...cards];
                        set(data, select.value, updated);
                        setCanClose(true);
                        editor.setValue('');
                        alert('Added ' + cards.length + ' cards');
                    } catch (e) {
                        alert('Invalid JSON: ' + e.message);
                    }
                });
                actionBtns.appendChild(appendBtn);

                const clearBtn = document.createElement('button');
                clearBtn.textContent = 'Clear';
                clearBtn.style.backgroundColor = 'color-mix(in srgb, #e5484d 20%, canvas)';
                    clearBtn.addEventListener('click', () => {
                        editor.setValue('');
                    });
                actionBtns.appendChild(clearBtn);

                section.appendChild(actionBtns);
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

const cardsTabs = [
    makeCardsTab(),
    makeCardEditorTab(),
];

export {
    cardsTabs,
}