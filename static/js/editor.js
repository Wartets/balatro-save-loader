if (!window.CodeMirrorJSON) {
    const [{ EditorState, EditorView, basicSetup }, { json }] = await Promise.all([
        import('https://cdn.jsdelivr.net/npm/codemirror@6.0.1/+esm'),
        import('https://cdn.jsdelivr.net/npm/@codemirror/lang-json@6.0.1/+esm'),
    ]);
    window.CodeMirrorJSON = {
        EditorState,
        EditorView,
        basicSetup,
        json,
    };
}
