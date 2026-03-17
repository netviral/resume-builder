# Modern Resume Builder

A modular, dynamic resume builder that separates data from design. Build your resume in a browser-based editor and export it as professional PDF or JSON.

## 🚀 Features

- **Modular Architecture**: Clean separation between data (`data.js`), rendering logic, and themes.
- **Dynamic Editor**: Edit content directly on the page. Hover over sections or entries to see management controls.
- **Theme Support**: Quickly switch between different resume styles (Default Blue, Modern Dark).
- **Customizable Layout**: Adjust page margins and font sizes in real-time.
- **Local-First**: Loads data instantly via `data.js` without needing a local server (CORS-friendly).
- **Export Options**: Export your refined data as `.json` for backup or `.js` for direct usage.

## 📁 Repository Structure

```text
├── ibrahim_khalil_resume_editable.html  # Main Application Entry
├── data.js                             # Your Resume Data (JS format for local loading)
├── data.json                           # Your Resume Data (Standard JSON format)
├── src/
│   ├── js/
│   │   ├── renderer.js                 # Resume Rendering Engine
│   │   └── editor.js                   # Application State & Editor UI Logic
│   └── css/
│       ├── editor.css                  # UI Styles for the Builder interface
│       └── themes/
│           ├── default.css             # Classic Blue Theme
│           └── dark.css                # Modern Dark/Night Theme
```

## 🛠 Usage

1. **Open the App**: Simply open `ibrahim_khalil_resume_editable.html` in any modern browser.
2. **Toggle Edit Mode**: Click **✏ Edit Mode** in the top bar to start customizing.
3. **Manage Content**:
   - **Edit Text**: Click any text to edit.
   - **Manage Sections**: Hover over a section title to reveal the **✕** button.
   - **Add Sections**: Use the **+ add new section** button at the bottom and choose a category.
   - **Manage Entries**: Hover over job or education entries to reveal management buttons.
4. **Save Your Work**: 
   - Click **💾 Save JSON**.
   - Choose **Export data.js** and download it.
   - Replace the existing `data.js` in your folder with the new one.
5. **Print to PDF**: Click **↓ Export PDF** (or `Cmd/Ctrl + P`) and save as PDF.

## 🎨 Themes

You can find resume themes in `src/css/themes/`. To create a new theme:
1. Copy `default.css`.
2. Modify the colors and typography.
3. Add your new theme as an option in the `<select>` tag inside `ibrahim_khalil_resume_editable.html`.

---
Made with ❤️ by Ibrahim Khalil
