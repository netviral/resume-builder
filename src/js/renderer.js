/**
 * Rendering logic for the Resume Builder
 */

function renderResume() {
    renderHeader();
    renderSummary();
    renderSections();
}

function renderHeader() {
    const root = document.getElementById('header-root');
    const m = resumeData.metadata;
    root.innerHTML = `
      <div class="header">
        <h1 contenteditable="${editMode}" onblur="updateMeta('name', this.innerText)">${m.name}</h1>
        <p class="tagline" contenteditable="${editMode}" onblur="updateMeta('tagline', this.innerText)">${m.tagline}</p>
        <div class="contacts">
          ${m.contacts.map((c, i) => `
            <a href="${c.href}" contenteditable="${editMode}" onblur="updateContact(${i}, this.innerText)">${c.label}</a>
            ${i < m.contacts.length - 1 ? '<span>|</span>' : ''}
          `).join('')}
        </div>
      </div>
    `;
}

function renderSummary() {
    const root = document.getElementById('summary-root');
    root.innerHTML = `
      <p class="summary" contenteditable="${editMode}" onblur="updateMeta('summary', this.innerText)">
        ${resumeData.metadata.summary}
      </p>
    `;
}

function renderSections() {
    const root = document.getElementById('sections-root');
    root.innerHTML = '';
    resumeData.sections.forEach((section, sIdx) => {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'section-wrapper';

        let content = `
        <div class="section-ctrl">
          <button class="del-section" title="Remove entire section" onclick="removeSection(${sIdx})">✕</button>
        </div>
        <section>
          <div class="section-title" contenteditable="${editMode}" onblur="updateSectionTitle(${sIdx}, this.innerText)">${section.title}</div>
          ${renderSectionContent(section, sIdx)}
        </section>
      `;

        sectionEl.innerHTML = content;
        root.appendChild(sectionEl);
    });
}

function renderSectionContent(section, sIdx) {
    if (section.type === 'education') {
        return `
        <table class="edu-table">
          ${section.entries.map((e, eIdx) => `
            <tr class="entry">
              <td contenteditable="${editMode}" onblur="updateEdu(${sIdx}, ${eIdx}, 'institution', this.innerText)"><strong>${e.institution}</strong></td>
              <td contenteditable="${editMode}" onblur="updateEdu(${sIdx}, ${eIdx}, 'details', this.innerText)">${e.details}</td>
              <td contenteditable="${editMode}" onblur="updateEdu(${sIdx}, ${eIdx}, 'date', this.innerText)">${e.date}</td>
              ${editMode ? `<td class="entry-ctrl"><button class="del-entry" title="Remove Entry" onclick="removeEntry(${sIdx}, ${eIdx})">✕</button></td>` : ''}
            </tr>
          `).join('')}
        </table>
        ${editMode ? `<div class="add-action-area"><button class="add-btn" onclick="addEduEntry(${sIdx})"><span>+</span> Add Education Entry</button></div>` : ''}
      `;
    } else if (section.type === 'experience_details') {
        return `
        ${section.entries.map((e, eIdx) => `
          <div class="entry">
            ${editMode ? `<div class="entry-ctrl"><button class="del-entry" title="Remove Entry" onclick="removeEntry(${sIdx}, ${eIdx})">✕</button></div>` : ''}
            <div class="entry-header">
              <span class="entry-org" contenteditable="${editMode}" onblur="updateExp(${sIdx}, ${eIdx}, 'organization', this.innerText)">${e.organization}</span>
              <span class="entry-date" contenteditable="${editMode}" onblur="updateExp(${sIdx}, ${eIdx}, 'date', this.innerText)">${e.date || ''}</span>
            </div>
            ${e.role ? `<div class="entry-role" contenteditable="${editMode}" onblur="updateExp(${sIdx}, ${eIdx}, 'role', this.innerText)">${e.role}</div>` : ''}
            <ul class="bullets">
              ${(e.bullets || []).map((b, bIdx) => `
                <li contenteditable="${editMode}" onblur="updateBullet(${sIdx}, ${eIdx}, ${bIdx}, this.innerHTML)">
                  ${b}
                  ${editMode ? `<span class="bullet-ctrl"><button class="del-btn" onclick="removeBullet(${sIdx}, ${eIdx}, ${bIdx})">✕</button></span>` : ''}
                </li>
              `).join('')}
            </ul>
            ${editMode ? `<div class="add-action-area" style="border:none; text-align:left; padding-left:1.2rem"><button class="add-btn" onclick="addBullet(${sIdx}, ${eIdx})"><span>+</span> Add Bullet Point</button></div>` : ''}
          </div>
        `).join('')}
        ${editMode ? `<div class="add-action-area"><button class="add-btn" onclick="addExpEntry(${sIdx})"><span>+</span> Add Professional Entry</button></div>` : ''}
      `;
    } else if (section.type === 'bullets_two_columns') {
        return `
        <ul class="two-col">
          ${section.bullets.map((b, bIdx) => `
            <li contenteditable="${editMode}" onblur="updateColBullet(${sIdx}, ${bIdx}, this.innerText)">
              ${b}
              ${editMode ? `<span class="bullet-ctrl"><button class="del-btn" onclick="removeColBullet(${sIdx}, ${bIdx})">✕</button></span>` : ''}
            </li>
          `).join('')}
        </ul>
        ${editMode ? `<div class="add-action-area"><button class="add-btn" onclick="addColBullet(${sIdx})"><span>+</span> Add List Item</button></div>` : ''}
      `;
    } else if (section.type === 'ventures') {
        return `
        ${section.entries.map((e, eIdx) => `
          <div class="venture">
            ${editMode ? `<div class="entry-ctrl"><button class="del-entry" title="Remove Entry" onclick="removeEntry(${sIdx}, ${eIdx})">✕</button></div>` : ''}
            <strong contenteditable="${editMode}" onblur="updateVenture(${sIdx}, ${eIdx}, 'name', this.innerText)">${e.name}</strong>
            <span class="tag" contenteditable="${editMode}" onblur="updateVenture(${sIdx}, ${eIdx}, 'tag', this.innerText)">${e.tag}</span>
            <p contenteditable="${editMode}" onblur="updateVenture(${sIdx}, ${eIdx}, 'description', this.innerText)">${e.description}</p>
          </div>
        `).join('')}
        ${editMode ? `<div class="add-action-area"><button class="add-btn" onclick="addVentureEntry(${sIdx})"><span>+</span> Add Venture</button></div>` : ''}
      `;
    } else if (section.type === 'skills') {
        return `
        <div class="skills-grid">
          ${section.items.map((item, iIdx) => `
            <div contenteditable="${editMode}" style="position:relative" onblur="updateSkill(${sIdx}, ${iIdx}, this.innerHTML)">
              <strong>${item.label}:</strong> ${item.value}
              ${editMode ? `<span class="bullet-ctrl" style="right:-10px"><button class="del-btn" onclick="removeSkill(${sIdx}, ${iIdx})">✕</button></span>` : ''}
            </div>
          `).join('')}
        </div>
        ${editMode ? `<div class="add-action-area"><button class="add-btn" onclick="addSkill(${sIdx})"><span>+</span> Add Skill Category</button></div>` : ''}
      `;
    }
    return '';
}
