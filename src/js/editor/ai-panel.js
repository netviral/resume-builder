/**
 * AI Resume Assistant Panel
 * Collapsible AI chat sidebar with context-aware resume assistance
 */

// ── STATE ──────────────────────────────────────────────────────────────────
const aiPanel = {
    isOpen: false,
    history: [],       // Array of { type: 'msg'|'ctx', role, content, label, data, id, isSent }
    isTyping: false,

    // Mock responses keyed by intent keywords
    mockResponses: [
        {
            triggers: ['bullet', 'rewrite', 'improve', 'enhance', 'better'],
            responses: [
                "Here are some stronger bullet point alternatives I'd suggest for the selected entry:\n\n• Led cross-functional initiatives resulting in a 40% improvement in delivery speed\n• Architected scalable microservices handling 10M+ requests/day with 99.9% uptime\n• Mentored a team of 4 junior engineers, improving team velocity by 25%\n\nWant me to apply any of these, or would you like variations tailored to a specific job?",
                "I've analysed the entry and here are more impactful rewrites:\n\n• Spearheaded the migration of legacy monolith to microservices, reducing latency by 60%\n• Drove adoption of CI/CD practices across 3 engineering teams\n• Delivered critical feature 2 weeks ahead of schedule, unblocking Q3 launch\n\nThese use stronger action verbs and quantify impact. Shall I apply them?"
            ]
        },
        {
            triggers: ['add', 'new entry', 'insert', 'create'],
            responses: [
                "Sure! Here's a template for a new entry I can add to the selected section:\n\n**Heading:** [Company / Project Name]\n**Subheading:** [Role / Technology]\n**Date:** [Year – Year]\n**Bullets:**\n• [Achievement or responsibility]\n• [Impact with metric if possible]\n\nJust tell me the details and I'll populate it and add it to your resume.",
                "I can add a new entry for you. What should go in it? Give me the company name, role, dates, and any key accomplishments — I'll format it in the right style and add it to your resume."
            ]
        },
        {
            triggers: ['summary', 'bio', 'profile', 'about'],
            responses: [
                "Here's a revised summary that better captures your experience:\n\n*Experienced software engineer with a track record of building high-scale systems and leading cross-functional teams. Passionate about turning complex problems into elegant, maintainable solutions. Proven ability to deliver in fast-paced, ambiguous environments.*\n\nWant me to tailor this to the attached job description?",
            ]
        },
        {
            triggers: ['job', 'tailor', 'match', 'ats', 'keywords'],
            responses: [
                "Looking at the attached job description, here are the key skills and keywords you should highlight more:\n\n✅ Already present: Python, system design, cross-functional collaboration\n⚠️ Missing or underplayed: distributed systems, RLHF, A/B testing, stakeholder management\n\nShould I rewrite specific bullets to surface these keywords naturally?",
                "Based on the job description, I'd recommend:\n\n1. Moving your most relevant project to the top of the Projects section\n2. Adding 'led cross-team alignment' language to your work experience\n3. Including the specific tech stack mentioned in the JD in your Skills section\n\nShall I make these changes?"
            ]
        },
        {
            triggers: ['skills', 'technologies', 'tech stack'],
            responses: [
                "Based on your experience, here are some skills worth adding to your Skills section:\n\n• System Design, Distributed Systems\n• REST / GraphQL APIs\n• Docker, Kubernetes\n• TypeScript, Go\n\nWant me to update the Skills section with these?"
            ]
        }
    ],

    getRandomMockResponse(userMessage) {
        const msg = userMessage.toLowerCase();
        for (const group of this.mockResponses) {
            if (group.triggers.some(t => msg.includes(t))) {
                const arr = group.responses;
                return arr[Math.floor(Math.random() * arr.length)];
            }
        }
        // Default response
        const defaults = [
            "I've reviewed your resume. It's solid! A few quick wins:\n\n1. **Quantify more** — Add numbers to any bullet that doesn't have a metric yet\n2. **Action verbs** — Start each bullet with a strong verb (Led, Built, Drove, Reduced)\n3. **Tailoring** — Attach a job description so I can highlight the right keywords\n\nWhat would you like to work on first?",
            "Great question. Looking at your resume holistically, the structure and content are strong. To really make it stand out:\n\n• The Work Experience section could benefit from 1–2 more impact metrics\n• Your summary is good but could be more specific to your target role\n• Consider reordering sections if you're targeting a specific company\n\nWant me to suggest specific edits?",
            "Happy to help with that! Can you give me a bit more detail about what you're aiming for? For example:\n\n• Are you targeting a specific role or company?\n• Which section feels weakest to you?\n• Do you have a job description you'd like to align to?\n\nAttach some context with the + button and I can give much more specific suggestions."
        ];
        return defaults[Math.floor(Math.random() * defaults.length)];
    }
};

// ── DOM HELPERS ──────────────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function getEl(id) { return $(id); }

// ── PANEL TOGGLE ─────────────────────────────────────────────────────────────
function toggleAIPanel() {
    aiPanel.isOpen = !aiPanel.isOpen;
    const panel = $('ai-panel');
    const btn = $('ai-toggle-btn');

    if (aiPanel.isOpen) {
        // If opening AI panel, close sidebar if it was open
        if (document.body.classList.contains('sidebar-open')) {
            toggleSidebar();
        }

        panel.classList.add('open');
        btn.classList.add('active');
        document.body.classList.add('ai-open');
        btn.setAttribute('title', 'Close AI Assistant');
        setTimeout(() => scrollToBottom(), 360); // Wait for open transition
    } else {
        panel.classList.remove('open');
        btn.classList.remove('active');
        document.body.classList.remove('ai-open');
        btn.setAttribute('title', 'Open AI Assistant');
    }
}

function openAIPanel() {
    if (!aiPanel.isOpen) toggleAIPanel();
}

// ── CONTEXT & HISTORY MANAGEMENT ─────────────────────────────────────────────
function addContext(type, label, icon, data) {
    // For 'resume', we might want to consolidate, but for now just push to history
    aiPanel.history.push({
        type: 'ctx',
        ctxType: type,
        label: label,
        data: data,
        id: Date.now() + Math.random(),
        isSent: false
    });
    renderMessages();
    scrollToBottom(true, true);
}

function removeContext(id) {
    aiPanel.history = aiPanel.history.filter(h => h.id !== id);
    renderMessages();
}

function toggleContextDetails(id) {
    const el = document.getElementById(`details-${id}`);
    if (el) {
        el.classList.toggle('open');

        // If it's the latest item in history, scroll to bottom
        const lastItem = aiPanel.history[aiPanel.history.length - 1];
        if (lastItem && lastItem.id === id) {
            setTimeout(() => scrollToBottom(true, true), 50);
        }
    }
}

// ── CONTEXT BUILDERS ──────────────────────────────────────────────────────────
function sendFullResumeToAI() {
    if (!resumeData) return;

    // Filter resumeData to only include sections allowed by schema
    const filteredResume = JSON.parse(JSON.stringify(resumeData));
    if (filteredResume.sections) {
        filteredResume.sections = filteredResume.sections.filter(s => {
            const schema = window.sectionSchema[s.type];
            return schema ? schema.allowAI : true;
        });
    }

    addContext('resume', 'Full Resume', '', JSON.stringify(filteredResume, null, 2));
    openAIPanel();
    closeAllDropdowns();
}

function sendSectionToAI(sectionId) {
    if (!resumeData) return;
    const section = resumeData.sections?.find(s => s.id === sectionId);
    if (!section) return;

    const schema = window.sectionSchema[section.type];
    if (schema && schema.allowAI === false) {
        return;
    }

    // Fetch original raw data from data.js source path
    const rawData = getRawSourceData(section.source);
    addContext('section', section.title, '', JSON.stringify(rawData, null, 2));
    openAIPanel();
}

function sendEntryToAI(sectionId, entryIndex) {
    if (!resumeData) return;
    const section = resumeData.sections?.find(s => s.id === sectionId);
    if (!section) return;

    // Navigate to raw source array
    const rawArray = getRawSourceData(section.source);
    if (!Array.isArray(rawArray)) return;

    // Account for section offset
    const offset = section.offset || 0;
    const entry = rawArray[offset + entryIndex];
    if (!entry) return;

    const label = entry.name || entry.company || entry.heading || entry.label || `Entry ${entryIndex + 1}`;
    addContext('entry', label, '', JSON.stringify(entry, null, 2));
    openAIPanel();
}

/**
 * Traverses resumeData using a dot-path (e.g. 'work' or 'basics.profiles')
 * to get the original objects loaded from data.js
 */
function getRawSourceData(sourcePath) {
    if (!sourcePath) return null;
    const parts = sourcePath.split('.');
    // Use originalJRS which contains the raw keys like 'highlights' and 'startDate'
    let target = resumeData.originalJRS || resumeData;
    for (const part of parts) {
        if (!target) return null;
        target = target[part];
    }
    return target;
}

function setJobContext(jobId) {
    const job = (window.sampleJobs || []).find(j => j.id === jobId);
    if (!job) return;
    addContext('job', `${job.title} @ ${job.company}`, '', job.description);
    closeAllDropdowns();
}

// ── DROPDOWN MANAGEMENT ───────────────────────────────────────────────────────
function toggleContextMenu() {
    const menu = $('ai-context-menu');
    menu.classList.toggle('open');
    $('ai-job-picker').classList.remove('open');
}

function toggleJobPicker() {
    const picker = $('ai-job-picker');
    picker.classList.toggle('open');
    $('ai-context-menu').classList.remove('open');
}

function closeAllDropdowns() {
    $('ai-context-menu')?.classList.remove('open');
    $('ai-job-picker')?.classList.remove('open');
}

// ── CHAT MESSAGES ─────────────────────────────────────────────────────────────
function appendMessage(role, content) {
    aiPanel.history.push({ type: 'msg', role, content, id: Date.now() + Math.random() });
    renderMessages();
}

function renderMessages() {
    const container = $('ai-messages');
    if (!container) return;

    if (aiPanel.history.length === 0) {
        container.innerHTML = `
            <div class="ai-welcome">
                <div class="welcome-icon"><span class="ai-sparkle-neon"></span></div>
                <h3>AI Resume Assistant</h3>
                <p>Attach context using <strong>+</strong>, then ask anything — rewrite bullets, add entries, tailor to a job, and more.</p>
            </div>
        `;
        renderContextStatus();
        return;
    }

    // Remove welcome if it exists
    const welcome = container.querySelector('.ai-welcome');
    if (welcome) welcome.remove();

    // Smart Render: Only add new elements or update existing ones
    aiPanel.history.forEach(item => {
        let el = document.getElementById(`history-item-${item.id}`);
        if (!el) {
            el = document.createElement('div');
            el.id = `history-item-${item.id}`;
            container.appendChild(el);
        }

        if (item.type === 'ctx') {
            const className = `ai-attachment-card ${item.ctxType}-card ${item.isSent ? 'is-sent' : ''}`;
            // Only update if something structural changed (like the sent status)
            if (el.className !== className) {
                el.className = className;
                el.innerHTML = `
                    <div class="ac-header">
                        <div class="ac-meta">
                            <span class="ac-type-tag">${item.ctxType.toUpperCase()}</span>
                            <span class="ac-label">${item.label}</span>
                        </div>
                        <div class="ac-actions">
                            <button class="ac-btn toggle" onclick="toggleContextDetails(${item.id})" title="Toggle Details">
                                <span class="ai-eye-icon"></span>
                            </button>
                            ${!item.isSent ? `<button class="ac-btn remove" onclick="removeContext(${item.id})" title="Remove Attachment">✕</button>` : ''}
                        </div>
                    </div>
                    <div class="ac-details" id="details-${item.id}">
                        <pre>${item.data}</pre>
                    </div>
                `;
            }
        } else {
            const roleLabel = item.role === 'user' ? 'You' : 'Gemini';
            el.className = `ai-msg ${item.role}`;
            // If it's a typing assistant message, don't overwrite its innerHTML 
            // if it's currently being handled by the typewriter interval
            if (item.role === 'assistant' && item.isTypewriting) {
                // Interval is handling it
            } else {
                el.innerHTML = `
                    <span class="ai-msg-role">${roleLabel}</span>
                    <div class="ai-msg-bubble">${formatMessageContent(item.content)}</div>
                `;
            }
        }
    });

    // Remove any DOM elements that are no longer in history
    const historyIds = aiPanel.history.map(h => `history-item-${h.id}`);
    Array.from(container.children).forEach(child => {
        if (child.id && child.id.startsWith('history-item-') && !historyIds.includes(child.id)) {
            child.remove();
        }
    });

    scrollToBottom();
    renderContextStatus();
}

function scrollToBottom(smooth = false, force = false) {
    const container = $('ai-messages');
    if (!container) return;

    // Sticky Scroll Logic: Only scroll if already at bottom or forced
    // Threshold of 100px to be considered "at bottom"
    const threshold = 100;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;

    if (force || isAtBottom) {
        if (smooth) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            container.scrollTop = container.scrollHeight;
        }
    }
}

function renderContextStatus() {
    const statusEl = $('ai-context-status');
    if (!statusEl) return;

    const unsentCount = aiPanel.history.filter(h => h.type === 'ctx' && !h.isSent).length;
    if (unsentCount > 0) {
        statusEl.innerHTML = `
            <span class="ai-sparkle-neon small"></span>
            ${unsentCount} ${unsentCount === 1 ? 'item' : 'items'} will be added in next prompt
        `;
        statusEl.classList.add('visible');
    } else {
        statusEl.classList.remove('visible');
    }
}

function getAttachmentIcon(type) {
    switch (type) {
        case 'resume': return '📄';
        case 'section': return '📋';
        case 'entry': return '✦';
        case 'job': return '💼';
        default: return '📎';
    }
}

function formatMessageContent(content) {
    // Basic markdown-like formatting for the mock AI
    return content
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

function showTypingIndicator() {
    const container = $('ai-messages');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'ai-msg assistant';
    el.id = 'ai-typing-msg';
    el.innerHTML = `
        <span class="ai-msg-role">✦ Gemini</span>
        <div class="ai-typing"><span></span><span></span><span></span></div>
    `;
    container.appendChild(el);
    scrollToBottom(false, true);
}

function removeTypingIndicator() {
    $('ai-typing-msg')?.remove();
}

// ── SEND MESSAGE ─────────────────────────────────────────────────────────────
async function sendAIMessage() {
    const input = $('ai-input');
    const text = input.value.trim();
    if (!text || aiPanel.isTyping) return;

    input.value = '';
    input.style.height = 'auto';

    // Commit current unsent context as "sent" before sending the message
    aiPanel.history.forEach(item => {
        if (item.type === 'ctx') item.isSent = true;
    });

    appendMessage('user', text);
    scrollToBottom(true, true);

    aiPanel.isTyping = true;
    $('ai-send-btn').disabled = true;
    showTypingIndicator();

    // Simulate AI thinking time (800–1800ms)
    const delay = 800 + Math.random() * 1000;
    await new Promise(r => setTimeout(r, delay));

    removeTypingIndicator();
    const response = aiPanel.getRandomMockResponse(text);

    // Typewriter effect
    await typewriterAppend('assistant', response);

    aiPanel.isTyping = false;
    $('ai-send-btn').disabled = false;
}

async function typewriterAppend(role, content) {
    const msgId = Date.now() + Math.random();
    aiPanel.history.push({ type: 'msg', role, content: '', id: msgId, isTypewriting: true });
    renderMessages();

    const container = $('ai-messages');
    let i = 0;

    return new Promise(resolve => {
        const timer = setInterval(() => {
            i += 2;
            const text = content.slice(0, i);

            // Update the message in the history data
            const historyItem = aiPanel.history.find(h => h.id === msgId);
            if (historyItem) historyItem.content = text;

            // Update the DOM element directly for performance and to keep scroll synced
            const el = document.getElementById(`history-item-${msgId}`);
            if (el) {
                const roleLabel = role === 'user' ? 'You' : 'Gemini';
                el.innerHTML = `
                    <span class="ai-msg-role">${roleLabel}</span>
                    <div class="ai-msg-bubble">${formatMessageContent(text)}</div>
                `;
            }

            scrollToBottom();

            if (i >= content.length) {
                clearInterval(timer);
                if (historyItem) {
                    historyItem.content = content;
                    historyItem.isTypewriting = false;
                }
                renderMessages(); // Final structural render
                resolve();
            }
        }, 16);
    });
}

// ── JD FILE UPLOAD ────────────────────────────────────────────────────────────
function handleJDUpload(input) {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const label = file.name.replace(/\.[^.]+$/, '');
        addContext('job', label, '', text);
    };
    reader.readAsText(file);
    // Reset so the same file can be re-selected
    input.value = '';
}

// ── PANEL INIT ─────────────────────────────────────────────────────────────
function initAIPanel() {
    // Populate job picker
    const picker = $('ai-job-picker');
    if (picker && window.sampleJobs) {
        picker.innerHTML = window.sampleJobs.map(j => `
            <div class="ai-job-option" onclick="setJobContext('${j.id}')">
                <div class="job-title">${j.title}</div>
                <div class="job-company">${j.company} · ${j.location}</div>
            </div>
        `).join('');
    }

    // Input auto-resize
    const input = $('ai-input');
    if (input) {
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 190) + 'px';
            scrollToBottom();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAIMessage();
            }
        });
    }

    // ResizeObserver to handle content height changes automatically
    const messages = $('ai-messages');
    if (messages) {
        new ResizeObserver(() => {
            scrollToBottom();
        }).observe(messages);
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.ai-plus-wrap') && !e.target.closest('#ai-job-picker-wrap')) {
            closeAllDropdowns();
        }
    });

    // Initial thread render
    renderMessages();
}

// Init after DOM ready (hooks into existing DOMContentLoaded flow)
document.addEventListener('DOMContentLoaded', initAIPanel);
