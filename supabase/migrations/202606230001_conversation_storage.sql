-- Simplified Conversation Storage for MVP
-- This migration creates tables for conversation management, message storage,
-- model preferences, and imported conversation histories

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model_used TEXT,
  tokens INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0.000000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Model preferences table
CREATE TABLE IF NOT EXISTS model_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_models TEXT[] NOT NULL DEFAULT ARRAY['google/gemma-7b-it:free', 'meta-llama/llama-3-8b-instruct:free', 'mistralai/mistral-7b-instruct:free']::TEXT[],
  spending_cap DECIMAL(10, 2) DEFAULT 10.00,
  allow_paid_models BOOLEAN NOT NULL DEFAULT false,
  current_spend DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Imported conversation histories table
CREATE TABLE IF NOT EXISTS imported_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_platform TEXT NOT NULL,
  raw_data JSONB NOT NULL,
  message_count INTEGER DEFAULT 0,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS imported_histories_user_id_idx ON imported_histories(user_id, imported_at DESC);

-- Enable RLS on new tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_histories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- RLS Policies for model_preferences
CREATE POLICY "Users can view own model preferences"
  ON model_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own model preferences"
  ON model_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own model preferences"
  ON model_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for imported_histories
CREATE POLICY "Users can view own imported histories"
  ON imported_histories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own imported histories"
  ON imported_histories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own imported histories"
  ON imported_histories FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update conversation updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update conversation timestamp when messages are added
CREATE TRIGGER trigger_update_conversation_updated_at
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- Function to update model_preferences updated_at timestamp
CREATE OR REPLACE FUNCTION update_model_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update model_preferences timestamp
CREATE TRIGGER trigger_update_model_preferences_updated_at
  BEFORE UPDATE ON model_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_model_preferences_updated_at();
