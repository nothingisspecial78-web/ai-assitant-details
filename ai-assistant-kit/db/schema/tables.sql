-- ==============================================================================
-- AI ASSISTANT KIT — CORE DATABASE SCHEMA
-- ==============================================================================
-- Idempotent schema creating all tables needed for conversations, messages,
-- user preferences, audit logging, action confirmations, and vector embeddings.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CONVERSATION SESSIONS
CREATE TABLE IF NOT EXISTS assistant_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  app_id TEXT NOT NULL DEFAULT 'default-app',
  title TEXT NOT NULL DEFAULT 'New Conversation',
  summary TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistant_conv_user ON assistant_conversations (user_id, updated_at DESC);

-- 2. MESSAGES
CREATE TABLE IF NOT EXISTS assistant_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistant_msgs_conv ON assistant_messages (conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_assistant_msgs_user ON assistant_messages (user_id);

-- 3. USER PREFERENCES & CHIP USAGE
CREATE TABLE IF NOT EXISTS assistant_user_profile (
  user_id TEXT PRIMARY KEY,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  answer_style TEXT NOT NULL DEFAULT 'concise',
  notes_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assistant_chip_usage (
  user_id TEXT NOT NULL,
  page_id TEXT NOT NULL,
  chip_id TEXT NOT NULL,
  shown_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  last_clicked_at TIMESTAMPTZ NULL,
  PRIMARY KEY (user_id, chip_id, page_id)
);

-- 4. AUDIT & ACTION CONFIRMATION LOGS
CREATE TABLE IF NOT EXISTS assistant_audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  scope JSONB NOT NULL DEFAULT '{}'::jsonb,
  tool TEXT NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistant_audit_user ON assistant_audit_logs (user_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS assistant_action_logs (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  risk TEXT NOT NULL CHECK (risk IN ('read', 'write')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'executed', 'failed', 'undone', 'cancelled')),
  summary TEXT NOT NULL,
  args JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_at TIMESTAMPTZ NULL
);

-- 5. KNOWLEDGE CHUNKS & VECTOR EMBEDDINGS (1536 dims)
CREATE TABLE IF NOT EXISTS assistant_chunks (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  source TEXT NOT NULL,
  heading TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  token_count INTEGER NOT NULL DEFAULT 0,
  visibility TEXT NOT NULL DEFAULT 'all',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistant_chunks_embedding 
ON assistant_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
