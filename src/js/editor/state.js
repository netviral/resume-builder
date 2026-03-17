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
        // Detect and Hydrate JSON Resume Schema
        if (window.resumeDataRes.basics && !window.resumeDataRes.sections) {
            resumeData = hydrateFromJRS(window.resumeDataRes);
        } else {
            resumeData = window.resumeDataRes;
        }

        populateThemes();
        renderResume();
        if (typeof applySettings === 'function') applySettings();
    } else {
        showLoadOverlay();
    }
}

/**
 * JRS Adapter: Translates JSON Resume Schema to Internal Editor Format
 */
function hydrateFromJRS(jrs) {
    const layout = (jrs.meta && jrs.meta.sections) || [
        { id: "summary", title: "Summary", type: "paragraph", source: "basics.summary" },
        { id: "work", title: "Work Experience", type: "detailed_list", source: "work" },
        { id: "education", title: "Education", type: "table_3col", source: "education" },
        { id: "skills", title: "Technical Skills", type: "key_value_grid", source: "skills" },
        { id: "projects", title: "Projects", type: "detailed_list", source: "projects" }
    ];

    const sections = layout.map(s => {
        const data = mapJRSDataToInternal(jrs, s);
        return { ...s, ...data };
    });

    const contacts = [];
    if (jrs.basics.email) contacts.push({ label: jrs.basics.email, href: `mailto:${jrs.basics.email}` });
    if (jrs.basics.phone) contacts.push({ label: jrs.basics.phone, href: `tel:${jrs.basics.phone}` });
    if (jrs.basics.url) contacts.push({ label: jrs.basics.url, href: jrs.basics.url });
    if (jrs.basics.profiles) {
        jrs.basics.profiles.forEach(p => contacts.push({ label: p.label || p.network, href: p.url }));
    }

    return {
        originalJRS: jrs, // Save for round-tripping if needed
        metadata: {
            name: jrs.basics.name || "",
            tagline: jrs.basics.label || "",
            contacts: contacts
        },
        sections: sections,
        settings: (jrs.meta && jrs.meta.settings) || { marginX: 2.5, marginY: 1.5, fontSize: 12 }
    };
}

function formatDateRange(item) {
    if (item.startDate && item.endDate) return `${item.startDate.substring(0, 4)} – ${item.endDate.substring(0, 4)}`;
    if (item.startDate) return `${item.startDate.substring(0, 4)} – Present`;
    if (item.endDate) return item.endDate.substring(0, 4);
    return item.date || "";
}

function mapJRSDataToInternal(jrs, section) {
    const source = section.source;
    if (!source) return {};

    const parts = source.split('.');
    let data = jrs;
    parts.forEach(p => { if (data) data = data[p]; });

    const offset = section.offset || 0;
    const count = section.count;

    if (Array.isArray(data)) {
        let subset = data.slice(offset);
        if (count) subset = subset.slice(0, count);

        if (section.type === 'detailed_list' || section.type === 'simple_list') {
            return {
                entries: subset.map(item => ({
                    heading: item.name || item.organization || item.institution || item.title || item.heading || "",
                    subheading: item.position || item.studyType || item.area || item.awarder || item.subheading || item.issuer || "",
                    date: formatDateRange(item),
                    bullets: item.highlights || item.bullets || [],
                    description: item.summary || item.description || ""
                }))
            };
        }
        if (section.type === 'table_3col') {
            return {
                entries: subset.map(item => ({
                    col1: item.name || item.institution || item.title || item.heading || item.organization || "",
                    col2: item.position || item.area || item.awarder || item.issuer || item.summary || item.description || item.subheading || "",
                    col3: formatDateRange(item)
                }))
            };
        }
        if (section.type === 'key_value_grid') {
            return {
                items: subset.map(item => ({
                    label: item.name || item.label || "",
                    value: Array.isArray(item.keywords) ? item.keywords.join(', ') : (item.value || "")
                }))
            };
        }
        if (section.type === 'bullet_grid') {
            if (source && source.toLowerCase().includes('skills')) {
                const keywords = [];
                subset.forEach(s => { if (s.keywords) keywords.push(...s.keywords); });
                return { bullets: keywords };
            }
            return {
                bullets: subset.map(item => {
                    if (typeof item === 'string') return item;
                    if (item.language) return `${item.language} (${item.fluency || ''})`;
                    return item.name || item.label || item.heading || "";
                })
            };
        }
    }

    if (section.type === 'paragraph' && typeof data === 'string') {
        return { content: data };
    }

    return {};
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
