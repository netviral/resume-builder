/**
 * Available Resumes Metadata
 * Links to global variables defined in data.js, data-engineering.js, and data-creative.js
 */
window.availableResumes = [
    {
        id: 'primary',
        name: 'Product & Systems',
        shortName: 'Product',
        icon: '🚀',
        lastModified: '2026-03-20',
        color: '#1a3fa0',
        getData: () => window.resumeDataRes
    },
    {
        id: 'engineering',
        name: 'Software Engineer',
        shortName: 'Engine',
        icon: '💻',
        lastModified: '2026-03-15',
        color: '#166534',
        getData: () => window.resumeDataResEngineering
    },
    {
        id: 'creative',
        name: 'Design & UI',
        shortName: 'Design',
        icon: '🎨',
        lastModified: '2026-03-10',
        color: '#c0392b',
        getData: () => window.resumeDataResCreative
    }
];
