/**
 * State Management & App Initialization
 */

let resumeData = null;
let editMode = false;

/* HISTORY MANAGEMENT (Undo/Redo) */
const history = {
    undoStack: [],
    redoStack: [],
    maxDepth: 50,

    save() {
        const currentState = JSON.stringify(resumeData);
        if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === currentState) return;

        this.undoStack.push(currentState);
        if (this.undoStack.length > this.maxDepth) this.undoStack.shift();
        this.redoStack = [];
    },

    undo() {
        if (this.undoStack.length === 0) return;
        const currentState = JSON.stringify(resumeData);
        this.redoStack.push(currentState);

        const prevState = JSON.parse(this.undoStack.pop());
        resumeData = prevState;

        renderResume();
        if (typeof applySettings === 'function') applySettings();
    },

    redo() {
        if (this.redoStack.length === 0) return;
        const currentState = JSON.stringify(resumeData);
        this.undoStack.push(currentState);

        const nextState = JSON.parse(this.redoStack.pop());
        resumeData = nextState;

        renderResume();
        if (typeof applySettings === 'function') applySettings();
    }
};

function init() {
    if (window.resumeDataRes) {
        resumeData = window.resumeDataRes;
        populateThemes();
        renderResume();
        if (typeof applySettings === 'function') applySettings();
    } else {
        showLoadOverlay();
    }
}

function populateThemes() {
    const selector = document.getElementById('theme-selector');
    if (!selector || !window.resumeThemes) return;

    selector.innerHTML = window.resumeThemes.map(t =>
        `<option value="${t.path}">${t.name}</option>`
    ).join('');
}

function showLoadOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'load-overlay';
    overlay.className = 'modal-overlay';
    overlay.style.background = 'rgba(0,0,0,0.95)';
    overlay.innerHTML = `
        <div class="modal" style="background:#1e293b; color:white; border-color:#334155">
            <h2 style="margin-bottom:1rem">Data Load Error</h2>
            <p style="margin-bottom:1.5rem; color:#94a3b8; line-height:1.4">
              The <code>data.js</code> file could not be loaded or is invalid. <br><br>
              Please select your <strong>data.json</strong> file manually to continue.
            </p>
            <input type="file" id="manual-file-input" accept=".json" style="display:none">
            <button class="tb-btn primary" style="font-size:1rem; padding:0.6rem 1.5rem; background:#1a3fa0; width:100%" onclick="document.getElementById('manual-file-input').click()">📁 Select data.json</button>
        </div>
      `;
    document.body.appendChild(overlay);

    document.getElementById('manual-file-input').onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                resumeData = JSON.parse(event.target.result);
                renderResume();
                if (typeof applySettings === 'function') applySettings();
                overlay.remove();
            } catch (err) {
                alert('Error parsing JSON: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
}

document.addEventListener('DOMContentLoaded', init);
