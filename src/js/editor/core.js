/**
 * Core Editor UI & Toolbar Actions
 */

function toggleEdit() {
    editMode = !editMode;
    document.body.classList.toggle('editing', editMode);
    const btn = document.getElementById('toggle-edit-btn');
    const indicator = document.getElementById('edit-mode-indicator');

    if (editMode) {
        btn.innerHTML = '💾 Save';
        btn.classList.add('save-state');
        indicator.textContent = 'editing';
        indicator.classList.add('active');
    } else {
        btn.innerHTML = '✏ Edit';
        btn.classList.remove('save-state');
        indicator.textContent = 'viewing';
        indicator.classList.remove('active');
    }
    renderResume();
}

function exportPDF() {
    window.print();
}

function saveData() {
    if (typeof Modal !== 'undefined') {
        Modal.show({
            title: 'Save Resume Data',
            message: 'Choose which format to export. <strong>data.js</strong> is recommended for local file usage.',
            buttons: [
                {
                    label: 'Export data.js',
                    className: 'btn-primary',
                    onClick: () => exportFile('js')
                },
                {
                    label: 'Export data.json',
                    className: 'btn-outline',
                    onClick: () => exportFile('json')
                }
            ]
        });
    }
}

/**
 * Universal file exporter
 */
function exportFile(ext) {
    let exportData = resumeData;

    // If we are in hydrated mode, translate back to JRS
    if (resumeData.originalJRS) {
        exportData = dehydrateToJRS(resumeData);
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const content = ext === 'js' ? `window.resumeDataRes = ${dataStr};` : dataStr;
    const blob = new Blob([content], { type: ext === 'js' ? 'application/javascript' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * JRS Dehydrator: Translates internal editor format back to JSON Resume Schema
 */
function dehydrateToJRS(internal) {
    const jrs = JSON.parse(JSON.stringify(internal.originalJRS || {}));

    // Update basics
    if (!jrs.basics) jrs.basics = {};
    jrs.basics.name = internal.metadata.name;
    jrs.basics.label = internal.metadata.tagline;

    // Sync contacts back to basics
    if (internal.metadata.contacts) {
        internal.metadata.contacts.forEach(c => {
            if (c.label.includes('@')) jrs.basics.email = c.label;
            else if (c.label.match(/[0-9+]{5,}/)) jrs.basics.phone = c.label;
            else if (c.label.toLowerCase().includes('linkedin') || c.label.toLowerCase().includes('github')) {
                const network = c.label.toLowerCase().includes('linkedin') ? 'LinkedIn' : 'GitHub';
                const profile = jrs.basics.profiles?.find(p => p.network === network);
                if (profile) profile.label = c.label;
            }
        });
    }

    // Update Meta
    if (!jrs.meta) jrs.meta = {};
    jrs.meta.settings = internal.settings;
    jrs.meta.sections = internal.sections.map(s => {
        const clean = { ...s };
        // Remove the data we hydrated so it doesn't duplicate in JRS
        delete clean.entries;
        delete clean.items;
        delete clean.bullets;
        delete clean.content;
        return clean;
    });

    // Update Actual Data Arrays 
    internal.sections.forEach(s => {
        if (!s.source) return;
        const parts = s.source.split('.');
        let target = jrs;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!target[parts[i]]) target[parts[i]] = {};
            target = target[parts[i]];
        }

        const key = parts[parts.length - 1];
        const offset = s.offset || 0;
        if (!target[key]) target[key] = [];
        const dataArray = target[key];

        if (s.type === 'detailed_list' || s.type === 'simple_list') {
            (s.entries || []).forEach((e, i) => {
                const idx = offset + i;
                if (!dataArray[idx]) dataArray[idx] = {};
                const item = dataArray[idx];

                // Robust mapping
                item.name = e.heading;
                if (parts[0] === 'volunteer') item.organization = e.heading;
                if (parts[0] === 'education') item.institution = e.heading;

                item.position = e.subheading;
                if (parts[0] === 'education') item.area = e.subheading;

                item.highlights = e.bullets;
                item.summary = e.description;
            });
        }
        if (s.type === 'table_3col') {
            (s.entries || []).forEach((e, i) => {
                const idx = offset + i;
                if (!dataArray[idx]) dataArray[idx] = {};
                const item = dataArray[idx];
                item.name = e.col1;
                item.summary = e.col2;
                if (parts[0] === 'education') {
                    item.institution = e.col1;
                    item.area = e.col2;
                }
            });
        }
        if (s.type === 'bullet_grid') {
            if (s.source.toLowerCase().includes('skills')) {
                // For flattened skills, we just update the first category's keywords
                if (dataArray[0]) dataArray[0].keywords = s.bullets;
            } else {
                s.bullets.forEach((b, i) => { dataArray[offset + i] = b; });
            }
        }
        if (s.type === 'paragraph') {
            target[key] = s.content;
        }
    });

    return jrs;
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (!editMode) return;

    const isZ = e.key.toLowerCase() === 'z';
    const isY = e.key.toLowerCase() === 'y';
    const ctrlOrCmd = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;

    if (ctrlOrCmd && isZ) {
        e.preventDefault();
        if (shift) {
            history.redo();
        } else {
            history.undo();
        }
    }

    if (ctrlOrCmd && isY) {
        e.preventDefault();
        history.redo();
    }
});
