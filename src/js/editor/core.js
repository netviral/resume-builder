/**
 * Core Editor UI & Toolbar Actions
 */

function toggleEdit() {
    editMode = !editMode;
    document.body.classList.toggle('editing', editMode);
    const btn = document.getElementById('toggle-edit-btn');
    const indicator = document.getElementById('edit-mode-indicator');
    if (editMode) {
        btn.textContent = '✓ Done Editing';
        btn.style.background = 'rgba(125,211,176,0.25)';
        btn.style.borderColor = '#7dd3b0';
        indicator.textContent = 'edit mode';
        indicator.classList.add('active');
    } else {
        btn.textContent = '✏ Edit Mode';
        btn.style.background = '';
        btn.style.borderColor = '';
        indicator.textContent = 'view mode';
        indicator.classList.remove('active');
    }
    renderResume();
}

function exportPDF() {
    window.print();
}

function saveData() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal" style="max-width:350px">
          <h3>Save Resume Data</h3>
          <p style="font-size:0.85rem; color:#666; margin-bottom:1.5rem">Choose which format to export. <strong>data.js</strong> is recommended for local file usage.</p>
          <div class="modal-options">
            <button class="modal-btn" onclick="exportFile('js')">
              <strong>Export data.js</strong>
              <span>Bypasses CORS for direct local use</span>
            </button>
            <button class="modal-btn" onclick="exportFile('json')">
              <strong>Export data.json</strong>
              <span>Standard JSON data format</span>
            </button>
            <button class="modal-btn" style="background:white; border-color:#ccc; color:#666" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          </div>
        </div>
      `;
    document.body.appendChild(modal);

    window.exportFile = (ext) => {
        const dataStr = JSON.stringify(resumeData, null, 2);
        const content = ext === 'js' ? `window.resumeDataRes = ${dataStr};` : dataStr;
        const blob = new Blob([content], { type: ext === 'js' ? 'application/javascript' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        modal.remove();
    };
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
