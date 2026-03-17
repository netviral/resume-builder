/**
 * Resume Section Schema Definitions
 * Defines the structure, default data, and rendering rules for abstract section types.
 */

window.sectionSchema = {
    "detailed_list": {
        "name": "Detailed List",
        "description": "Block with heading, date, role/subheading, and optional bullet points.",
        "itemKey": "entries",
        "defaultItem": {
            "organization": "Heading",
            "date": "Date",
            "role": "Subheading",
            "bullets": ["New bullet point"]
        },
        "hasBullets": true
    },
    "table_3col": {
        "name": "3-Column Table",
        "description": "Tabular layout with three columns (e.g., for Education).",
        "itemKey": "entries",
        "defaultItem": {
            "institution": "Column 1 (Left)",
            "details": "Column 2 (Center)",
            "date": "Column 3 (Right)"
        },
        "hasBullets": false
    },
    "simple_list": {
        "name": "Simple List",
        "description": "Block with heading, tag/subheading, and description (no bullets).",
        "itemKey": "entries",
        "defaultItem": {
            "name": "Heading",
            "tag": "Subheading/Tag",
            "description": "Basic description text..."
        },
        "hasBullets": false
    },
    "key_value_grid": {
        "name": "Key-Value Grid",
        "description": "Categorized items in a grid (e.g., Technical Skills).",
        "itemKey": "items",
        "defaultItem": {
            "label": "Category",
            "value": "Value 1, Value 2"
        },
        "hasBullets": false
    },
    "bullet_grid": {
        "name": "Bullet Grid",
        "description": "Two-column list of bullet points (e.g., Languages, Interests).",
        "itemKey": "bullets",
        "defaultItem": "New list item",
        "hasBullets": true
    },
    "paragraph": {
        "name": "Paragraph",
        "description": "A simple standalone block of text.",
        "itemKey": "content",
        "defaultItem": "", // Paragraph section has a direct "content" string usually, or array of strings
        "isSingleText": true
    }
};
