/**
 * Sidebar / Outliner Logic
 * Manages the hierarchical tree of resume sections, entries, and bullets.
 */

function toggleSidebar() {
    const body = document.body;
    const sidebar = document.getElementById('sidebar-left');
    const isOpen = sidebar.classList.toggle('open');
    body.classList.toggle('sidebar-open', isOpen);

    // If opening sidebar, close AI panel if it was open
    if (isOpen && body.classList.contains('ai-open')) {
        toggleAIPanel();
    }

    if (isOpen) {
        renderSidebar();
    }
}

function renderSidebar() {
    const container = document.getElementById('sidebar-tree');
    if (!container || !resumeData) return;

    container.innerHTML = '';

    // 1. Root Node: Resume
    const rootNode = createTreeNode({
        label: resumeData.metadata.name || 'Untitled Resume',
        icon: '📄',
        level: 1,
        expanded: true,
        actions: []
    });
    container.appendChild(rootNode);

    const childrenContainer = rootNode.querySelector('.tree-children');

    // 2. Sections
    resumeData.sections.forEach((section, sIdx) => {
        const sectionNode = createTreeNode({
            label: section.title || 'Untitled Section',
            icon: '📁',
            level: 2,
            expanded: false,
            onHeaderClick: () => scrollToSection(sIdx),
            actions: [
                {
                    icon: '✕',
                    title: 'Remove Section',
                    onClick: (e) => {
                        e.stopPropagation();
                        removeSection(sIdx);
                        renderSidebar();
                    }
                }
            ]
        });
        childrenContainer.appendChild(sectionNode);

        const entryChildren = sectionNode.querySelector('.tree-children');

        // 3. Entries (if applicable)
        if (section.entries && Array.isArray(section.entries)) {
            section.entries.forEach((entry, eIdx) => {
                const entryLabel = entry.heading || entry.col1 || `Entry ${eIdx + 1}`;
                const entryNode = createTreeNode({
                    label: entryLabel,
                    icon: '📝',
                    level: 3,
                    expanded: false,
                    onHeaderClick: () => scrollToEntry(sIdx, eIdx),
                    actions: [
                        {
                            icon: '✕',
                            title: 'Remove Entry',
                            onClick: (e) => {
                                e.stopPropagation();
                                removeEntry(sIdx, eIdx);
                                renderSidebar();
                            }
                        }
                    ]
                });
                entryChildren.appendChild(entryNode);

                const bulletChildren = entryNode.querySelector('.tree-children');

                // 4. Bullets (if applicable)
                if (entry.bullets && Array.isArray(entry.bullets)) {
                    entry.bullets.forEach((bullet, bIdx) => {
                        const bulletNode = createTreeNode({
                            label: bullet.replace(/<[^>]*>?/gm, '').substring(0, 40) + (bullet.length > 40 ? '...' : ''),
                            icon: '•',
                            level: 4,
                            onHeaderClick: () => scrollToBullet(sIdx, eIdx, bIdx),
                            actions: [
                                {
                                    icon: '✕',
                                    title: 'Remove Bullet',
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        removeBullet(sIdx, eIdx, bIdx);
                                        renderSidebar();
                                    }
                                }
                            ]
                        });
                        bulletChildren.appendChild(bulletNode);
                    });
                }
            });
        }

        // 3b. Items (for grids/lists)
        if (section.items && Array.isArray(section.items)) {
            section.items.forEach((item, iIdx) => {
                const itemLabel = typeof item === 'string' ? item : (item.label || item.name || `Item ${iIdx + 1}`);
                const itemNode = createTreeNode({
                    label: itemLabel,
                    icon: '🔹',
                    level: 3,
                    onHeaderClick: () => scrollToItem(sIdx, iIdx),
                    actions: [
                        {
                            icon: '✕',
                            title: 'Remove Item',
                            onClick: (e) => {
                                e.stopPropagation();
                                // Handle different item removal types
                                if (section.type === 'key_value_grid') removeSkill(sIdx, iIdx);
                                else removeColBullet(sIdx, iIdx);
                                renderSidebar();
                            }
                        }
                    ]
                });
                entryChildren.appendChild(itemNode);
            });
        }
    });

    // 5. Removed Sections (Support for "Adding back")
    renderRemovedSections(container);
}

function createTreeNode(options) {
    const { label, icon, level, expanded, onHeaderClick, actions } = options;

    const node = document.createElement('div');
    node.className = `tree-node level-${level} ${expanded ? 'expanded' : ''}`;

    const header = document.createElement('div');
    header.className = 'node-header';
    if (onHeaderClick) {
        header.onclick = onHeaderClick;
    } else {
        header.onclick = () => node.classList.toggle('expanded');
    }

    const iconSpan = document.createElement('span');
    iconSpan.className = 'node-icon';
    iconSpan.textContent = icon || (expanded ? '▼' : '▶');

    const labelSpan = document.createElement('span');
    labelSpan.className = 'node-label';
    labelSpan.textContent = label;

    header.appendChild(iconSpan);
    header.appendChild(labelSpan);

    if (actions && actions.length > 0) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'node-actions';
        actions.forEach(act => {
            const btn = document.createElement('button');
            btn.className = 'node-btn';
            btn.textContent = act.icon;
            btn.title = act.title;
            btn.onclick = act.onClick;
            actionsDiv.appendChild(btn);
        });
        header.appendChild(actionsDiv);
    }

    node.appendChild(header);

    const children = document.createElement('div');
    children.className = 'tree-children';
    node.appendChild(children);

    return node;
}

/**
 * Renders sections that are present in originalJRS but not in current resumeData.sections
 */
function renderRemovedSections(container) {
    if (!resumeData.originalJRS || !resumeData.originalJRS.meta || !resumeData.originalJRS.meta.sections) return;

    const currentIds = new Set(resumeData.sections.map(s => s.id));
    const removed = resumeData.originalJRS.meta.sections.filter(s => !currentIds.has(s.id));

    if (removed.length === 0) return;

    const separator = document.createElement('div');
    separator.style.margin = '20px 8px 8px';
    separator.style.fontSize = '10px';
    separator.style.textTransform = 'uppercase';
    separator.style.color = 'rgba(255,255,255,0.2)';
    separator.style.letterSpacing = '1px';
    separator.textContent = 'Hidden Sections';
    container.appendChild(separator);

    removed.forEach(section => {
        const node = createTreeNode({
            label: section.title || section.id,
            icon: '👁️‍🗨️',
            level: 2,
            actions: [
                {
                    icon: '＋',
                    title: 'Add Back',
                    onClick: (e) => {
                        e.stopPropagation();
                        addSectionBack(section);
                    }
                }
            ]
        });
        container.appendChild(node);
    });
}

function addSectionBack(section) {
    history.save();
    // Hydrate the section data before adding
    const hydrated = { ...section, ...mapJRSData(section) };
    resumeData.sections.push(hydrated);
    renderResume();
    renderSidebar();
}

/**
 * Scroll Helpers
 */
function scrollToSection(sIdx) {
    const sections = document.querySelectorAll('.section-wrapper');
    if (sections[sIdx]) {
        sections[sIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightElement(sections[sIdx]);
    }
}

function scrollToEntry(sIdx, eIdx) {
    const sections = document.querySelectorAll('.section-wrapper');
    if (sections[sIdx]) {
        const entries = sections[sIdx].querySelectorAll('.entry');
        if (entries[eIdx]) {
            entries[eIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
            highlightElement(entries[eIdx]);
        }
    }
}

function scrollToBullet(sIdx, eIdx, bIdx) {
    const sections = document.querySelectorAll('.section-wrapper');
    if (sections[sIdx]) {
        const entries = sections[sIdx].querySelectorAll('.entry');
        if (entries[eIdx]) {
            const bullets = entries[eIdx].querySelectorAll('li');
            if (bullets[bIdx]) {
                bullets[bIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
                highlightElement(bullets[bIdx]);
            }
        }
    }
}

function scrollToItem(sIdx, iIdx) {
    const sections = document.querySelectorAll('.section-wrapper');
    if (sections[sIdx]) {
        // Handle items in grids/lists
        const items = sections[sIdx].querySelectorAll('.comma-item, .skills-grid .entry, .two-col li');
        if (items[iIdx]) {
            items[iIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
            highlightElement(items[iIdx]);
        }
    }
}

function highlightElement(el) {
    el.classList.add('sidebar-highlight');
    setTimeout(() => el.classList.remove('sidebar-highlight'), 2000);
}
