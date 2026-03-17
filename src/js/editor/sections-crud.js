/**
 * Section-level CRUD Operations (Dynamic & Schema-driven)
 */

function updateSectionTitle(sIdx, val) {
    history.save();
    resumeData.sections[sIdx].title = val;
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

function addNewSection() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    // Generate options dynamically from schema
    const schemaOptions = Object.keys(window.sectionSchema).map(type => {
        const s = window.sectionSchema[type];
        return `
            <button class="modal-btn" onclick="createSection('${type}', '${s.name}')">
              <strong>${s.name}</strong>
              <span>${s.description}</span>
            </button>
        `;
    }).join('');

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
            <div style="border-top:1px solid #eee; margin:10px 0; padding-top:10px; font-size:11px; color:#999; text-transform:uppercase; letter-spacing:1px">Resume Sections (Generic Layouts)</div>
            ${schemaOptions}
            <button class="modal-btn" style="background:white; border-color:#ccc; color:#666" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          </div>
        </div>
      `;
    document.body.appendChild(modal);

    window.createSection = (type, title) => {
        const schema = window.sectionSchema[type];
        let newSec = { type, title };

        if (schema.isSingleText) {
            newSec[schema.itemKey] = "New text block...";
        } else {
            // It's a list-based type
            const firstItem = JSON.parse(JSON.stringify(schema.defaultItem));
            newSec[schema.itemKey] = [firstItem];
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
