# ollama-test-suite

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/.github/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/ollama-test-suite/actions/workflows/ci.yaml">
    <img height="20" src="https://github.com/constructive-io/ollama-test-suite/actions/workflows/ci.yaml/badge.svg" />
  </a>
</p>

A reference implementation demonstrating Ollama integration with PostgreSQL and pgvector for building Retrieval-Augmented Generation (RAG) pipelines. This project showcases how to combine local LLMs with vector databases for semantic search and AI-powered document retrieval.

## What's Included

This test suite demonstrates a complete RAG pipeline with the following components:

**Ollama Integration**: A TypeScript client (`OllamaClient`) for interacting with Ollama's API, supporting embedding generation with `nomic-embed-text` and text generation with `mistral`. Includes both synchronous and streaming response modes.

**Vector Database with pgvector**: PostgreSQL schema using pgvector for storing and querying document embeddings. Documents are automatically chunked with configurable overlap, and similarity search uses cosine distance for semantic retrieval.

**RAG Service**: A complete `RAGService` class that orchestrates document ingestion, embedding generation, semantic search, and LLM-powered response generation with chat history tracking.

**CI/CD Pipeline**: GitHub Actions workflow that provisions pgvector-enabled PostgreSQL and Ollama services, pulls required models, and runs integration tests automatically.

## Architecture

The system uses a document chunking strategy where content is split into overlapping segments for better retrieval accuracy. Each chunk is embedded using Ollama's `nomic-embed-text` model (768 dimensions) and stored in PostgreSQL with pgvector. Queries are embedded and matched against chunks using cosine similarity, with the most relevant context passed to the LLM for response generation.

```
Document → Chunking → Embedding → pgvector Storage
                                        ↓
Query → Embedding → Similarity Search → Context Retrieval → LLM Response
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Docker
- PostgreSQL client tools (`psql`)
- pgpm (`npm install -g pgpm`)
- Ollama (for local development)

### Quick Start

```sh
# Install dependencies
pnpm install

# Start PostgreSQL with pgvector (requires Docker)
pgpm docker start

# Load environment variables
eval "$(pgpm env)"

# Start Ollama and pull required models
ollama serve &
ollama pull nomic-embed-text
ollama pull mistral

# Run tests
cd packages/ollama
pnpm test
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OLLAMA_HOST` | Ollama API endpoint | `http://localhost:11434` |
| `PGHOST` | PostgreSQL host | `localhost` |
| `PGPORT` | PostgreSQL port | `5432` |
| `PGUSER` | PostgreSQL user | `postgres` |
| `PGPASSWORD` | PostgreSQL password | - |

## Package Structure

```
packages/ollama/
├── src/
│   ├── utils/ollama.ts      # Ollama API client
│   └── services/rag.service.ts  # RAG orchestration service
├── deploy/
│   └── migration.sql        # pgvector schema (documents, chunks, similarity search)
└── __tests__/
    ├── pgvector.test.ts     # Vector search integration tests
    └── rag.test.ts          # Full RAG pipeline tests with performance logging
```

## Usage Example

```typescript
import { Pool } from 'pg';
import { RAGService } from 'ollama';

const pool = new Pool();
const rag = new RAGService(pool);

// Add a document (automatically chunks and embeds)
const docId = await rag.addDocument(
  'My Document Title',
  'Long document content...',
  { source: 'manual' }
);

// Query with RAG
const response = await rag.query(
  'What does the document say about X?',
  'session-123'
);
```

## Note on Embeddings

Embeddings are generated at the application layer rather than via database triggers. This design choice avoids coupling database transactions to external HTTP calls, which can cause performance issues and transaction failures. For production use cases requiring automatic embedding updates, consider implementing an async job queue that processes new/updated documents outside the transaction boundary.

## Credits

**🛠 Built by the [Constructive](https://constructive.io) team — creators of modular Postgres tooling for secure, composable backends. If you like our work, contribute on [GitHub](https://github.com/constructive-io).**

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
