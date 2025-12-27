import { Pool } from 'pg';

import { OllamaClient } from '../utils/ollama';

interface Chunk {
  id: number;
  document_id: number;
  content: string;
  chunk_index: number;
}

export class RAGService {
  private pool: Pool;
  private ollama: OllamaClient;

  constructor(pool: Pool, ollamaBaseUrl?: string) {
    this.pool = pool;
    this.ollama = new OllamaClient(ollamaBaseUrl);
  }

  async addDocument(title: string, content: string, metadata: Record<string, unknown> = {}): Promise<number> {
    const embedding = await this.ollama.generateEmbedding(content);

    const result = await this.pool.query(
      `INSERT INTO intelligence.documents (title, content, metadata, embedding)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [title, content, metadata, embedding]
    );

    const documentId = result.rows[0].id;

    await this.pool.query(
      'SELECT intelligence.create_document_chunks($1)',
      [documentId]
    );

    const chunks = await this.pool.query<Chunk>(
      'SELECT id, content FROM intelligence.chunks WHERE document_id = $1 ORDER BY chunk_index',
      [documentId]
    );

    for (const chunk of chunks.rows) {
      const chunkEmbedding = await this.ollama.generateEmbedding(chunk.content);
      await this.pool.query(
        'UPDATE intelligence.chunks SET embedding = $1 WHERE id = $2',
        [chunkEmbedding, chunk.id]
      );
    }

    return documentId;
  }

  async query(
    question: string,
    sessionId: string,
    contextLimit: number = 5
  ): Promise<string> {
    const questionEmbedding = await this.ollama.generateEmbedding(question);

    const result = await this.pool.query(
      `SELECT string_agg(content, E'\n\n') as context
       FROM intelligence.find_similar_chunks($1, $2)`,
      [questionEmbedding, contextLimit]
    );

    const context = result.rows[0].context;

    const response = await this.ollama.generateResponse(question, context);

    await this.pool.query(
      `INSERT INTO intelligence.chat_history (session_id, role, content)
       VALUES ($1, 'user', $2), ($1, 'assistant', $3)`,
      [sessionId, question, response]
    );

    return response;
  }

  async queryStreaming(
    question: string,
    sessionId: string,
    onChunk: (chunk: string) => void,
    contextLimit: number = 5
  ): Promise<void> {
    const questionEmbedding = await this.ollama.generateEmbedding(question);

    const result = await this.pool.query(
      `SELECT string_agg(content, E'\n\n') as context
       FROM intelligence.find_similar_chunks($1, $2)`,
      [questionEmbedding, contextLimit]
    );

    const context = result.rows[0].context;

    await this.pool.query(
      'INSERT INTO intelligence.chat_history (session_id, role, content) VALUES ($1, $2, $3)',
      [sessionId, 'user', question]
    );

    let fullResponse = '';
    
    await this.ollama.generateStreamingResponse(
      question,
      (chunk) => {
        onChunk(chunk);
        fullResponse += chunk;
      },
      context
    );

    await this.pool.query(
      'INSERT INTO intelligence.chat_history (session_id, role, content) VALUES ($1, $2, $3)',
      [sessionId, 'assistant', fullResponse]
    );
  }

  async getChatHistory(sessionId: string, limit: number = 10): Promise<Array<{ role: string; content: string }>> {
    const result = await this.pool.query(
      `SELECT role, content
       FROM intelligence.chat_history
       WHERE session_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [sessionId, limit]
    );

    return result.rows.reverse();
  }
}
