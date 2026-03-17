/**
 * Section-level CRUD Operations
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
