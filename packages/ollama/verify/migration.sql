-- Verify ollama:migration on pg

BEGIN;

SELECT 1/COUNT(*) FROM information_schema.schemata WHERE schema_name = 'intelligence';
SELECT 1/COUNT(*) FROM information_schema.tables WHERE table_schema = 'intelligence' AND table_name = 'documents';
SELECT 1/COUNT(*) FROM information_schema.tables WHERE table_schema = 'intelligence' AND table_name = 'chunks';
SELECT 1/COUNT(*) FROM information_schema.routines WHERE routine_schema = 'intelligence' AND routine_name = 'create_document_chunks';
SELECT 1/COUNT(*) FROM information_schema.routines WHERE routine_schema = 'intelligence' AND routine_name = 'find_similar_chunks';

ROLLBACK;
