-- Update match_documents RPC to filter by user_id

-- Drop the existing function
DROP FUNCTION IF EXISTS match_documents(vector(1536), int);

-- Create updated match_documents function with user filter
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  content text,
  document_id uuid,
  title text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.content,
    d.id,
    d.title,
    1 - (d.embedding <=> query_embedding) as similarity
  FROM documents d
  WHERE
    (p_user_id IS NULL AND d.user_id IS NULL) -- demo mode: only demo docs
    OR
    d.user_id = p_user_id -- logged-in: only user's docs
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
