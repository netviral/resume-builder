/**
 * Entry-level CRUD Operations (Bullets, Skills, Ventures, etc.)
 */

/* Meta & Contact */
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

/* Removal Generic */
function removeEntry(sIdx, eIdx) {
    if (confirm('Are you sure you want to remove this entry?')) {
        history.save();
        resumeData.sections[sIdx].entries.splice(eIdx, 1);
        renderSections();
    }
}

/* Education */
function updateEdu(sIdx, eIdx, key, val) {
    history.save();
    resumeData.sections[sIdx].entries[eIdx][key] = val;
}
function addEduEntry(sIdx) {
    history.save();
    resumeData.sections[sIdx].entries.push({ institution: "New Institute", details: "Details", date: "202x" });
    renderSections();
}

/* Experience & Bullets */
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

/* Lists & Columns */
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

/* Ventures */
function updateVenture(sIdx, eIdx, key, val) {
    history.save();
    resumeData.sections[sIdx].entries[eIdx][key] = val;
}
function addVentureEntry(sIdx) {
    history.save();
    resumeData.sections[sIdx].entries.push({ name: "New Venture", tag: "Tech", description: "Desc" });
    renderSections();
}

/* Skills */
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
