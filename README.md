# Deal One Pager App

A React + Node.js application for producing professional **Deal One Pagers** with a multi-level approval workflow, AI-assisted document extraction, and Azure deployment.

---

## Features

- **Markdown Upload** – Drag-and-drop or browse to upload a `.md` file
- **AI Document Extraction** – Upload any document (PDF, Word, text) and let Azure AI Foundry extract deal fields
- **Editable Form** – Every field is fully editable; user is always in control
- **Live Preview** – See exactly how the PDF will look before downloading
- **PDF Export** – One-click download of a clean, professional A4 PDF
- **Multi-Level Approval** – Submit deals for manager → director approval chain
- **Versioned Archive** – Approved deals get a sequential number (DOP-2026-0001) with date and approver info stored in Azure Blob Storage
- **Azure Entra ID Auth** – Corporate SSO login

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│  Frontend (React + Vite) — Azure Container Apps        │
│  Upload → AI Suggestions → Edit → Submit → Approve    │
└───────────────────────┬────────────────────────────────┘
                        │ REST API (Bearer token)
┌───────────────────────▼────────────────────────────────┐
│  Backend (Node.js + Express) — Azure Container Apps    │
│  /api/deals, /api/deals/:id/submit, /api/ai/extract   │
└────┬──────────────┬─────────────────┬──────────────────┘
     │              │                 │
┌────▼────┐   ┌────▼────┐     ┌──────▼──────┐
│  Blob   │   │  Table  │     │ Azure AI    │
│ Storage │   │ Storage │     │ Foundry     │
│ (PDFs)  │   │ (meta)  │     │ (GPT + Doc) │
└─────────┘   └─────────┘     └─────────────┘
```

---

## Tech Stack

| Layer | Library |
|-------|---------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Auth | Azure Entra ID (MSAL) |
| Backend | Node.js + Express 5 |
| Storage | Azure Blob Storage + Table Storage |
| AI | Azure AI Foundry (Document Intelligence + GPT-4o) |
| PDF | jspdf + html2canvas |
| Infra | Bicep → Azure Container Apps |

---

## Getting Started

### Prerequisites

- Node.js ≥ 22
- npm ≥ 10
- Azure subscription (for backend services)
- Azure Entra ID app registration

### Installation

```bash
git clone https://github.com/schneutzi-81/DealOnePagerApp.git
cd DealOnePagerApp

# Frontend
npm install

# Backend
cd backend
npm install
```

### Environment Setup

```bash
# Frontend
cp .env.example .env
# Edit .env with your Entra ID tenant/client IDs

# Backend
cd backend
cp .env.example .env
# Edit backend/.env with Azure credentials
```

### Running in development

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Building for production

```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
```

### Deploying to Azure

```bash
# Deploy infrastructure
az deployment group create \
  --resource-group your-rg \
  --template-file infra/main.bicep \
  --parameters @infra/parameters.json

# Build and push container images, then update Container Apps
```

---

## Approval Workflow

1. User creates/edits a deal (status: `draft`)
2. User clicks "Submit for Approval" → status: `pending_level_1`
3. Level 1 approver (Manager) approves → status: `pending_level_2`
4. Level 2 approver (Director) approves → status: `approved`
   - Deal gets sequential number: `DOP-2026-0001`
   - PDF snapshot saved to Blob Storage
   - Approval chain recorded (who, when, decision)
5. If rejected at any level → status: `rejected` (user can edit and resubmit)

---

## Project Structure

```
├── src/                    # Frontend (React)
│   ├── components/         # UI components
│   ├── services/           # API client + auth
│   ├── utils/              # Markdown parser, PDF export
│   └── types/              # TypeScript types
├── backend/                # Backend API (Node.js)
│   └── src/
│       ├── routes/         # Express routes (deals, approval, ai)
│       ├── services/       # Azure Storage + AI services
│       ├── middleware/     # Auth + error handling
│       └── models/         # Zod schemas
├── infra/                  # Azure Bicep templates
├── Dockerfile              # Frontend container
├── backend/Dockerfile      # Backend container
└── nginx.conf              # Frontend nginx config
```

---

## License

MIT
