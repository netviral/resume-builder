/**
 * Resume Switcher Component
 * Handles switching between multiple resumes with unsaved changes protection.
 */

const ResumeSwitcher = {
    isOpen: false,
    currentResumeId: 'primary',
    availableResumes: window.availableResumes || [],

    init() {
        this.render();
        this.addEventListeners();
    },

    render() {
        // Create Toggle Button (Floating Launcher)
        if (!document.getElementById('resume-switcher-toggle')) {
            const toggle = document.createElement('button');
            toggle.id = 'resume-switcher-toggle';
            toggle.className = 'tt-right';
            toggle.title = 'Switch Resume';
            toggle.innerHTML = `
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
            `;
            document.body.appendChild(toggle);
        }

        // Create Dock sidebar
        if (!document.getElementById('resume-switcher')) {
            const sidebar = document.createElement('div');
            sidebar.id = 'resume-switcher';
            sidebar.innerHTML = `
                <div class="dock-header" id="switcher-header">
                    <h3>My Resumes</h3>
                    <div class="switcher-search-wrapper">
                        <input type="text" id="switcher-search" placeholder="Search resumes..." autocomplete="off">
                    </div>
                    <div class="dock-actions">
                        <button class="dock-action-btn" id="search-toggle-btn">
                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                        <button class="dock-close" onclick="ResumeSwitcher.close()">✕</button>
                    </div>
                </div>
                <div class="switcher-list" id="switcher-list"></div>
                <div class="switcher-footer">
                    <div class="switcher-item new-resume" onclick="ResumeSwitcher.handleNewResume()">
                        <div class="resume-icon-small new-icon">＋</div>
                        <div class="resume-menu-label">New Resume</div>
                    </div>
                </div>
            `;
            document.body.appendChild(sidebar);
        }

        this.updateList();
    },

    updateList() {
        const list = document.getElementById('switcher-list');
        const searchInput = document.getElementById('switcher-search');
        if (!list) return;

        const query = (searchInput?.value || '').toLowerCase();
        const filteredResumes = this.availableResumes.filter(resume =>
            resume.name.toLowerCase().includes(query)
        );

        if (filteredResumes.length === 0 && query !== '') {
            list.innerHTML = `<div class="switcher-no-results">No resumes found matching "${query}"</div>`;
        } else {
            list.innerHTML = filteredResumes.map(resume => `
                <div class="switcher-item ${resume.id === this.currentResumeId ? 'active' : ''}" 
                     onclick="ResumeSwitcher.handleSwitch('${resume.id}')">
                    <div class="resume-icon-small" style="background-color: ${resume.color || '#334155'}">
                        ${resume.icon || '📝'}
                    </div>
                    <div class="resume-menu-label">${resume.name}</div>
                </div>
            `).join('');
        }
    },

    handleNewResume() {
        if (typeof Modal === 'undefined') {
            alert('New resume function coming soon!');
            return;
        }

        Modal.show({
            title: 'Create New Resume',
            message: 'This will reset the current editor and let you start from scratch. Any unsaved changes will be lost.',
            buttons: [
                {
                    label: 'Create New',
                    className: 'btn-primary',
                    onClick: () => {
                        if (typeof clearEditor === 'function') {
                            clearEditor();
                            this.close();
                        } else {
                            window.location.reload();
                        }
                    }
                },
                {
                    label: 'Cancel',
                    className: 'btn-outline',
                    onClick: () => { }
                }
            ]
        });
    },

    addEventListeners() {
        const toggle = document.getElementById('resume-switcher-toggle');
        const sidebar = document.getElementById('resume-switcher');
        const searchInput = document.getElementById('switcher-search');
        const searchToggle = document.getElementById('search-toggle-btn');

        toggle.onclick = (e) => {
            e.stopPropagation();
            this.open();
        };

        if (searchToggle) {
            searchToggle.onclick = (e) => {
                e.stopPropagation();
                this.toggleSearch();
            };
        }

        if (searchInput) {
            searchInput.oninput = () => this.updateList();

            // Prevent drawer close when clicking search input
            searchInput.onclick = (e) => e.stopPropagation();

            // Clear search when opening drawer
            toggle.addEventListener('click', () => {
                this.toggleSearch(false);
                searchInput.value = '';
                this.updateList();
            });
        }

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                if (document.getElementById('switcher-header').classList.contains('searching')) {
                    this.toggleSearch(false);
                } else {
                    this.close();
                }
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
                this.close();
                this.toggleSearch(false);
            }
        });
    },

    toggleSearch(force) {
        const header = document.getElementById('switcher-header');
        const searchInput = document.getElementById('switcher-search');
        const list = document.getElementById('switcher-list');
        const isSearching = header.classList.contains('searching');

        const show = force !== undefined ? force : !isSearching;

        if (show) {
            // Lock current height before entering search mode
            const currentHeight = list.offsetHeight;
            list.style.height = `${currentHeight}px`;

            header.classList.add('searching');
            searchInput.focus();
        } else {
            header.classList.remove('searching');
            searchInput.value = '';

            // Unlock height
            list.style.height = '';

            this.updateList();
        }
    },

    toggle() {
        this.isOpen ? this.close() : this.open();
    },

    open() {
        this.isOpen = true;
        document.getElementById('resume-switcher').classList.add('open');
        document.getElementById('resume-switcher-toggle').classList.add('open');
    },

    close() {
        this.isOpen = false;
        document.getElementById('resume-switcher').classList.remove('open');
        document.getElementById('resume-switcher-toggle').classList.remove('open');
    },

    handleSwitch(id) {
        if (id === this.currentResumeId) {
            this.close();
            return;
        }

        // Check for unsaved changes (using history length as a proxy)
        const hasUnsavedChanges = typeof history !== 'undefined' && history.undoStack && history.undoStack.length > 0;

        if (hasUnsavedChanges) {
            this.showConfirmationModal(id);
        } else {
            this.executeSwitch(id);
        }
    },

    showConfirmationModal(id) {
        if (typeof Modal === 'undefined') {
            this.executeSwitch(id);
            return;
        }

        Modal.show({
            title: 'Unsaved Changes',
            message: 'You have unsaved edits in your current resume. What would you like to do before switching?',
            buttons: [
                {
                    label: 'Save & Switch',
                    className: 'btn-primary',
                    onClick: () => {
                        if (typeof exportFile === 'function') exportFile('js');
                        this.executeSwitch(id);
                    }
                },
                {
                    label: 'Discard and Switch',
                    className: 'btn-danger-outline',
                    onClick: () => this.executeSwitch(id)
                }
            ]
        });
    },

    executeSwitch(id) {
        const resume = this.availableResumes.find(r => r.id === id);
        if (!resume) return;
        this.currentResumeId = id;
        this.updateList();

        // Load New Content from global data via getData()
        if (typeof loadResumeData === 'function') {
            loadResumeData(resume.getData());
        }

        // Reset scroll position
        window.scrollTo(0, 0);

        this.close();
    }
};

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => ResumeSwitcher.init());
