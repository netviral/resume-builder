/**
 * Rendering logic for the Resume Builder
 */

function renderResume() {
  renderHeader();
  renderSections();
}

function renderHeader() {
  const root = document.getElementById('header-root');
  const m = resumeData.metadata;

  const taglineHtml = (m.tagline || editMode) ? `
        <div class="tagline-wrap" style="position:relative">
            <p class="tagline" contenteditable="${editMode}" onblur="updateMeta('tagline', this.innerText)">${m.tagline}</p>
            ${editMode ? `<button class="del-inline" title="Remove tagline" onclick="removeTagline()">✕</button>` : ''}
        </div>
    ` : '';

  const contactsHtml = `<div class="contacts">
        ${m.contacts.map((c, i) => `
            <div class="contact-item" style="position:relative; display:inline-block">
                <a href="${c.href}" contenteditable="${editMode}" onblur="updateContact(${i}, this.innerText)">${c.label}</a>
                ${editMode ? `<button class="del-inline" title="Remove contact" onclick="removeContact(${i})">✕</button>` : ''}
                ${i < m.contacts.length - 1 ? '<span>|</span>' : ''}
            </div>
        `).join('')}
        ${editMode ? `<button class="add-btn small" style="margin-left:0.5rem" onclick="addContact()">+ link</button>` : ''}
    </div>`;

  root.innerHTML = `
      <div class="header">
        <h1 contenteditable="${editMode}" onblur="updateMeta('name', this.innerText)">${m.name}</h1>
        ${taglineHtml}
        ${contactsHtml}
      </div>
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
          <button class="up-section" title="Move Up" onclick="moveSection(${sIdx}, -1)">↑</button>
          <button class="down-section" title="Move Down" onclick="moveSection(${sIdx}, 1)">↓</button>
          <div style="height:5px"></div>
          <button class="del-section" title="Remove entire section" onclick="removeSection(${sIdx})">✕</button>
        </div>
        <section>
          <div class="section-title" contenteditable="${editMode}" onblur="updateSectionTitle(${sIdx}, this.innerText)">${section.title}</div>
          <div class="section-content">
            ${renderSectionContent(section, sIdx)}
          </div>
        </section>
      `;

    sectionEl.innerHTML = content;
    root.appendChild(sectionEl);
  });
}

function renderSectionContent(section, sIdx) {
  const type = section.type;

  if (type === 'table_3col') {
    return `
        <table class="edu-table">
          ${section.entries.map((e, eIdx) => `
            <tr class="entry">
              <td>
                <strong contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'col1', this.innerText)">${e.col1 || e.institution || ''}</strong>
              </td>
              <td contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'col2', this.innerText)">${e.col2 || e.details || ''}</td>
              <td contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'col3', this.innerText)">${e.col3 || e.date || ''}</td>
              <td style="position:relative; width:0; padding:0">
                 ${editMode ? `<div class="entry-ctrl"><button class="del-entry" title="Remove Entry" onclick="removeEntry(${sIdx}, ${eIdx})">✕</button></div>` : ''}
              </td>
            </tr>
          `).join('')}
        </table>
        ${editMode ? `<div class="add-action-area"><button class="add-btn" onclick="addEntry(${sIdx})"><span>+</span> Add Row</button></div>` : ''}
      `;
  } else if (type === 'detailed_list') {
    return `
        ${section.entries.map((e, eIdx) => `
          <div class="entry">
            ${editMode ? `<div class="entry-ctrl"><button class="del-entry" title="Remove Entry" onclick="removeEntry(${sIdx}, ${eIdx})">✕</button></div>` : ''}
            <div class="entry-header">
              <span class="entry-org" contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'heading', this.innerText)">${e.heading || e.organization || ''}</span>
              <span class="entry-date" contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'date', this.innerText)">${e.date || ''}</span>
            </div>
            ${(e.subheading || e.role) ? `<div class="entry-role" contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'subheading', this.innerText)">${e.subheading || e.role}</div>` : ''}
            <ul class="bullets">
              ${(e.bullets || []).map((b, bIdx) => `
                <li style="position:relative">
                  <span contenteditable="${editMode}" onblur="updateBullet(${sIdx}, ${eIdx}, ${bIdx}, this.innerHTML)">${b}</span>
                  ${editMode ? `<span class="bullet-ctrl"><button class="del-btn" onclick="removeBullet(${sIdx}, ${eIdx}, ${bIdx})">✕</button></span>` : ''}
                </li>
              `).join('')}
            </ul>
            ${editMode ? `<div class="add-action-area compact" style="padding-left:1.2rem"><button class="add-btn small" onclick="addBullet(${sIdx}, ${eIdx})"><span>+</span> Add Bullet Point</button></div>` : ''}
          </div>
        `).join('')}
        ${editMode ? `<div class="add-action-area"><button class="add-btn" onclick="addEntry(${sIdx})"><span>+</span> Add Entry</button></div>` : ''}
      `;
  } else if (type === 'bullet_grid') {
    return `
        <ul class="two-col">
          ${section.bullets.map((b, bIdx) => `
            <li style="position:relative">
              <span contenteditable="${editMode}" onblur="updateColBullet(${sIdx}, ${bIdx}, this.innerText)">${b}</span>
              ${editMode ? `<span class="bullet-ctrl"><button class="del-btn" onclick="removeColBullet(${sIdx}, ${bIdx})">✕</button></span>` : ''}
            </li>
          `).join('')}
        </ul>
        ${editMode ? `<div class="add-action-area"><button class="add-btn" onclick="addColBullet(${sIdx})"><span>+</span> Add List Item</button></div>` : ''}
      `;
  } else if (type === 'simple_list') {
    return `
        ${section.entries.map((e, eIdx) => `
          <div class="entry venture">
            ${editMode ? `<div class="entry-ctrl"><button class="del-entry" title="Remove Entry" onclick="removeEntry(${sIdx}, ${eIdx})">✕</button></div>` : ''}
            <strong contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'heading', this.innerText)">${e.heading || e.name || ''}</strong>
            <span class="tag" contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'subheading', this.innerText)">${e.subheading || e.tag || ''}</span>
            <p contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'description', this.innerText)">${e.description || ''}</p>
          </div>
        `).join('')}
        ${editMode ? `<div class="add-action-area"><button class="add-btn" onclick="addEntry(${sIdx})"><span>+</span> Add Entry</button></div>` : ''}
      `;
  } else if (type === 'key_value_grid') {
    return `
        <div class="skills-grid">
          ${section.items.map((item, iIdx) => `
            <div class="entry" style="position:relative">
              ${editMode ? `<div class="entry-ctrl"><button class="del-entry" title="Remove Item" onclick="removeSkill(${sIdx}, ${iIdx})">✕</button></div>` : ''}
              <div contenteditable="${editMode}" onblur="updateSkill(${sIdx}, ${iIdx}, this.innerHTML)">
                <strong>${item.label}:</strong> ${item.value}
              </div>
            </div>
          `).join('')}
        </div>
        ${editMode ? `<div class="add-action-area"><button class="add-btn" onclick="addSkill(${sIdx})"><span>+</span> Add Row</button></div>` : ''}
      `;
  } else if (type === 'paragraph') {
    return `
        <div class="summary-wrap" style="position:relative">
          <div class="summary" contenteditable="${editMode}" onblur="updateSectionContent(${sIdx}, this.innerText)">
              ${section.content || ''}
          </div>
        </div>
    `;
  }
  return '';
}
