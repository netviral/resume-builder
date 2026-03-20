/**
 * Creative-focused Resume Data (JSON Resume Schema)
 */
window.resumeDataResCreative = {
    "basics": {
        "name": "Ibrahim Khalil",
        "label": "UI/UX Designer & Frontend Developer",
        "email": "ibrahim.khalil_ug25@ashoka.edu.in",
        "summary": "Creative developer with a focus on visual excellence and premium user experiences. Expert in CSS, motion design, and building interactive interfaces that delight users."
    },
    "work": [
        {
            "name": "Creative Labs",
            "position": "UI Designer",
            "startDate": "2024-05-01",
            "endDate": "",
            "highlights": [
                "Designed and launched 10+ high-traffic websites with a focus on accessibility and modern aesthetics.",
                "Created a comprehensive design system adopted by 3 cross-functional teams, reducing design-to-dev time by 30%.",
                "Winner of 2 internal awards for UX innovation and design consistency."
            ]
        },
        {
            "name": "Freelance Design",
            "position": "Visual Designer",
            "startDate": "2021-01-01",
            "highlights": [
                "Partnered with 5 startups to build their initial brand identity and landing pages.",
                "Specialized in high-conversion Figma mockups and high-fidelity prototypes."
            ]
        }
    ],
    "skills": [
        { "name": "Design Tools", "keywords": ["Figma", "Adobe XD", "Illustrator", "Photoshop", "After Effects"] },
        { "name": "Core Tech", "keywords": ["HTML5", "CSS3/SASS", "JavaScript", "GSAP", "Three.js", "Tailwind CSS"] }
    ],
    "meta": {
        "settings": { "marginX": 3.0, "marginY": 2.0, "fontSize": 13, "theme": "milan" },
        "sections": [
            { "id": "s1", "title": "Profile", "type": "paragraph", "source": "basics.summary" },
            { "id": "s2", "title": "Experience", "type": "detailed_list", "source": "work" },
            { "id": "s3", "title": "Design & Frontend Skills", "type": "key_value_grid", "source": "skills" }
        ]
    }
};
