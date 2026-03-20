/**
 * Resume Section Schema Definitions
 * Defines the structure, default data, and rendering rules for abstract section types.
 */

window.sectionSchema = {
    "detailed_list": {
        "name": "Detailed List",
        "description": "Block with heading, date, sub-heading, and optional bullet points.",
        "itemKey": "entries",
        "defaultItem": {
            "heading": "Heading",
            "date": "Date",
            "subheading": "Sub-heading",
            "bullets": ["New bullet point"]
        },
        "hasBullets": true,
        "allowAI": true // Fully allowed
    },
    "table_3col": {
        "name": "3-Column Table",
        "description": "Tabular layout with three columns (e.g., for Education or Awards).",
        "itemKey": "entries",
        "defaultItem": {
            "col1": "Column 1",
            "col2": "Column 2",
            "col3": "Column 3"
        },
        "hasBullets": false,
        "allowAI": false // Not allowed (e.g., Education/Awards often shouldn't be hallucinations)
    },
    "simple_list": {
        "name": "Simple List",
        "description": "Block with heading, sub-heading, and description (no bullets).",
        "itemKey": "entries",
        "defaultItem": {
            "heading": "Heading",
            "subheading": "Sub-heading",
            "description": "Description text..."
        },
        "hasBullets": false,
        "allowAI": true
    },
    "key_value_grid": {
        "name": "Key-Value Grid",
        "description": "Categorized items in a grid (e.g., Technical Skills).",
        "itemKey": "items",
        "defaultItem": {
            "label": "Category",
            "value": "Value 1, Value 2"
        },
        "hasBullets": false,
        "allowAI": false // Generally fixed skills lists
    },
    "bullet_grid": {
        "name": "Bullet Grid",
        "description": "Two-column list of bullet points (e.g., Languages, Interests).",
        "itemKey": "items",
        "defaultItem": "New list item",
        "hasBullets": true,
        "allowAI": true
    },
    "comma_list": {
        "name": "Comma Separated List",
        "description": "Inline items separated by commas (ideal for subjects or raw skills).",
        "itemKey": "items",
        "defaultItem": "New Item",
        "hasBullets": false,
        "allowAI": true
    },
    "paragraph": {
        "name": "Paragraph",
        "description": "A simple standalone block of text.",
        "itemKey": "content",
        "defaultItem": "New paragraph text...",
        "isSingleText": true,
        "hideTitle": true,
        "allowAI": true // Summaries are great for AI
    }
};
