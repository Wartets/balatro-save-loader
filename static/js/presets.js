import { set } from "./saveLogic.js";

const presets = [
    {
        name: 'Max Money',
        description: 'Set money to 9999',
        apply: (data) => {
            set(data, 'GAME.dollars', 9999);
        }
    },
    {
        name: 'Max Hands & Discards',
        description: 'Reset hands and discards to max',
        apply: (data) => {
            set(data, 'GAME.round_resets.hands', 999);
            set(data, 'GAME.round_resets.discards', 999);
        }
    },
    {
        name: 'High Multiplier',
        description: 'Set chip multiplier to 1000',
        apply: (data) => {
            set(data, 'GAME.mult', 1000);
        }
    },
    {
        name: 'Setup Hand',
        description: 'Max cards in hand slots',
        apply: (data) => {
            set(data, 'cardAreas.hand.config.card_limit', 20);
        }
    },
    {
        name: 'Rich Start',
        description: 'Max money, hands, discards',
        apply: (data) => {
            set(data, 'GAME.dollars', 9999);
            set(data, 'GAME.round_resets.hands', 999);
            set(data, 'GAME.round_resets.discards', 999);
        }
    },
    {
        name: 'Instant Win',
        description: 'Set chips to 9 billion',
        apply: (data) => {
            set(data, 'GAME.chips', 9000000000);
            set(data, 'GAME.mult', 9000);
        }
    },
    {
        name: 'Late Game Setup',
        description: 'Round 50 ante 12',
        apply: (data) => {
            set(data, 'GAME.round', 50);
            set(data, 'GAME.round_resets.ante', 12);
            set(data, 'GAME.dollars', 50000);
        }
    }
];

function createPresetsSection() {
    const container = document.createElement('div');
    container.className = 'presets-container';

    const title = document.createElement('h2');
    title.textContent = 'Quick Presets';
    title.style.margin = '0 0 var(--spacing-md) 0';
    container.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'preset-grid';

    presets.forEach(preset => {
        const card = document.createElement('div');
        card.className = 'preset-card';
        
        const cardTitle = document.createElement('div');
        cardTitle.className = 'preset-title';
        cardTitle.textContent = preset.name;
        
        const cardDesc = document.createElement('div');
        cardDesc.className = 'preset-desc';
        cardDesc.textContent = preset.description;
        
        const cardBtn = document.createElement('button');
        cardBtn.textContent = 'Apply';
        cardBtn.style.marginTop = 'auto';
        cardBtn.dataset.preset = preset.name;
        
        card.appendChild(cardTitle);
        card.appendChild(cardDesc);
        card.appendChild(cardBtn);
        
        grid.appendChild(card);
    });

    container.appendChild(grid);
    return { container, grid };
}

export function initializePresets(dataDiv, data, setCanClose) {
    const { container } = createPresetsSection();
    
    container.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const presetName = btn.dataset.preset;
            const preset = presets.find(p => p.name === presetName);
            if (preset && data) {
                preset.apply(data);
                btn.textContent = 'Applied!';
                setTimeout(() => {
                    btn.textContent = 'Apply';
                }, 2000);
                setCanClose(true);
            }
        });
    });
    
    return container;
}