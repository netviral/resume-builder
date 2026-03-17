/**
 * Editor Settings & Style Overrides
 */

function applySettings() {
    if (!resumeData || !resumeData.settings) return;
    const s = resumeData.settings;
    if (document.getElementById('margin-x')) document.getElementById('margin-x').value = s.marginX;
    if (document.getElementById('margin-y')) document.getElementById('margin-y').value = s.marginY;
    if (document.getElementById('font-size')) document.getElementById('font-size').value = s.fontSize;

    updateCSSVariables();
}

function updateSettings() {
    history.save();
    resumeData.settings.marginX = parseFloat(document.getElementById('margin-x').value);
    resumeData.settings.marginY = parseFloat(document.getElementById('margin-y').value);
    resumeData.settings.fontSize = parseInt(document.getElementById('font-size').value);

    updateCSSVariables();
}

function updateCSSVariables() {
    if (!resumeData) return;
    const wrap = document.getElementById('resume-wrap');
    const root = document.documentElement;

    [root, wrap].forEach(el => {
        if (!el) return;
        el.style.setProperty('--page-margin-x', resumeData.settings.marginX + 'rem');
        el.style.setProperty('--page-margin-y', resumeData.settings.marginY + 'rem');
        el.style.setProperty('--base-font-size', resumeData.settings.fontSize + 'px');
    });
}

function changeTheme() {
    const theme = document.getElementById('theme-selector').value;
    document.getElementById('theme-link').href = theme;
    // Small delay to ensure theme loads before we apply overrides
    setTimeout(updateCSSVariables, 50);
}
