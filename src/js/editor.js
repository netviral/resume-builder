/**
 * Editor and State management logic for the Resume Builder
 */

let resumeData = null;
let editMode = false;

/* HISTORY MANAGEMENT (Undo/Redo) */
const history = {
    undoStack: [],
    redoStack: [],
    maxDepth: 50,

    save() {
        // Only save if the data has actually changed from the last snapshot
        const currentState = JSON.stringify(resumeData);
        if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === currentState) return;

        this.undoStack.push(currentState);
        if (this.undoStack.length > this.maxDepth) this.undoStack.shift();
        this.redoStack = []; // Reset redo stack on new action
    },

    undo() {
        if (this.undoStack.length === 0) return;
        const currentState = JSON.stringify(resumeData);
        this.redoStack.push(currentState);

        const prevState = JSON.parse(this.undoStack.pop());
        resumeData = prevState;

        renderResume();
        applySettings();
    },

    redo() {
        if (this.redoStack.length === 0) return;
        const currentState = JSON.stringify(resumeData);
        this.undoStack.push(currentState);

        const nextState = JSON.parse(this.redoStack.pop());
        resumeData = nextState;

        renderResume();
        applySettings();
    }
};

function init() {
    if (window.resumeDataRes) {
        resumeData = window.resumeDataRes;
        populateThemes();
        renderResume();
        applySettings();
    } else {
        console.error('Error: resumeDataRes not found. Ensure data.js is loaded.');
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
    overlay.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:1000; display:flex; flex-direction:column; align-items:center; justify-content:center; color:white; font-family:sans-serif; text-align:center; padding: 2rem;';
    overlay.innerHTML = `
        <h2 style="margin-bottom:1rem">Data Load Error</h2>
        <p style="margin-bottom:1.5rem; color:#ccc; max-width:500px; line-height:1.4">
          The <code>data.js</code> file could not be loaded or is invalid. <br><br>
          Please select your <strong>data.json</strong> file manually to continue.
        </p>
        <input type="file" id="manual-file-input" accept=".json" style="display:none">
        <button class="tb-btn primary" style="font-size:1rem; padding:0.6rem 1.5rem; background:#1a3fa0; border-color:#3b82f6" onclick="document.getElementById('manual-file-input').click()">📁 Select data.json</button>
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
                applySettings();
                overlay.remove();
            } catch (err) {
                alert('Error parsing JSON: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
}

/* UPDATE FUNCTIONS */
function updateMeta(key, val) {
    history.save();
    resumeData.metadata[key] = val;
}
function updateContact(i, val) {
    history.save();
    resumeData.metadata.contacts[i].label = val;
}
function addContact() {
    history.save();
    resumeData.metadata.contacts.push({ label: "New Link", href: "#" });
    renderHeader();
}
function removeContact(i) {
    history.save();
    resumeData.metadata.contacts.splice(i, 1);
    renderHeader();
}
function removeTagline() {
    history.save();
    resumeData.metadata.tagline = "";
    renderHeader();
}
function removeSummary() {
    history.save();
    resumeData.metadata.summary = "";
    renderSummary();
}
function updateSectionTitle(sIdx, val) {
    history.save();
    resumeData.sections[sIdx].title = val;
}

function updateEdu(sIdx, eIdx, key, val) {
    history.save();
    resumeData.sections[sIdx].entries[eIdx][key] = val;
}
function addEduEntry(sIdx) {
    history.save();
    resumeData.sections[sIdx].entries.push({ institution: "New Institute", details: "Details", date: "202x" });
    renderSections();
}

function updateExp(sIdx, eIdx, key, val) {
    history.save();
    resumeData.sections[sIdx].entries[eIdx][key] = val;
}
function updateBullet(sIdx, eIdx, bIdx, val) {
    history.save();
    resumeData.sections[sIdx].entries[eIdx].bullets[bIdx] = val;
}
function addBullet(sIdx, eIdx) {
    history.save();
    resumeData.sections[sIdx].entries[eIdx].bullets.push("New bullet point");
    renderSections();
}
function removeBullet(sIdx, eIdx, bIdx) {
    history.save();
    resumeData.sections[sIdx].entries[eIdx].bullets.splice(bIdx, 1);
    renderSections();
}
function addExpEntry(sIdx) {
    history.save();
    resumeData.sections[sIdx].entries.push({ organization: "New Org", date: "Date", role: "Role", bullets: ["Initial bullet"] });
    renderSections();
}

function updateColBullet(sIdx, bIdx, val) {
    history.save();
    resumeData.sections[sIdx].bullets[bIdx] = val;
}
function addColBullet(sIdx) {
    history.save();
    resumeData.sections[sIdx].bullets.push("New item");
    renderSections();
}
function removeColBullet(sIdx, bIdx) {
    history.save();
    resumeData.sections[sIdx].bullets.splice(bIdx, 1);
    renderSections();
}

function updateVenture(sIdx, eIdx, key, val) {
    history.save();
    resumeData.sections[sIdx].entries[eIdx][key] = val;
}
function addVentureEntry(sIdx) {
    history.save();
    resumeData.sections[sIdx].entries.push({ name: "New Venture", tag: "Tech", description: "Desc" });
    renderSections();
}

function updateSkill(sIdx, iIdx, val) {
    const parts = val.split(':');
    if (parts.length > 1) {
        history.save();
        resumeData.sections[sIdx].items[iIdx].label = parts[0].replace('<strong>', '').replace('</strong>', '').trim();
        resumeData.sections[sIdx].items[iIdx].value = parts.slice(1).join(':').trim();
    }
}
function addSkill(sIdx) {
    history.save();
    resumeData.sections[sIdx].items.push({ label: "Category", value: "Skill 1, Skill 2" });
    renderSections();
}
function removeSkill(sIdx, iIdx) {
    history.save();
    resumeData.sections[sIdx].items.splice(iIdx, 1);
    renderSections();
}

function removeSection(sIdx) {
    if (confirm('Are you sure you want to remove this entire section?')) {
        history.save();
        resumeData.sections.splice(sIdx, 1);
        renderSections();
    }
}

function moveSection(sIdx, direction) {
    const newIdx = sIdx + direction;
    if (newIdx < 0 || newIdx >= resumeData.sections.length) return;
    history.save();
    const temp = resumeData.sections[sIdx];
    resumeData.sections[sIdx] = resumeData.sections[newIdx];
    resumeData.sections[newIdx] = temp;
    renderSections();
}

function removeEntry(sIdx, eIdx) {
    if (confirm('Are you sure you want to remove this entry?')) {
        history.save();
        resumeData.sections[sIdx].entries.splice(eIdx, 1);
        renderSections();
    }
}

function addNewSection() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
          <h3>Add Element</h3>
          <div class="modal-options">
            <button class="modal-btn" onclick="restoreHeader('tagline')">
              <strong>Tagline</strong>
              <span>Sub-header under your name</span>
            </button>
            <button class="modal-btn" onclick="restoreHeader('summary')">
              <strong>Professional Summary</strong>
              <span>Brief intro paragraph</span>
            </button>
            <div style="border-top:1px solid #eee; margin:10px 0; padding-top:10px; font-size:11px; color:#999; text-transform:uppercase; letter-spacing:1px">Resume Sections</div>
            <button class="modal-btn" onclick="createSection('experience_details', 'Professional Experience')">
              <strong>Professional Experience</strong>
              <span>Org name, date, role, and bullet points</span>
            </button>
            <button class="modal-btn" onclick="createSection('education', 'Education')">
              <strong>Education</strong>
              <span>Institution name, details, and date (Table format)</span>
            </button>
            <button class="modal-btn" onclick="createSection('bullets_two_columns', 'Skills/Languages')">
              <strong>Two-Column List</strong>
              <span>Great for skills, languages, or areas of interest</span>
            </button>
            <button class="modal-btn" onclick="createSection('ventures', 'Ventures/Projects')">
              <strong>Ventures</strong>
              <span>Name, tag, and description</span>
            </button>
            <button class="modal-btn" onclick="createSection('skills', 'Technical Skills')">
              <strong>Skill Grid</strong>
              <span>Categorized skills in a grid layout</span>
            </button>
             <button class="modal-btn" style="background:white; border-color:#ccc; color:#666" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          </div>
        </div>
      `;
    document.body.appendChild(modal);

    window.createSection = (type, title) => {
        let newSec = { type, title };
        if (type === 'experience_details') {
            newSec.entries = [{ organization: "Organization", date: "Date", role: "Role", bullets: ["Detail 1"] }];
        } else if (type === 'education') {
            newSec.entries = [{ institution: "University", details: "Details", date: "Year" }];
        } else if (type === 'bullets_two_columns') {
            newSec.bullets = ["Item 1", "Item 2"];
        } else if (type === 'ventures') {
            newSec.entries = [{ name: "New Venture", tag: "Tag", description: "Desc" }];
        } else if (type === 'skills') {
            newSec.items = [{ label: "Category", value: "Skill 1" }];
        }

        history.save();
        resumeData.sections.push(newSec);
        modal.remove();
        renderSections();
    };

    window.restoreHeader = (type) => {
        history.save();
        if (type === 'tagline') resumeData.metadata.tagline = "Your Tagline Here";
        if (type === 'summary') resumeData.metadata.summary = "Your summary here...";
        modal.remove();
        renderHeader();
        renderSummary();
    };
}

/* SETTINGS & THEME */
function applySettings() {
    const s = resumeData.settings;
    document.getElementById('margin-x').value = s.marginX;
    document.getElementById('margin-y').value = s.marginY;
    document.getElementById('font-size').value = s.fontSize;

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
    // Target both root and the resume-wrap to ensure print picks up local overrides
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

/* TOOLBAR ACTIONS */
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

// Global entry point
document.addEventListener('DOMContentLoaded', init);
