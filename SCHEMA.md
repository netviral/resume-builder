# Resume Section Schema

The Resume Builder uses an **abstract schema** to define how data is rendered and edited. Instead of hardcoding categories like "Education" or "Skills", we define **Generic Layout Types**.

## How it works

Each section in `data.js` has a `type`. This type is looked up in `src/js/schema.js` to determine:
1.  **Rendering**: Which HTML structure to use.
2.  **CRUD Rules**: What happens when you click "Add Entry".
3.  **UI Controls**: Whether to show bullet management buttons.

---

## Defining a Section Type

Example from `src/js/schema.js`:

```javascript
"detailed_list": {
    "name": "Detailed List",
    "description": "Block with heading, date, role/subheading, and bullet points.",
    "itemKey": "entries",
    "defaultItem": {
        "organization": "Heading",
        "date": "Date",
        "role": "Subheading",
        "bullets": ["New bullet point"]
    },
    "hasBullets": true
}
```

### Schema Properties

| Property | Description |
| :--- | :--- |
| `name` | The name shown in the "Add Section" modal. |
| `description` | A brief explanation shown in the modal. |
| `itemKey` | The key in the section object that holds the array of items (e.g., `entries`, `items`, or `bullets`). |
| `defaultItem` | The template used when clicking "+ Add Entry". |
| `hasBullets` | If true, the editor will show "Add Bullet" controls for each entry. |
| `isSingleText` | If true, the section is a single block of text (like a paragraph) rather than an array of items. |

---

## Current Abstract Types

Currently implemented types in the renderer:

1.  **`detailed_list`**: (Formerly Experience) Header + Date + Subheader + Bullets.
2.  **`table_3col`**: (Formerly Education) A clean 3-column table.
3.  **`simple_list`**: (Formerly Ventures) Header + Subheader + Description (No bullets).
4.  **`key_value_grid`**: (Formerly Technical Skills) A grid of `Bold: Text` pairs.
5.  **`bullet_grid`**: (Formerly Languages/Interests) A 2-column list of simple bullets.
6.  **`paragraph`**: (Formerly Summary) A simple block of free-form text.

## Adding a New Type

To add a new section type:
1.  Add a new entry to the `sectionSchema` object in `src/js/schema.js`.
2.  Add a corresponding `else if (type === 'your_new_type')` block in `src/js/renderer.js` inside the `renderSectionContent` function.
3.  The editor's CRUD operations (`entries-crud.js`) will automatically pick up the new type's structure.

---
