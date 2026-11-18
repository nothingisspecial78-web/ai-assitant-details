-- ==============================================================================
-- AI ASSISTANT KIT — ROW LEVEL SECURITY POLICIES
-- ==============================================================================

-- 1. CONVERSATIONS
ALTER TABLE assistant_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY assistant_conversations_user_isolation
ON assistant_conversations
FOR ALL
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- 2. MESSAGES
ALTER TABLE assistant_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY assistant_messages_user_isolation
ON assistant_messages
FOR ALL
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- 3. USER PROFILE
ALTER TABLE assistant_user_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY assistant_user_profile_isolation
ON assistant_user_profile
FOR ALL
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- 4. ACTION LOGS
ALTER TABLE assistant_action_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY assistant_action_logs_user_isolation
ON assistant_action_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);
