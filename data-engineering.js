/**
 * Engineering-focused Resume Data (JSON Resume Schema)
 */
window.resumeDataResEngineering = {
    "basics": {
        "name": "Ibrahim Khalil",
        "label": "Full Stack Software Engineer",
        "email": "ibrahim.khalil_ug25@ashoka.edu.in",
        "summary": "Experienced Full Stack Engineer specializing in React, Node.js, and Distributed Systems. Passionate about building scalable, high-performance applications with a focus on system reliability."
    },
    "work": [
        {
            "name": "Tech Solutions Inc.",
            "position": "Senior Software Engineer",
            "startDate": "2023-01-01",
            "endDate": "",
            "highlights": [
                "Architected and implemented a microservices-based backend handling 50k+ requests per minute.",
                "Led migration of legacy monolith to React/Next.js frontend, improving page load speed by 40%.",
                "Reduced infrastructure costs by 25% through optimized AWS RDS and EC2 usage."
            ]
        },
        {
            "name": "OpenSource Contributor",
            "position": "Maintainer",
            "startDate": "2022-06-01",
            "highlights": [
                "Contributed to several popular GitHub repositories, focusing on performance optimizations and bug fixes in core libraries.",
                "Authored 5+ utility libraries now used by hundreds of developers."
            ]
        }
    ],
    "education": [
        {
            "name": "Ashoka University",
            "institution": "Ashoka University",
            "area": "B.Sc Computer Science",
            "startDate": "2022-01-01",
            "endDate": "2026-01-01"
        }
    ],
    "skills": [
        { "name": "Languages", "keywords": ["JavaScript", "TypeScript", "Python", "Go", "Rust", "C++"] },
        { "name": "Frameworks", "keywords": ["React", "Next.js", "Node.js", "Express", "GraphQL", "Koa"] },
        { "name": "Infrastructure", "keywords": ["AWS", "Docker", "Kubernetes", "CI/CD", "Redis", "PostgreSQL"] }
    ],
    "meta": {
        "settings": { "marginX": 2.0, "marginY": 1.0, "fontSize": 11, "theme": "toronto" },
        "sections": [
            { "id": "s1", "title": "Summary", "type": "paragraph", "source": "basics.summary" },
            { "id": "s2", "title": "Work Experience", "type": "detailed_list", "source": "work" },
            { "id": "s3", "title": "Education", "type": "detailed_list", "source": "education" },
            { "id": "s4", "title": "Technical Skills", "type": "key_value_grid", "source": "skills" }
        ]
    }
};
