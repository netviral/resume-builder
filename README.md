# Modern Resume Builder

A modular, dynamic resume builder that separates data from design. Build your resume in a browser-based editor and export it as professional PDF or JSON.

## 🚀 Features

- **Schema-Driven Architecture**: All sections are abstract layouts (Lists, Tables, Grids, Paragraphs). The editor doesn't care if a section is "Education" or "Experience"—it just knows the layout.
- **Dynamic Editor**: Edit content directly on the page. Hover over sections or entries to see management controls.
- **Undo/Redo Support**: Full history management for all edits.
- **Theme Support**: Professional themes with consistent global layout.
- **Customizable Layout**: Adjust page margins and font sizes in real-time.
- **Export Options**: Export your data as `.json` or `.js`.

## 📁 Repository Structure

```text
├── ibrahim_khalil_resume_editable.html  # Main Application Entry
├── data.js                             # Your Resume Data (JS format)
├── src/
│   ├── js/
│   │   ├── schema.js                   # THE SCHEMA: Defines all section types and layouts
│   │   ├── renderer.js                 # Rendering Engine (Uses schema)
│   │   └── editor/                     # Modular Editor Logic
│   │       ├── state.js                # State & Undo/Redo
│   │       ├── core.js                 # Keyboard shortcuts & Toggle
│   │       ├── settings.js             # Margins & Themes
│   │       ├── sections-crud.js        # Add/Remove/Move Sections
│   │       └── entries-crud.js         # Add/Remove/Edit items inside sections
│   └── css/
│       ├── editor/                     # Editor Interface Styles
│       └── themes/                     # Resume Design Themes
```

## 🛠 Usage

1. **Open the App**: Simply open `ibrahim_khalil_resume_editable.html`.
2. **Toggle Edit Mode**: Click **✏ Edit Mode** to start customizing.
3. **Manage Content**:
   - **Edit Text**: Click any text to edit.
   - **Add Sections**: Use the **+ add new section** button. It will show generic options like "3-Column Table" or "Detailed List".
   - **Undo/Redo**: Use `Cmd+Z` / `Cmd+Shift+Z` or `Ctrl+Z` / `Ctrl+Y`.
4. **Export**: Use the toolbar to save your progress or print to PDF.

## 📖 Schema & Customization

The builder is designed to be infinitely extensible. To add a new type of resume section, simply define it in `src/js/schema.js`. 

Read **[SCHEMA.md](./SCHEMA.md)** for a deep dive into how section types work.

---
Made with ❤️ by Ibrahim Khalil
