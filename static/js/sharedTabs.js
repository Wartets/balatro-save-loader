import { get, set } from "./saveLogic.js";

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

        const formatBtn = document.createElement('button');
        formatBtn.textContent = 'Format';
        formatBtn.addEventListener('click', () => {
            try {
                const parsed = JSON.parse(textarea.value);
                textarea.value = JSON.stringify(parsed, null, 2);
                textarea.setCustomValidity('');
                ctx.setCanClose(true);
            } catch (e) {
                textarea.setCustomValidity('Invalid JSON: ' + e.message);
                ctx.setCanClose(false);
            }
            textarea.reportValidity();
        });

        const minifyBtn = document.createElement('button');
        minifyBtn.textContent = 'Minify';
        minifyBtn.addEventListener('click', () => {
            try {
                const parsed = JSON.parse(textarea.value);
                textarea.value = JSON.stringify(parsed);
                textarea.setCustomValidity('');
                ctx.setCanClose(true);
            } catch (e) {
                textarea.setCustomValidity('Invalid JSON: ' + e.message);
                ctx.setCanClose(false);
            }
            textarea.reportValidity();
        });

        const validateBtn = document.createElement('button');
        validateBtn.textContent = 'Validate';
        validateBtn.addEventListener('click', () => {
            try {
                JSON.parse(textarea.value);
                textarea.setCustomValidity('');
                alert('JSON is valid');
            } catch (e) {
                textarea.setCustomValidity('Invalid JSON: ' + e.message);
                textarea.reportValidity();
            }
        });

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(textarea.value).then(() => {
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

        const textarea = document.createElement('textarea');
        textarea.value = JSON.stringify(ctx.data, null, 2);
        textarea.addEventListener('change', () => {
            validateJSON(textarea, ctx.setCanClose);
        });
        textarea.addEventListener('input', () => {
            validateJSON(textarea, ctx.setCanClose);
        });

        container.appendChild(controlBar);
        container.appendChild(textarea);
        ctx.dataDiv.appendChild(container);
        ctx.setCanClose(true);
    },
    save: (ctx) => {
        try {
            const textarea = ctx.dataDiv.querySelector('textarea');
            if (!textarea) return;
            const raw = JSON.parse(textarea.value);
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

function validateJSON(textarea, setCanClose) {
    try {
        JSON.parse(textarea.value);
        textarea.setCustomValidity('');
        setCanClose(true);
    } catch (e) {
        textarea.setCustomValidity('Invalid JSON: ' + e.message);
        setCanClose(false);
    }
    textarea.reportValidity();
}

function makeValuesTab(values) {
    return {
        name: 'Values',
        render: (ctx) => {
            try {
                const { dataDiv, data, setCanClose } = ctx;
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
                        title.textContent = value.name;
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
                        row.appendChild(label);

                        const input = document.createElement('input');
                        input.type = value.type || 'text';
                        
                        const currentVal = get(data, value.path);
                        
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
                        currentSection.appendChild(row);
                    }
                });

                form.addEventListener('submit', (e) => e.preventDefault());
                dataDiv.appendChild(form);
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
}