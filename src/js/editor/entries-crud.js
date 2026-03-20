/**
 * Entry-level CRUD Operations (Generic & Schema-driven)
 */

/* Meta & Header Controls */
function updateMeta(key, val) {
    history.save();
    resumeData.metadata[key] = val;
}
function editContact(i) {
    const contact = resumeData.metadata.contacts[i];
    if (typeof Modal === 'undefined') return;

    Modal.show({
        title: 'Edit Link',
        message: `
            <div class="modal-form">
                <div class="form-group">
                    <label>Text Label</label>
                    <input type="text" id="edit-link-label" class="modal-input" value="${contact.label}" placeholder="e.g. LinkedIn, Portfolio">
                </div>
                <div class="form-group">
                    <label>URL / Hyperlink</label>
                    <input type="text" id="edit-link-url" class="modal-input" value="${contact.href}" placeholder="e.g. https://...">
                </div>
            </div>
        `,
        buttons: [
            {
                label: 'Save Changes',
                className: 'btn-primary',
                onClick: () => {
                    const label = document.getElementById('edit-link-label').value;
                    const href = document.getElementById('edit-link-url').value;
                    if (label) {
                        history.save();
                        resumeData.metadata.contacts[i] = { label, href };
                        renderHeader();
                    }
                }
            },
            {
                label: 'Remove Link',
                className: 'btn-danger-outline',
                onClick: () => removeContact(i)
            }
        ]
    });
}

function addContact() {
    if (typeof Modal === 'undefined') return;

    Modal.show({
        title: 'Add New Link',
        message: `
            <div class="modal-form">
                <div class="form-group">
                    <label>Text Label</label>
                    <input type="text" id="add-link-label" class="modal-input" placeholder="e.g. LinkedIn, Portfolio">
                </div>
                <div class="form-group">
                    <label>URL / Hyperlink</label>
                    <input type="text" id="add-link-url" class="modal-input" placeholder="e.g. https://...">
                </div>
            </div>
        `,
        buttons: [
            {
                label: 'Add Link',
                className: 'btn-primary',
                onClick: () => {
                    const label = document.getElementById('add-link-label').value;
                    const href = document.getElementById('add-link-url').value;
                    if (label) {
                        history.save();
                        resumeData.metadata.contacts.push({ label, href: href || '#' });
                        renderHeader();
                    }
                }
            }
        ]
    });
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
    renderSections();
}

/* Generic Section Content Update */
function updateSectionContent(sIdx, val) {
    history.save();
    const section = resumeData.sections[sIdx];
    const schema = window.sectionSchema[section.type];
    if (schema && schema.isSingleText) {
        section[schema.itemKey] = val;
    } else {
        section.content = val;
    }
}

/* Generic Entry/Row CRUD */
function addEntry(sIdx) {
    history.save();
    const section = resumeData.sections[sIdx];
    const schema = window.sectionSchema[section.type];

    if (schema) {
        const newItem = JSON.parse(JSON.stringify(schema.defaultItem));
        section[schema.itemKey].push(newItem);
        renderSections();
    }
}

function removeEntry(sIdx, eIdx) {
    if (confirm('Are you sure you want to remove this entry?')) {
        history.save();
        const section = resumeData.sections[sIdx];
        const schema = window.sectionSchema[section.type];
        section[schema.itemKey].splice(eIdx, 1);
        renderSections();
    }
}

function updateEntryField(sIdx, eIdx, key, val) {
    history.save();
    const section = resumeData.sections[sIdx];
    const schema = window.sectionSchema[section.type];
    const entry = section[schema.itemKey][eIdx];

    // Map abstract keys back to existing data if needed, or just use key
    // For legacy data support in renderer, we handle it there. 
    // Here we save to the abstract key.
    entry[key] = val;
}

/* Bullet Management (Detailed Lists & Bullet Grids) */
function updateBullet(sIdx, eIdx, bIdx, val) {
    history.save();
    resumeData.sections[sIdx].entries[eIdx].bullets[bIdx] = val;
}
function addBullet(sIdx, eIdx) {
    history.save();
    const entry = resumeData.sections[sIdx].entries[eIdx];
    if (!entry.bullets) entry.bullets = [];
    entry.bullets.push("New bullet point");
    renderSections();
}
function removeBullet(sIdx, eIdx, bIdx) {
    history.save();
    resumeData.sections[sIdx].entries[eIdx].bullets.splice(bIdx, 1);
    renderSections();
}

/* Bullet Grid Management (Simple Arrays) */
function updateColBullet(sIdx, bIdx, val) {
    history.save();
    resumeData.sections[sIdx].items[bIdx] = val;
}
function addColBullet(sIdx) {
    history.save();
    if (!resumeData.sections[sIdx].items) resumeData.sections[sIdx].items = [];
    resumeData.sections[sIdx].items.push("New item");
    renderSections();
}
function removeColBullet(sIdx, bIdx) {
    history.save();
    resumeData.sections[sIdx].items.splice(bIdx, 1);
    renderSections();
}

function editCommaItem(sIdx, iIdx) {
    const item = resumeData.sections[sIdx].items[iIdx];
    if (typeof Modal === 'undefined') return;

    Modal.show({
        title: 'Edit Item',
        message: `
            <div class="modal-form">
                <div class="form-group">
                    <label>Item Name</label>
                    <input type="text" id="edit-comma-val" class="modal-input" value="${item}" placeholder="e.g. Algorithms">
                </div>
            </div>
        `,
        buttons: [
            {
                label: 'Save Changes',
                className: 'btn-primary',
                onClick: () => {
                    const val = document.getElementById('edit-comma-val').value;
                    if (val) {
                        history.save();
                        resumeData.sections[sIdx].items[iIdx] = val.trim();
                        renderSections();
                    }
                }
            },
            {
                label: 'Remove Item',
                className: 'btn-danger-outline',
                onClick: () => {
                    removeColBullet(sIdx, iIdx);
                }
            }
        ]
    });
}

/* Key-Value Grid Management (e.g. Skills) */
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
