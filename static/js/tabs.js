function renderTabs(tabData, ctx, buttonDiv, dataDiv) {
    const loaded = {
        tab: null,
        canClose: true,
    };
    const tabElements = {};
    let buttons = [];

    const returnData = {
        saveCurrent: () => {
            if (loaded.tab?.save) {
                loaded.tab.save({ dataDiv, ...ctx });
            }
        }
    };

    const setCanClose = (canClose) => {
        loaded.canClose = canClose;
        buttons.forEach((button) => {
            button.disabled = !canClose;
        });
        returnData?.setCanClose?.(canClose);
    };

    const displayTab = (tab, button) => {
        if (loaded.tab && loaded.tab !== tab) {
            loaded.tab.save?.({ dataDiv, ...ctx });
        }
        dataDiv.innerHTML = '';
        Object.values(tabElements).forEach((btn) => {
            btn.style.borderBottomColor = 'transparent';
            btn.style.color = 'color-mix(in srgb, canvastext 60%, transparent)';
        });
        button.style.borderBottomColor = 'canvastext';
        button.style.color = 'canvastext';
        tab.render?.({ ...ctx, dataDiv, setCanClose });
        loaded.tab = tab;
    };

    buttons = tabData.map((tab) => {
        if (!(tab.shouldShow?.(ctx) ?? true)) {
            return null;
        }
        const button = document.createElement('button');
        button.textContent = tab.name;
        button.addEventListener('click', () => {
            displayTab(tab, button);
        });
        tabElements[tab.name] = button;
        return button;
    }).filter((button) => button !== null);

    buttonDiv.innerHTML = '';
    buttons.forEach((button) => buttonDiv.appendChild(button));

    if (buttons.length > 0) {
        displayTab(tabData.find(t => (t.shouldShow?.(ctx) ?? true)), buttons[0]);
    }

    return returnData;
}


export {
    renderTabs,
}