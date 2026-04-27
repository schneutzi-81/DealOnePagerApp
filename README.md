# Deal One Pager App

A client-side React application that helps you produce a professional **Deal One Pager** for RFP (Request for Proposal) reviews — with zero backend required.

---

## Features

- **Markdown Upload** – Drag-and-drop or browse to upload a `.md` file
- **Auto-fill Fields** – Headings in the markdown are fuzzy-matched to deal fields and the content under each heading populates the corresponding field automatically
- **Editable Form** – Every field is fully editable before export
- **Live Preview** – See exactly how the PDF will look before downloading
- **PDF Export** – One-click download of a clean, professional A4 PDF

---

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 |
| Markdown parsing | `marked` |
| PDF generation | `jspdf` + `html2canvas` |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
git clone https://github.com/schneutzi-81/DealOnePagerApp.git
cd DealOnePagerApp
npm install
```

### Running in development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for production

```bash
npm run build
npm run preview
```

---

## Usage

1. **Open the app** in your browser.
2. **Upload a Markdown file** using the drag-and-drop zone or the "Browse Files" button.
   - A `sample.md` file is included in the project root as a starting point.
3. **Review the auto-filled fields** in the "Edit Fields" tab and make any adjustments.
4. **Switch to the "Preview" tab** to see how the PDF will look.
5. **Click "Export PDF"** in the top-right corner to download the one-pager.

---

## Markdown Format

The parser maps `#` and `##` headings (case-insensitive, fuzzy-matched) to the
following fields:

| Field | Example Heading |
|-------|----------------|
| Deal / Project Name | `# Project Alpha` |
| Client Name | `## Client Name` |
| Date | `## Date` |
| Deal Owner / Lead | `## Deal Owner / Lead` |
| Deal Size / Value | `## Deal Size / Value` |
| Timeline / Duration | `## Timeline / Duration` |
| Executive Summary | `## Executive Summary` |
| Scope of Work | `## Scope of Work` |
| Key Deliverables | `## Key Deliverables` |
| Pricing Overview | `## Pricing Overview` |
| Key Risks & Mitigations | `## Key Risks & Mitigations` |
| Team / Resources | `## Team / Resources` |
| Next Steps | `## Next Steps` |
| Notes / Comments | `## Notes / Comments` |

Content under headings that cannot be matched is automatically placed in **Notes / Comments**.

See [`sample.md`](./sample.md) for a full example.

---

## Project Structure

```
src/
  components/
    MarkdownUploader.tsx   # Drag-and-drop file upload
    DealForm.tsx           # Editable form for all fields
    PDFPreview.tsx         # Visual preview of the one-pager
  utils/
    markdownParser.ts      # Markdown → fields mapping
    pdfExport.ts           # PDF generation via jspdf + html2canvas
  types/
    index.ts               # Shared TypeScript types and constants
  App.tsx                  # Root application component
  main.tsx                 # Entry point
sample.md                  # Example markdown input file
```

---

## License

MIT
