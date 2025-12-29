# ollama

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/.github/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/ollama-test-suite/actions/workflows/ci.yaml">
    <img height="20" src="https://github.com/constructive-io/ollama-test-suite/actions/workflows/ci.yaml/badge.svg" />
  </a>
   <a href="https://www.npmjs.com/package/ollama"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/ollama-test-suite?filename=packages%2Follama%2Fpackage.json"/></a>
</p>

A PostgreSQL module for RAG (Retrieval-Augmented Generation) with Ollama and pgvector. Provides document storage, automatic chunking, vector embeddings, and semantic similarity search.

## Features

- **Document Storage**: Store documents with metadata and vector embeddings
- **Automatic Chunking**: Split documents into overlapping chunks for better retrieval
- **Vector Search**: Find semantically similar content using pgvector's cosine distance
- **RAG Service**: Complete TypeScript service for document ingestion and querying
- **Ollama Client**: API client supporting embeddings and text generation (sync/streaming)

## Schema

The module creates an `intelligence` schema with:

- `documents` - Full documents with title, content, metadata, and embedding
- `chunks` - Document chunks with embeddings for granular retrieval
- `find_similar_chunks()` - Function for semantic similarity search
- `create_document_chunks()` - Function for automatic document chunking

## Developing

```sh
# Install dependencies
pnpm install

# Run tests (requires Ollama running with nomic-embed-text and mistral models)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Deploy to a database
pgpm deploy --database your_db --createdb --yes
```

## Exports

```typescript
import { OllamaClient, RAGService } from 'ollama';

// Low-level Ollama API client
const ollama = new OllamaClient();
const embedding = await ollama.generateEmbedding('text');
const response = await ollama.generateResponse('prompt', 'context');

// High-level RAG service
const rag = new RAGService(pool);
await rag.addDocument('title', 'content');
const answer = await rag.query('question', 'session-id');
```

## Credits

**🛠 Built by the [Constructive](https://constructive.io) team — creators of modular Postgres tooling for secure, composable backends. If you like our work, contribute on [GitHub](https://github.com/constructive-io).**

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
