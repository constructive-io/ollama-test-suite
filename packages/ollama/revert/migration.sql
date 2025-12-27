-- Revert ollama:migration from pg

BEGIN;

DROP FUNCTION IF EXISTS intelligence.find_similar_chunks(VECTOR(4096), INTEGER, FLOAT);
DROP FUNCTION IF EXISTS intelligence.create_document_chunks(INTEGER, INTEGER, INTEGER);
DROP TABLE IF EXISTS intelligence.chunks;
DROP TABLE IF EXISTS intelligence.documents;
DROP SCHEMA IF EXISTS intelligence;

COMMIT;
