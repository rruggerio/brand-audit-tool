# Brand Compliance Auditing Tool

A comprehensive web-based agentic experience for evaluating website adherence to brand guidelines and design system usage.

## Features

- **Brand Guidelines Management**
  - Upload and parse PDF brand guidelines
  - Integration with IBM Brand Guidelines
  - IBM Carbon Design System validation

- **Multi-Dimensional Analysis**
  - Visual compliance (colors, fonts, spacing, images)
  - Component usage validation
  - Content/messaging tone analysis
  - Accessibility (WCAG) compliance checking

- **AI-Powered Evaluation**
  - OpenAI GPT-4 Vision for visual analysis
  - Claude for detailed content and compliance analysis
  - Intelligent pattern recognition

- **Flexible Reporting**
  - Interactive dashboard with compliance scores
  - Detailed page-by-page reports
  - Exportable PDF and CSV reports
  - Issue tracking with screenshots

## Technology Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, TypeScript, IBM Carbon Design System
- **Database**: PostgreSQL
- **AI Services**: OpenAI GPT-4 Vision, Anthropic Claude
- **Web Crawling**: Puppeteer
- **PDF Processing**: pdf-parse

## Project Structure

```
brand-audit-tool/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
├── shared/
│   └── types/
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- OpenAI API Key
- Anthropic API Key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Set up environment variables (see `.env.example`)
4. Run database migrations
5. Start the development servers:
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   ```

## Usage

1. Upload brand guidelines PDF or configure IBM Brand settings
2. Enter target URL for analysis
3. Select analysis preferences (visual, component, content, accessibility)
4. Run audit
5. Review results in dashboard
6. Export reports as needed

## License

MIT