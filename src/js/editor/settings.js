/**
 * Editor Settings & Style Overrides
 */

function applySettings() {
    if (!resumeData || !resumeData.settings) return;
    const s = resumeData.settings;
    if (document.getElementById('margin-x')) document.getElementById('margin-x').value = s.marginX || 2.5;
    if (document.getElementById('margin-y')) document.getElementById('margin-y').value = s.marginY || 1.5;
    if (document.getElementById('font-size')) document.getElementById('font-size').value = s.fontSize || 12;

    // Apply Theme if present
    if (s.theme) {
        const selector = document.getElementById('theme-selector');
        if (selector) selector.value = s.theme;

        // Resolve ID to path
        const themeObj = window.resumeThemes?.find(t => t.id === s.theme);
        if (themeObj) {
            document.getElementById('theme-link').href = themeObj.path;
        }
    }

    updateCSSVariables();
}

function updateSettings() {
    if (!resumeData || !resumeData.settings) return;
    history.save ? history.save() : null;
    resumeData.settings.marginX = parseFloat(document.getElementById('margin-x').value);
    resumeData.settings.marginY = parseFloat(document.getElementById('margin-y').value);
    resumeData.settings.fontSize = parseInt(document.getElementById('font-size').value);

    updateCSSVariables();
}

function updateCSSVariables() {
    if (!resumeData || !resumeData.settings) return;
    const wrap = document.getElementById('resume-wrap');
    if (!wrap) return;

    // Apply settings specifically to the resume container
    wrap.style.setProperty('--page-margin-x', (resumeData.settings.marginX || 2.5) + 'rem');
    wrap.style.setProperty('--page-margin-y', (resumeData.settings.marginY || 1.5) + 'rem');

    // Applying to document root is necessary for 'rem' units in the resume to scale,
    // but the editor UI is now protected with hard-coded 'px' values.
    document.documentElement.style.setProperty('--base-font-size', (resumeData.settings.fontSize || 12) + 'px');
}

function changeTheme() {
    if (!resumeData) return;
    const themeId = document.getElementById('theme-selector').value;

    // Resolve ID to path
    const themeObj = (window.resumeThemes || []).find(t => t.id === themeId);
    if (themeObj) {
        document.getElementById('theme-link').href = themeObj.path;
    }

    // Save theme ID to current resume data
    if (!resumeData.settings) resumeData.settings = {};
    resumeData.settings.theme = themeId;

    // Save to history
    if (typeof history !== 'undefined' && history.save) history.save();

    // Small delay to ensure theme loads before we apply overrides
    setTimeout(updateCSSVariables, 50);
}
