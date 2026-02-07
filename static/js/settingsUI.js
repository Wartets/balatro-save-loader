import { makeValuesTab, rawTab } from "./sharedTabs.js";

const values = [
    {
        name: 'Profile & General',
        type: 'label',
    },
    {
        name: 'Loaded Profile',
        path: 'profile',
        type: 'number',
    },
    {
        name: 'Language',
        path: 'language',
        type: 'text',
    },

    {
        name: 'Game Settings',
        type: 'label',
    },
    {
        name: 'Game Speed',
        path: 'GAMESPEED',
        type: 'number',
    },
    {
        name: 'Tutorial Completed',
        path: 'tutorial_complete',
        type: 'checkbox',
    },

    {
        name: 'Feedback & Reports',
        type: 'label',
    },
    {
        name: 'Send Crash Reports',
        path: 'crashreports',
        type: 'checkbox',
    },

    {
        name: 'Display & Graphics',
        type: 'label',
    },
    {
        name: 'Background Music Volume',
        path: 'music_volume',
        type: 'number',
    },
    {
        name: 'SFX Volume',
        path: 'sfx_volume',
        type: 'number',
    },
    {
        name: 'Screen Scale',
        path: 'screen_scale',
        type: 'number',
    },

    {
        name: 'Advanced Options',
        type: 'label',
    },
    {
        name: 'Development Mode',
        path: 'dev_mode',
        type: 'checkbox',
    },
];

const settingsTabs = [
    makeValuesTab(values),
    rawTab,
];

export {
    settingsTabs,
}