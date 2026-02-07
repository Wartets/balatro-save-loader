import { get, set } from "./saveLogic.js";

function createJsonEditor(parent, initialValue, onChange) {
    const buildEditor = (cm, value) => {
        const { EditorState, EditorView, json, basicSetup } = cm;
        const updateListener = EditorView.updateListener.of((v) => {
            if (v.docChanged) {
                onChange(v.state.doc.toString());
            }
        });
        const state = EditorState.create({
            doc: value,
            extensions: [
                ...(basicSetup ? [basicSetup] : []),
                json(),
                EditorView.lineWrapping,
                updateListener,
            ],
        });
        const view = new EditorView({ state, parent });
        parent.classList.add('code-editor');
        return {
            getValue: () => view.state.doc.toString(),
            setValue: (next) => view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } }),
            focus: () => view.focus(),
            destroy: () => view.destroy(),
        };
    };

    const cm = window.CodeMirrorJSON;
    if (cm?.EditorView && cm?.EditorState) {
        try {
            return buildEditor(cm, initialValue);
        } catch (e) {
        }
    }

    const textarea = document.createElement('textarea');
    textarea.value = initialValue;
    textarea.addEventListener('input', () => onChange(textarea.value));
    parent.appendChild(textarea);

    const handle = {
        getValue: () => textarea.value,
        setValue: (value) => { textarea.value = value; },
        focus: () => textarea.focus(),
        destroy: () => {},
    };

    let attempts = 0;
    const maxAttempts = 50;
    const interval = setInterval(() => {
        const cmRetry = window.CodeMirrorJSON;
        if (cmRetry?.EditorView && cmRetry?.EditorState) {
            try {
                const value = textarea.value;
                const editor = buildEditor(cmRetry, value);
                textarea.remove();
                handle.getValue = editor.getValue;
                handle.setValue = editor.setValue;
                handle.focus = editor.focus;
                handle.destroy = editor.destroy;
                clearInterval(interval);
            } catch (e) {
                attempts += 1;
                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                }
            }
        } else {
            attempts += 1;
            if (attempts >= maxAttempts) {
                clearInterval(interval);
            }
        }
    }, 150);

    return handle;
}

function validateJsonValue(value, statusEl, setCanClose) {
    try {
        JSON.parse(value);
        statusEl.textContent = 'Valid JSON';
        statusEl.dataset.state = 'ok';
        setCanClose(true);
    } catch (e) {
        statusEl.textContent = 'Invalid JSON: ' + e.message;
        statusEl.dataset.state = 'error';
        setCanClose(false);
    }
}

const rawTab = {
    name: 'Raw',
    render: (ctx) => {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = 'var(--spacing-md)';

        const controlBar = document.createElement('div');
        controlBar.style.display = 'flex';
        controlBar.style.gap = 'var(--spacing-sm)';
        controlBar.style.flexWrap = 'wrap';

        const status = document.createElement('div');
        status.className = 'status-line';

        const editorHost = document.createElement('div');
        const editor = createJsonEditor(editorHost, JSON.stringify(ctx.data, null, 2), (value) => {
            validateJsonValue(value, status, ctx.setCanClose);
        });
        ctx.dataDiv._rawEditor = editor;

        const formatBtn = document.createElement('button');
        formatBtn.textContent = 'Format';
        formatBtn.addEventListener('click', () => {
            try {
                const parsed = JSON.parse(editor.getValue());
                editor.setValue(JSON.stringify(parsed, null, 2));
                validateJsonValue(editor.getValue(), status, ctx.setCanClose);
            } catch (e) {
                validateJsonValue(editor.getValue(), status, ctx.setCanClose);
            }
        });

        const minifyBtn = document.createElement('button');
        minifyBtn.textContent = 'Minify';
        minifyBtn.addEventListener('click', () => {
            try {
                const parsed = JSON.parse(editor.getValue());
                editor.setValue(JSON.stringify(parsed));
                validateJsonValue(editor.getValue(), status, ctx.setCanClose);
            } catch (e) {
                validateJsonValue(editor.getValue(), status, ctx.setCanClose);
            }
        });

        const validateBtn = document.createElement('button');
        validateBtn.textContent = 'Validate';
        validateBtn.addEventListener('click', () => {
            validateJsonValue(editor.getValue(), status, ctx.setCanClose);
        });

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(editor.getValue()).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            });
        });

        controlBar.appendChild(formatBtn);
        controlBar.appendChild(minifyBtn);
        controlBar.appendChild(validateBtn);
        controlBar.appendChild(copyBtn);

        container.appendChild(controlBar);
        container.appendChild(status);
        container.appendChild(editorHost);
        ctx.dataDiv.appendChild(container);
        validateJsonValue(editor.getValue(), status, ctx.setCanClose);
    },
    save: (ctx) => {
        try {
            const editor = ctx.dataDiv._rawEditor;
            const value = editor?.getValue ? editor.getValue() : ctx.dataDiv.querySelector('textarea')?.value;
            if (!value) return;
            const raw = JSON.parse(value);
            if (raw && typeof raw === 'object') {
                Object.keys(ctx.data).forEach((key) => {
                    delete ctx.data[key];
                });
                Object.assign(ctx.data, raw);
            }
        } catch (e) {
            console.error(e);
        }
    }
};

function makeValuesTab(values) {
    return {
        name: 'Values',
        render: (ctx) => {
            try {
                const { dataDiv, data, setCanClose } = ctx;
                const tools = document.createElement('div');
                tools.className = 'form-tools';

                const filterInput = document.createElement('input');
                filterInput.type = 'search';
                filterInput.placeholder = 'Filter fields';
                filterInput.className = 'filter-input';
                tools.appendChild(filterInput);

                const showEmptyLabel = document.createElement('label');
                showEmptyLabel.className = 'toggle-label';
                const showEmpty = document.createElement('input');
                showEmpty.type = 'checkbox';
                showEmpty.checked = true;
                showEmptyLabel.appendChild(showEmpty);
                showEmptyLabel.appendChild(document.createTextNode('Show empty'));
                tools.appendChild(showEmptyLabel);

                const sectionSelect = document.createElement('select');
                sectionSelect.className = 'section-select';
                const sectionDefault = document.createElement('option');
                sectionDefault.textContent = 'Jump to section';
                sectionDefault.value = '';
                sectionDefault.selected = true;
                sectionDefault.disabled = true;
                sectionSelect.appendChild(sectionDefault);
                tools.appendChild(sectionSelect);

                const expandBtn = document.createElement('button');
                expandBtn.textContent = 'Expand All';
                tools.appendChild(expandBtn);

                const collapseBtn = document.createElement('button');
                collapseBtn.textContent = 'Collapse All';
                tools.appendChild(collapseBtn);

                const form = document.createElement('form');
                form.style.display = 'flex';
                form.style.flexDirection = 'column';
                form.style.gap = 'var(--spacing-lg)';

                let currentSection = null;

                values.forEach((value) => {
                    if (value.type === 'label') {
                        currentSection = document.createElement('div');
                        currentSection.className = 'form-section';

                        const title = document.createElement('div');
                        title.className = 'form-section-title';

                        if (value.name) {
                            const opt = document.createElement('option');
                            opt.value = value.name;
                            opt.textContent = value.name;
                            sectionSelect.appendChild(opt);
                        }

                        const titleRow = document.createElement('div');
                        titleRow.className = 'section-header';

                        const titleText = document.createElement('span');
                        titleText.textContent = value.name;
                        titleRow.appendChild(titleText);

                        const toggleBtn = document.createElement('button');
                        toggleBtn.type = 'button';
                        toggleBtn.className = 'collapse-toggle';
                        toggleBtn.textContent = 'Collapse';
                        toggleBtn.addEventListener('click', () => {
                            const collapsed = currentSection.classList.toggle('collapsed');
                            toggleBtn.textContent = collapsed ? 'Expand' : 'Collapse';
                        });
                        titleRow.appendChild(toggleBtn);

                        title.appendChild(titleRow);
                        currentSection.appendChild(title);

                        form.appendChild(currentSection);
                    } else {
                        if (!currentSection) {
                            currentSection = document.createElement('div');
                            currentSection.className = 'form-section';
                            form.appendChild(currentSection);
                        }

                        const row = document.createElement('div');
                        row.className = 'form-row';

                        const label = document.createElement('label');
                        label.textContent = value.name;
                        if (value.path) {
                            const hint = document.createElement('div');
                            hint.className = 'path-hint';
                            hint.textContent = value.path;
                            label.appendChild(hint);
                        }
                        row.appendChild(label);

                        row.dataset.search = `${value.name} ${value.path}`.toLowerCase();

                        const resolveValue = () => {
                            let currentVal = get(data, value.path);
                            if (currentVal === undefined && Array.isArray(value.altPaths)) {
                                for (const alt of value.altPaths) {
                                    const altVal = get(data, alt);
                                    if (altVal !== undefined) {
                                        currentVal = altVal;
                                        break;
                                    }
                                }
                            }
                            return currentVal;
                        };

                        if (value.type === 'json') {
                            row.style.gridTemplateColumns = '1fr';
                            const editorHost = document.createElement('div');
                            const status = document.createElement('div');
                            status.className = 'status-line';
                            const currentVal = resolveValue();
                            row.dataset.empty = currentVal === undefined || currentVal === null || currentVal === '' ? '1' : '0';
                            const initial = currentVal !== undefined && currentVal !== null ? JSON.stringify(currentVal, null, 2) : '';
                            const editor = createJsonEditor(editorHost, initial, (valueText) => {
                                validateJsonValue(valueText, status, setCanClose);
                            });
                            row.appendChild(editorHost);
                            row.appendChild(status);
                            status.textContent = initial ? 'Valid JSON' : '';
                            row.dataset.editor = value.path;
                            row._editor = editor;
                        } else if (value.type === 'multiline') {
                            row.style.gridTemplateColumns = '1fr';
                            const textarea = document.createElement('textarea');
                            const currentVal = resolveValue();
                            row.dataset.empty = currentVal === undefined || currentVal === null || currentVal === '' ? '1' : '0';
                            textarea.value = currentVal !== undefined && currentVal !== null ? String(currentVal) : '';
                            textarea.placeholder = value.placeholder ?? value.name;
                            textarea.name = value.path;
                            textarea.addEventListener('change', () => {
                                set(data, value.path, textarea.value);
                                setCanClose(true);
                            });
                            row.appendChild(textarea);
                        } else {
                            const input = document.createElement('input');
                            input.type = value.type || 'text';
                            const currentVal = resolveValue();
                            row.dataset.empty = currentVal === undefined || currentVal === null || currentVal === '' ? '1' : '0';
                            if (value.type === 'checkbox') {
                                if (currentVal !== undefined && currentVal !== null) {
                                    input.checked = Boolean(currentVal);
                                } else if (value.default !== undefined) {
                                    input.checked = Boolean(value.default);
                                } else {
                                    input.checked = false;
                                }
                            } else {
                                if (currentVal !== undefined && currentVal !== null) {
                                    input.value = typeof currentVal === 'object' ? JSON.stringify(currentVal) : String(currentVal);
                                } else if (value.default !== undefined && value.default !== null) {
                                    input.value = String(value.default);
                                } else {
                                    input.value = '';
                                }
                            }
                            if (value.type === 'number') {
                                input.step = value.step ?? 'any';
                                input.min = value.min ?? '';
                                input.max = value.max ?? '';
                            }
                            input.placeholder = value.placeholder ?? value.name;
                            input.name = value.path;
                            const handleChange = () => {
                                if (!input.reportValidity()) {
                                    setCanClose(false);
                                    return;
                                }
                                saveFormInput(input, value.type, value.path, data);
                                setCanClose(true);
                            };
                            input.addEventListener('change', handleChange);
                            input.addEventListener('blur', handleChange);
                            row.appendChild(input);
                        }
                        currentSection.appendChild(row);
                    }
                });

                form.addEventListener('submit', (e) => e.preventDefault());
                dataDiv.appendChild(tools);
                dataDiv.appendChild(form);

                const applyFilter = () => {
                    const query = filterInput.value.trim().toLowerCase();
                    const rows = form.querySelectorAll('.form-row');
                    rows.forEach((row) => {
                        const hideEmpty = !showEmpty.checked && row.dataset.empty === '1';
                        if (!query) {
                            row.style.display = hideEmpty ? 'none' : '';
                        } else {
                            const hay = row.dataset.search || '';
                            row.style.display = hay.includes(query) && !hideEmpty ? '' : 'none';
                        }
                    });
                    const sections = form.querySelectorAll('.form-section');
                    sections.forEach((section) => {
                        const visible = Array.from(section.querySelectorAll('.form-row')).some((row) => row.style.display !== 'none');
                        section.style.display = visible ? '' : 'none';
                    });
                };
                filterInput.addEventListener('input', applyFilter);
                showEmpty.addEventListener('change', applyFilter);
                sectionSelect.addEventListener('change', () => {
                    const name = sectionSelect.value;
                    if (!name) return;
                    const section = Array.from(form.querySelectorAll('.form-section')).find((s) => s.querySelector('.section-header span')?.textContent === name);
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
                expandBtn.addEventListener('click', () => {
                    form.querySelectorAll('.form-section').forEach((section) => {
                        section.classList.remove('collapsed');
                        const toggle = section.querySelector('.collapse-toggle');
                        if (toggle) toggle.textContent = 'Collapse';
                    });
                });
                collapseBtn.addEventListener('click', () => {
                    form.querySelectorAll('.form-section').forEach((section) => {
                        section.classList.add('collapsed');
                        const toggle = section.querySelector('.collapse-toggle');
                        if (toggle) toggle.textContent = 'Expand';
                    });
                });
            } catch (e) {
                console.error(e);
                ctx.dataDiv.innerText = 'Error processing data: ' + e.message;
            }
        },
        save: (ctx) => {
            try {
                const form = ctx.dataDiv.querySelector('form');
                if (!form) return;
                const inputs = form.querySelectorAll('input');
                inputs.forEach((input) => {
                    if (!input.name || input.name === '') return;
                    if (input.type === 'checkbox') {
                        set(ctx.data, input.name, Boolean(input.checked));
                    } else if (input.type === 'number') {
                        const value = input.value.trim();
                        if (value === '') return;
                        const num = Number(value);
                        if (!isNaN(num) && isFinite(num)) {
                            set(ctx.data, input.name, num);
                        }
                    } else if (input.value !== '') {
                        set(ctx.data, input.name, input.value);
                    }
                });
                const editors = form.querySelectorAll('.form-row');
                editors.forEach((row) => {
                    if (row._editor && row.dataset.editor) {
                        try {
                            const value = row._editor.getValue();
                            if (value && value.trim() !== '') {
                                const parsed = JSON.parse(value);
                                set(ctx.data, row.dataset.editor, parsed);
                            }
                        } catch (e) {
                        }
                    }
                });
            } catch (e) {
                console.error('Error saving values:', e);
            }
        }
    };
}

function validateInputs(e) {
    const input = e.target;
    switch (input.type) {
        case 'number':
            const number = Number(input.value);
            if (input.value === '') {
                input.setCustomValidity('');
            } else if (isNaN(number)) {
                input.setCustomValidity('Please enter a valid number');
            } else {
                input.setCustomValidity('');
            }
            break;
    }
    input.reportValidity();
}

function saveFormInput(input, type, path, data) {
    try {
        if (type === 'number') {
            const value = input.value.trim();
            if (value === '') {
                return;
            }
            const number = Number(value);
            if (!isNaN(number) && isFinite(number)) {
                set(data, path, number);
            }
        } else if (type === 'checkbox') {
            set(data, path, Boolean(input.checked));
        } else if (type === 'text') {
            set(data, path, input.value);
        } else {
            set(data, path, input.value);
        }
    } catch (e) {
        console.error('Error saving form input:', e, 'path:', path, 'value:', input.value);
    }
}

export {
    rawTab,
    makeValuesTab,
    createJsonEditor,
}