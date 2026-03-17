/**
 * Entry-level CRUD Operations (Generic & Schema-driven)
 */

/* Meta & Header Controls */
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
