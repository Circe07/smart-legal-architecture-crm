# Archi-Legal CRM: Smart Omnichannel AI Backend

Archi-Legal is a next-generation Smart CRM designed specifically for architecture firms and legal professionals. It streamlines client communication by unifying multiple channels (WhatsApp and Email) into a single, AI-powered intelligence layer.

## 🚀 Key Features

- **Omnichannel Ingestion:** Native support for WhatsApp Cloud API and Email webhooks, unified into a single processing pipeline.
- **Asynchronous Workflow (Inngest):** All heavy AI operations are processed in the background, ensuring near-instant response times for webhooks and high reliability.
- **AI Triage & Analysis (Gemini 3):** Automated intent classification, urgency detection, and missing document identification powered by **Gemini 3 Flash** and **3.1 Pro**.
- **Local RAG (Zero-Hallucination):** A built-in, local semantic search engine (Vector DB) ensures the AI only responds based on verified firm knowledge (FAQs).
- **Smart Escalation:** Automatically differentiates between simple queries and complex legal cases, providing professionals with enriched summaries and priority alerts.

## 🏗️ Monorepo Architecture

- **`apps/web`**: Next.js 16 application (Dashboard, Case Timeline, and API Routes).
- **`packages/db`**: Persistent data layer with Prisma-like interface and local JSON-DB support.
- **`packages/core`**: The "Brain" containing Inngest functions, Gemini agents, and the local Vector Store.
- **`packages/domain`**: Shared TypeScript types and business logic schemas.

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **AI Orchestration:** Vercel AI SDK
- **LLMs:** Google Gemini 3 Flash / 3.1 Pro
- **Job Processing:** Inngest
- **Vector Search:** Local Pure-JS Vector Store (Zero-Native-Deps)
- **Database:** SQLite / JSON-DB (Prisma ready)
- **PackageManager:** pnpm

## 📦 Getting Started

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Configure environment:**
    Create a `.env` file in the root with:
    ```env
    DATABASE_URL="file:./dev.db"
    GOOGLE_GENERATIVE_AI_API_KEY="your-api-key"
    ```
4.  **Seed the Knowledge Base:**
    ```bash
    pnpm --filter @archi-legal/core run seed
    ```
5.  **Run in development:**
    ```bash
    pnpm dev
    ```

## 🛡️ License

Private - Archi-Legal Proprietary.
