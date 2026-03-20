function renderResume() {
  if (!resumeData) return;
  renderHeader();
  renderSections();
}

function renderHeader() {
  const root = document.getElementById('header-root');
  if (!root) return;

  // Support both JRS and old format
  const b = resumeData.basics || {};
  const m = resumeData.metadata || {};
  const name = b.name || m.name || "";
  const tagline = b.label || m.tagline || "";

  // Map contacts
  let contacts = [];
  if (b.email) contacts.push({ label: b.email, href: `mailto:${b.email}` });
  if (b.phone) contacts.push({ label: b.phone, href: `tel:${b.phone}` });
  if (b.url) contacts.push({ label: b.url, href: b.url });
  if (b.profiles) {
    b.profiles.forEach(p => contacts.push({ label: p.label || p.network, href: p.url }));
  }
  // Fallback to old format
  if (contacts.length === 0 && m.contacts) contacts = m.contacts;

  const taglineHtml = (tagline || editMode) ? `
        <div class="tagline-wrap" style="position:relative">
            <p class="tagline" contenteditable="${editMode}" onblur="updateMeta('tagline', this.innerText)">${tagline}</p>
            ${editMode ? `<button class="del-inline" title="Remove tagline" onclick="removeTagline()">✕</button>` : ''}
        </div>
    ` : '';

  const contactsHtml = `<div class="contacts">
        ${contacts.map((c, i) => `
            <div class="contact-item" style="position:relative; display:inline-block">
                ${editMode ?
      `<a href="javascript:void(0)" onclick="editContact(${i})" class="edit-link-trigger">${c.label}</a>` :
      `<a href="${c.href}" target="_blank">${c.label}</a>`
    }
                ${i < contacts.length - 1 ? '<span>|</span>' : ''}
            </div>
        `).join('')}
        ${editMode ? `<button class="add-btn small" style="margin-left:0.5rem" onclick="addContact()">+ link</button>` : ''}
    </div>`;

  root.innerHTML = `
      <div class="header">
        <h1 contenteditable="${editMode}" onblur="updateMeta('name', this.innerText)">${name}</h1>
        ${taglineHtml}
        ${contactsHtml}
      </div>
    `;
}

function renderSections() {
  const root = document.getElementById('sections-root');
  if (!root) return;
  root.innerHTML = '';

  // Get sections layout
  let sectionsToRender = [];
  if (resumeData.meta && resumeData.meta.sections) {
    sectionsToRender = resumeData.meta.sections.map(s => {
      return { ...s, ...mapJRSData(s) };
    });
  } else if (resumeData.sections) {
    sectionsToRender = resumeData.sections;
  }

  sectionsToRender.forEach((section, sIdx) => {
    const sectionEl = document.createElement('div');
    sectionEl.className = 'section-wrapper';

    const schema = window.sectionSchema[section.type];
    const showTitle = schema ? !schema.hideTitle : true;
    const canSendToAI = schema ? schema.allowAI : true;

    const ctrlHtml = editMode ? `
        <div class="section-ctrl">
          ${canSendToAI ? `<button class="ai-send-section-btn" title="Send Section to AI" onclick="sendSectionToAI('${section.id}')"></button>` : ''}
          <button class="up-section" title="Move Up" onclick="moveSection(${sIdx}, -1)">↑</button>
          <button class="down-section" title="Move Down" onclick="moveSection(${sIdx}, 1)">↓</button>
          <button class="del-section" title="Remove entire section" onclick="removeSection(${sIdx})">✕</button>
        </div>
    ` : '';

    let content = `
        ${ctrlHtml}
        <section>
          ${showTitle ? `<div class="section-title" contenteditable="${editMode}" onblur="updateSectionTitle(${sIdx}, this.innerText)">${section.title}</div>` : ''}
          <div class="section-content">
            ${renderSectionContent(section, sIdx)}
          </div>
        </section>
      `;

    sectionEl.innerHTML = content;
    root.appendChild(sectionEl);
  });
}

/**
 * Date Formatter: Handles all date scenarios cleanly
 * - startDate + endDate → "2022 – 2026"
 * - startDate only     → "2022 – Present"
 * - endDate only       → "2020"
 * - plain date string  → returned as-is
 */
function formatDateRange(item) {
  if (item.startDate && item.endDate) {
    return `${item.startDate.substring(0, 4)} – ${item.endDate.substring(0, 4)}`;
  }
  if (item.startDate) {
    return `${item.startDate.substring(0, 4)} – Present`;
  }
  if (item.endDate) {
    return item.endDate.substring(0, 4);
  }
  return item.date || "";
}

/**
 * Mapper: Translates JRS keys to internal section structure
 */
function mapJRSData(section) {
  const source = section.source;
  if (!source) return {};

  const parts = source.split('.');
  // Try multiple roots to ensure we find the data:
  // 1. Original JRS (best for raw sources)
  // 2. Hydrated resumeData (fallback)
  // 3. The global window.resumeDataRes (as a last resort for primary resume)
  const potentialRoots = [
    resumeData.originalJRS,
    resumeData,
    window.resumeDataRes
  ];

  let data = null;
  for (const root of potentialRoots) {
    if (!root) continue;
    let current = root;
    parts.forEach(p => { if (current && current[p] !== undefined) current = current[p]; else current = null; });
    if (current && (Array.isArray(current) || typeof current === 'string')) {
      data = current;
      break;
    }
  }

  // Desperate Fallback: If still not found and path ends in 'subjects', try to find subjects anywhere
  if (!data && parts.includes('subjects')) {
    potentialRoots.forEach(root => {
      if (!root) return;
      if (root.subjects) data = root.subjects;
      if (!data && root.custom && root.custom.subjects) data = root.custom.subjects;
    });
  }

  const offset = section.offset || 0;
  const count = section.count;

  if (data && Array.isArray(data)) {
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
    if (section.type === 'bullet_grid' || section.type === 'comma_list') {
      // Special Case: Flatten Skills Keywords into a horizontal list
      if (source.toLowerCase().includes('skills')) {
        const allKeywords = [];
        subset.forEach(s => { if (s.keywords) allKeywords.push(...s.keywords); });
        return { items: allKeywords };
      }
      return {
        items: subset.map(item => {
          if (typeof item === 'string') return item;
          if (item.language) return `${item.language} (${item.fluency || ''})`;
          return item.name || item.heading || item.label || "";
        })
      };
    }
  }

  if (section.type === 'paragraph' && typeof data === 'string') {
    return { content: data };
  }

  return section;
}

function renderSectionContent(section, sIdx) {
  const type = section.type;

  const schema = window.sectionSchema[type];
  const canSendToAI = schema ? schema.allowAI : true;

  if (type === 'table_3col') {
    return `
        <table class="edu-table">
          ${section.entries.map((e, eIdx) => `
            <tr class="entry">
              <td>
                <strong contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'col1', this.innerText)">${e.col1 || ''}</strong>
              </td>
              <td style="width: 45%; padding-right: 1rem;">
                <span contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'col2', this.innerText)">${e.col2 || ''}</span>
              </td>
              <td style="text-align: right;">
                <span contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'col3', this.innerText)">${e.col3 || ''}</span>
              </td>
              <td style="position:relative; width:0; padding:0">
                 ${editMode ? `<div class="entry-ctrl">
                    ${canSendToAI ? `<button class="ai-send-entry-btn" title="Send Entry to AI" onclick="sendEntryToAI('${section.id}', ${eIdx})"></button>` : ''}
                    <button class="del-entry" title="Remove Entry" onclick="removeEntry(${sIdx}, ${eIdx})">✕</button>
                 </div>` : ''}
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
            ${editMode ? `<div class="entry-ctrl">
                ${canSendToAI ? `<button class="ai-send-entry-btn" title="Send Entry to AI" onclick="sendEntryToAI('${section.id}', ${eIdx})"></button>` : ''}
                <button class="del-entry" title="Remove Entry" onclick="removeEntry(${sIdx}, ${eIdx})">✕</button>
            </div>` : ''}
            <div class="entry-header">
              <span class="entry-org" contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'heading', this.innerText)">${e.heading || ''}</span>
              <span class="entry-date" contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'date', this.innerText)">${e.date || ''}</span>
            </div>
            ${e.subheading ? `<div class="entry-role" contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'subheading', this.innerText)">${e.subheading}</div>` : ''}
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
          ${(section.items || []).map((b, bIdx) => `
            <li style="position:relative">
              <span contenteditable="${editMode}" onblur="updateColBullet(${sIdx}, ${bIdx}, this.innerText)">${b}</span>
              ${editMode ? `<span class="bullet-ctrl"><button class="del-btn" onclick="removeColBullet(${sIdx}, ${bIdx})">✕</button></span>` : ''}
            </li>
          `).join('')}
        </ul>
        ${editMode ? `<div class="add-action-area"><button class="add-btn" onclick="addColBullet(${sIdx})"><span>+</span> Add List Item</button></div>` : ''}
      `;
  } else if (type === 'comma_list') {
    return `
        <div class="comma-list-para">
          ${(section.items || []).map((item, iIdx) => `
            <span class="comma-item">
              <span contenteditable="${editMode}" onblur="updateColBullet(${sIdx}, ${iIdx}, this.innerText.replace(',', '').trim())">${item}</span>
              ${editMode ? `<button class="del-inline" title="Delete" onclick="removeColBullet(${sIdx}, ${iIdx})">✕</button>` : ''}
              ${iIdx < section.items.length - 1 ? '<span class="sep">, </span>' : ''}
            </span>
          `).join('')}
          ${editMode ? `<button class="add-btn small" title="Add Item" style="margin-left: 0.5rem;" onclick="addColBullet(${sIdx})">+ item</button>` : ''}
        </div>
      `;
  } else if (type === 'simple_list') {
    return `
        ${section.entries.map((e, eIdx) => `
          <div class="entry venture">
            ${editMode ? `<div class="entry-ctrl">
                ${canSendToAI ? `<button class="ai-send-entry-btn" title="Send Entry to AI" onclick="sendEntryToAI('${section.id}', ${eIdx})"></button>` : ''}
                <button class="del-entry" title="Remove Entry" onclick="removeEntry(${sIdx}, ${eIdx})">✕</button>
            </div>` : ''}
            <strong contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'heading', this.innerText)">${e.heading || ''}</strong>
            <span class="tag" contenteditable="${editMode}" onblur="updateEntryField(${sIdx}, ${eIdx}, 'subheading', this.innerText)">${e.subheading || ''}</span>
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
              ${editMode ? `<div class="entry-ctrl">
                  ${canSendToAI ? `<button class="ai-send-entry-btn" title="Send Item to AI" onclick="sendEntryToAI('${section.id}', ${iIdx})"></button>` : ''}
                  <button class="del-entry" title="Remove Item" onclick="removeSkill(${sIdx}, ${iIdx})">✕</button>
              </div>` : ''}
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
        <div class="para-wrap" style="position:relative">
          <div class="para-block" contenteditable="${editMode}" onblur="updateSectionContent(${sIdx}, this.innerText)">
              ${section.content || ''}
          </div>
        </div>
    `;
  }
  return '';
}

